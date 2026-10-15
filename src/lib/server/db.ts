import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

type Client = InstanceType<typeof PrismaClient>;
const globalForPrisma = globalThis as unknown as { prisma?: Client };

/**
 * The Prisma client, created on first use so importing this module never
 * needs a database (for example while `next build` collects pages).
 * One client per process, reused across hot reloads in development.
 */
export function db(): Client {
  const cached = globalForPrisma.prisma;
  // Production bundles can hold several copies of PrismaClient (one per server chunk), so
  // `instanceof` fails across chunks there: always share the one client.
  if (cached && (process.env.NODE_ENV === "production" || cached instanceof PrismaClient)) return cached;
  // In dev, a client from before `prisma generate` re-ran (a schema change) lacks new models: replace it.
  if (cached) void (cached as Client).$disconnect();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set. See .env.example.");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  globalForPrisma.prisma = client;
  return client;
}
