import { type Bouquet, bouquetSchema, validateBouquet } from "@/lib/bouquet";
import { catalogSubset } from "@/lib/catalog/rows";
import type { Catalog } from "@/lib/catalog/types";

const DAY = 24 * 60 * 60 * 1000;
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/**
 * The customer's "today" decides whether a needed-by date has passed, but it
 * comes from their browser. Accept it only within a day of the server's UTC
 * date (time zones), otherwise use the server's.
 */
export function trustedToday(clientToday: unknown, now: Date): string {
  const server = isoDay(now);
  if (typeof clientToday !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(clientToday)) return server;
  const lo = isoDay(new Date(now.getTime() - DAY));
  const hi = isoDay(new Date(now.getTime() + DAY));
  return clientToday >= lo && clientToday <= hi ? clientToday : server;
}

export type Submission =
  | { ok: true; bouquet: Bouquet; snapshot: Catalog }
  | { ok: false; errors: string[] };

/** Parse and validate a submitted bouquet against the current catalog. */
export function prepareSubmission(input: unknown, catalog: Catalog, clientToday: unknown, now: Date): Submission {
  const parsed = bouquetSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: ["Something about this bouquet looks off. Please try again."] };
  const bouquet = { ...parsed.data, remarks: parsed.data.remarks?.trim() || undefined };
  const errors = validateBouquet(bouquet, catalog, trustedToday(clientToday, now));
  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    bouquet,
    snapshot: catalogSubset(catalog, bouquet.stems.map((s) => s.itemId), bouquet.vesselId),
  };
}

// No 0/o/1/l/i, so slugs read back clearly over chat.
const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

/** A random, unguessable slug for a saved bouquet's share link. */
export function newSlug(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => SLUG_ALPHABET[b % SLUG_ALPHABET.length]).join("");
}
