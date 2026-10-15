/**
 * Drawing-request queue for the `/draw-requests` Claude Code command.
 *
 *   npm run drawings -- list            show waiting requests
 *   npm run drawings -- export          save waiting photos + requests.json to drawing-requests/
 *   npm run drawings -- done <id> <key> mark a request drawn with registry key <key>
 *
 * Uses DATABASE_URL from .env. Point it at the production database to work on
 * the seller's real requests.
 */
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { stemArtworks, vesselArtworks } from "../src/components/artwork/registry";
import { PrismaClient } from "../src/generated/prisma/client";
import { isVesselKind, suggestArtworkKey } from "../src/lib/drawings";

const OUT_DIR = path.join(process.cwd(), "drawing-requests");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const takenKeys = [...Object.keys(stemArtworks), ...Object.keys(vesselArtworks)];

const waiting = () =>
  prisma.drawingRequest.findMany({ where: { status: "waiting" }, orderBy: { createdAt: "asc" } });

async function list() {
  const rows = await waiting();
  if (rows.length === 0) return console.log("No drawing requests are waiting.");
  for (const r of rows) {
    console.log(`${r.id}  ${r.kind.padEnd(6)}  ${r.name}${r.notes ? `  (notes: ${r.notes})` : ""}`);
  }
}

async function exportRequests() {
  const rows = await waiting();
  await mkdir(OUT_DIR, { recursive: true });
  const manifest = [];
  const keys = [...takenKeys];
  for (const r of rows) {
    const ext = r.photoType === "image/png" ? "png" : r.photoType === "image/webp" ? "webp" : "jpg";
    const photo = path.join(OUT_DIR, `${r.id}.${ext}`);
    await writeFile(photo, r.photo);
    const suggestedKey = suggestArtworkKey(r.name, keys);
    keys.push(suggestedKey);
    manifest.push({
      id: r.id,
      name: r.name,
      kind: r.kind,
      registry: isVesselKind(r.kind) ? "vesselArtworks" : "stemArtworks",
      notes: r.notes,
      photo: path.relative(process.cwd(), photo).replaceAll("\\", "/"),
      suggestedKey,
      requestedAt: r.createdAt.toISOString(),
    });
  }
  await writeFile(path.join(OUT_DIR, "requests.json"), JSON.stringify(manifest, null, 2));
  console.log(`Exported ${manifest.length} request(s) to drawing-requests/requests.json`);
}

async function done(id: string | undefined, key: string | undefined) {
  if (!id || !key) throw new Error("Usage: npm run drawings -- done <id> <artworkKey>");
  const req = await prisma.drawingRequest.findUnique({ where: { id } });
  if (!req) throw new Error(`No drawing request ${id}.`);
  const registry: Record<string, unknown> = isVesselKind(req.kind) ? vesselArtworks : stemArtworks;
  if (!Object.hasOwn(registry, key)) {
    throw new Error(`"${key}" isn't in the ${isVesselKind(req.kind) ? "vessel" : "stem"} registry yet. Add it first.`);
  }
  await prisma.drawingRequest.update({ where: { id }, data: { status: "drawn", artworkKey: key } });
  console.log(`Marked "${req.name}" as drawn (${key}). The seller can use it after the next deploy.`);
}

const [command, ...args] = process.argv.slice(2);
const run = { list, export: exportRequests, done: () => done(args[0], args[1]) }[command ?? "list"];

(run ? run() : Promise.reject(new Error(`Unknown command "${command}". Use list, export or done.`)))
  .catch((e: Error) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
