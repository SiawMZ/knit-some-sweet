import { z } from "zod";
import type { Catalog, CatalogItem, Vessel } from "./catalog/types";

export const HEIGHT_RANGE = { min: 15, max: 45 } as const;
export const ANGLE_RANGE = { min: -60, max: 60 } as const;
export const MAX_STEMS = 40;
export const REMARKS_MAX = 300;

export const stemSchema = z.object({
  id: z.string().min(1),
  itemId: z.string().min(1),
  colorId: z.string().min(1),
  height: z.number().min(HEIGHT_RANGE.min).max(HEIGHT_RANGE.max),
  angle: z.number().min(ANGLE_RANGE.min).max(ANGLE_RANGE.max),
  /** Horizontal shift of the stem's base, in canvas units. */
  offset: z.number().min(-30).max(30),
});

export const bouquetSchema = z.object({
  stems: z.array(stemSchema).max(MAX_STEMS),
  vesselId: z.string().min(1),
  vesselColorId: z.string().min(1),
  /** Optional date the customer would like the bouquet by, as YYYY-MM-DD. */
  neededBy: z.iso.date().optional(),
  /** Optional free-text note to the seller. */
  remarks: z.string().max(REMARKS_MAX).optional(),
});

export type Stem = z.infer<typeof stemSchema>;
export type Bouquet = z.infer<typeof bouquetSchema>;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function countOf(stems: Stem[], itemId: string) {
  return stems.filter((s) => s.itemId === itemId).length;
}

export function canAdd(stems: Stem[], item: CatalogItem) {
  return (
    item.active &&
    stems.length < MAX_STEMS &&
    countOf(stems, item.id) < item.maxQuantity
  );
}

/** Spread new stems in a fan: 0, -14, 14, -26, 26, -7, 7, ... */
const FAN = [0, -14, 14, -26, 26, -7, 7, -20, 20, -34, 34];

export function placementFor(index: number) {
  return {
    angle: FAN[index % FAN.length],
    offset: ((index * 7) % 13) - 6,
  };
}

export interface SummaryLine {
  itemId: string;
  itemName: string;
  colorId: string;
  colorName: string;
  quantity: number;
}

/** Group stems by item and color, in the order they were first added. */
export function summarize(stems: Stem[], catalog: Catalog): SummaryLine[] {
  const lines = new Map<string, SummaryLine>();
  for (const s of stems) {
    const key = `${s.itemId}:${s.colorId}`;
    const existing = lines.get(key);
    if (existing) {
      existing.quantity += 1;
      continue;
    }
    const item = catalog.items.find((i) => i.id === s.itemId);
    const color = item?.colors.find((c) => c.id === s.colorId);
    lines.set(key, {
      itemId: s.itemId,
      itemName: item?.name ?? s.itemId,
      colorId: s.colorId,
      colorName: color?.name ?? s.colorId,
      quantity: 1,
    });
  }
  return [...lines.values()];
}

/** A date as YYYY-MM-DD in the local time zone. */
export function localDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-10-21" -> "Wed, 21 Oct 2026" */
export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Check a bouquet against the current catalog. The seller can change the
 * catalog at any time, so anything saved or sent must pass this server-side.
 */
export function validateBouquet(
  bouquet: Bouquet,
  catalog: Catalog,
  today: string = localDate(new Date()),
): string[] {
  const errors: string[] = [];
  if (bouquet.stems.length === 0) errors.push("The bouquet is empty.");
  if (bouquet.neededBy && bouquet.neededBy < today) {
    errors.push("The date you picked has already passed.");
  }
  if ((bouquet.remarks?.length ?? 0) > REMARKS_MAX) {
    errors.push(`Remarks can be at most ${REMARKS_MAX} characters.`);
  }

  const counted = new Set<string>();
  for (const s of bouquet.stems) {
    const item = catalog.items.find((i) => i.id === s.itemId);
    if (!item || !item.active) {
      errors.push(`"${s.itemId}" is no longer available.`);
      continue;
    }
    if (!item.colors.some((c) => c.id === s.colorId)) {
      errors.push(`${item.name} is not available in that color.`);
    }
    if (!counted.has(item.id)) {
      counted.add(item.id);
      const n = countOf(bouquet.stems, item.id);
      if (n > item.maxQuantity) {
        errors.push(`${item.name}: at most ${item.maxQuantity} per bouquet (you have ${n}).`);
      }
    }
  }

  const vessel = catalog.vessels.find((v) => v.id === bouquet.vesselId);
  if (!vessel || !vessel.active) {
    errors.push("That vase or wrap is no longer available.");
  } else if (!vessel.colors.some((c) => c.id === bouquet.vesselColorId)) {
    errors.push(`${vessel.name} is not available in that color.`);
  }
  return errors;
}

/** The order text for the seller; `link` is the saved bouquet's share page. */
export function orderMessage(bouquet: Bouquet, catalog: Catalog, link?: string) {
  const vessel = catalog.vessels.find((v) => v.id === bouquet.vesselId);
  const vesselColor = vessel?.colors.find((c) => c.id === bouquet.vesselColorId);
  const lines = summarize(bouquet.stems, catalog).map(
    (l) => `• ${l.quantity} × ${l.itemName} (${l.colorName})`,
  );
  return [
    "Hi knitsomesweet! I made this bouquet 💐",
    "",
    ...lines,
    "",
    `${vessel?.kind === "wrap" ? "Wrapping" : "Vase"}: ${vessel?.name ?? "-"}${vesselColor ? ` (${vesselColor.name})` : ""}`,
    `Total stems: ${bouquet.stems.length}`,
    ...(bouquet.neededBy ? [`Needed by: ${formatDate(bouquet.neededBy)}`] : []),
    ...(bouquet.remarks?.trim() ? ["", `Remarks: ${bouquet.remarks.trim()}`] : []),
    ...(link ? ["", `See it here: ${link}`] : []),
  ].join("\n");
}

/**
 * Bring a saved bouquet in line with the current catalog: drop stems of items
 * that are gone or inactive, reset colors that are no longer offered, and trim
 * items over their new limit (keeping the earliest stems). The seller can
 * change the catalog between visits, and the builder restores stems from
 * localStorage.
 */
export function reconcileStems(stems: Stem[], catalog: Catalog): Stem[] {
  const counts = new Map<string, number>();
  const out: Stem[] = [];
  for (const s of stems) {
    const item = catalog.items.find((i) => i.id === s.itemId && i.active);
    if (!item || item.colors.length === 0) continue;
    const n = (counts.get(item.id) ?? 0) + 1;
    if (n > item.maxQuantity || out.length >= MAX_STEMS) continue;
    counts.set(item.id, n);
    out.push(item.colors.some((c) => c.id === s.colorId) ? s : { ...s, colorId: item.colors[0].id });
  }
  return out;
}

/** The active vessel and color to use, falling back to the first active vessel. */
export function reconcileVessel(
  vesselId: string | null,
  vesselColorId: string | null,
  catalog: Catalog,
): { vessel: Vessel; colorId: string } | null {
  const usable = catalog.vessels.filter((v) => v.active && v.colors.length > 0);
  const vessel = usable.find((v) => v.id === vesselId) ?? usable[0];
  if (!vessel) return null;
  const colorId = vessel.colors.some((c) => c.id === vesselColorId) ? vesselColorId! : vessel.colors[0].id;
  return { vessel, colorId };
}
