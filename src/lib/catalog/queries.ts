import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/server/db";
import { toCatalog } from "./rows";
import type { Catalog } from "./types";

/** Tag for everything derived from the catalog; admin mutations update it. */
export const CATALOG_TAG = "catalog";

const withColors = {
  colors: { include: { color: true }, orderBy: { position: "asc" } },
} as const;

async function loadRows() {
  const [items, vessels] = await Promise.all([
    db().item.findMany({ include: withColors, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    db().vessel.findMany({ include: withColors, orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);
  return { items, vessels };
}

/** What customers can pick from: active items and vessels only. Cached until the seller edits the catalog. */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(CATALOG_TAG);
  cacheLife("max");
  const { items, vessels } = await loadRows();
  return toCatalog(items, vessels, { activeOnly: true });
}

/** Everything, including inactive rows, for the seller admin. Not cached. */
export async function getFullCatalog(): Promise<Catalog> {
  const { items, vessels } = await loadRows();
  return toCatalog(items, vessels);
}
