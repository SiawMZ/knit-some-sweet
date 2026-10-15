import "server-only";
import { cacheLife } from "next/cache";
import { type Bouquet, bouquetSchema } from "@/lib/bouquet";
import type { Catalog } from "@/lib/catalog/types";
import { db } from "@/lib/server/db";

export interface SavedBouquetView {
  slug: string;
  bouquet: Bouquet;
  catalog: Catalog;
  createdAt: Date;
}

/** A saved bouquet by its share slug. Snapshots never change, so cache them for good. */
export async function getSavedBouquet(slug: string): Promise<SavedBouquetView | null> {
  "use cache";
  cacheLife("max");
  if (!/^[a-z0-9]{6,20}$/.test(slug)) return null;
  const row = await db().savedBouquet.findUnique({ where: { slug } });
  if (!row) return null;
  return {
    slug: row.slug,
    bouquet: bouquetSchema.parse(row.bouquet),
    // Written by submitBouquet from a validated catalog.
    catalog: row.catalog as unknown as Catalog,
    createdAt: row.createdAt,
  };
}
