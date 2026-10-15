import { stemArtworks, vesselArtworks, type StemArtworkKey, type VesselArtworkKey } from "@/components/artwork/registry";
import type { Catalog, CatalogItem, ColorOption, ItemCategory, Vessel, VesselKind } from "./types";

/** The shape of catalog rows as loaded from the database (with their colors). */
interface ColorLink {
  position: number;
  color: ColorOption;
}
export interface ItemRow {
  id: string;
  name: string;
  category: ItemCategory;
  artworkKey: string;
  maxQuantity: number;
  defaultHeight: number;
  active: boolean;
  colors: ColorLink[];
}
export interface VesselRow {
  id: string;
  name: string;
  kind: VesselKind;
  artworkKey: string;
  active: boolean;
  colors: ColorLink[];
}

export const isStemArtworkKey = (key: string): key is StemArtworkKey => Object.hasOwn(stemArtworks, key);
export const isVesselArtworkKey = (key: string): key is VesselArtworkKey => Object.hasOwn(vesselArtworks, key);

const orderedColors = (links: ColorLink[]): ColorOption[] =>
  [...links]
    .sort((a, b) => a.position - b.position)
    .map(({ color }) => ({ id: color.id, name: color.name, hex: color.hex }));

/**
 * Turn database rows into a `Catalog`. Rows whose artwork isn't in the
 * registry, or that have no colors, can't be drawn and are left out.
 * With `activeOnly`, inactive items and vessels are left out too, which is
 * what customers see.
 */
export function toCatalog(items: ItemRow[], vessels: VesselRow[], { activeOnly = false } = {}): Catalog {
  const outItems: CatalogItem[] = [];
  for (const r of items) {
    if (!isStemArtworkKey(r.artworkKey) || r.colors.length === 0) continue;
    if (activeOnly && !r.active) continue;
    outItems.push({
      id: r.id,
      name: r.name,
      category: r.category,
      artworkKey: r.artworkKey,
      maxQuantity: r.maxQuantity,
      defaultHeight: r.defaultHeight,
      active: r.active,
      colors: orderedColors(r.colors),
    });
  }
  const outVessels: Vessel[] = [];
  for (const r of vessels) {
    if (!isVesselArtworkKey(r.artworkKey) || r.colors.length === 0) continue;
    if (activeOnly && !r.active) continue;
    outVessels.push({
      id: r.id,
      name: r.name,
      kind: r.kind,
      artworkKey: r.artworkKey,
      active: r.active,
      colors: orderedColors(r.colors),
    });
  }
  return { items: outItems, vessels: outVessels };
}

/** Only the items and vessels a bouquet uses, for storing alongside it. */
export function catalogSubset(catalog: Catalog, itemIds: Iterable<string>, vesselId: string): Catalog {
  const ids = new Set(itemIds);
  return {
    items: catalog.items.filter((i) => ids.has(i.id)),
    vessels: catalog.vessels.filter((v) => v.id === vesselId),
  };
}
