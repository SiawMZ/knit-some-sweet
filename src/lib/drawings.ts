import { z } from "zod";
import { slugify } from "@/lib/catalog/admin";
import { isStemArtworkKey, isVesselArtworkKey } from "@/lib/catalog/rows";

/**
 * Drawing requests: the seller uploads a photo of a new product, and the
 * developer turns it into SVG artwork with the `/draw-requests` Claude Code
 * command. New artwork only reaches the site with the next deploy.
 */

export const DRAWING_KINDS = {
  bloom: "Bloom",
  filler: "Filler",
  friend: "Friend",
  vase: "Vase",
  wrap: "Wrapping",
} as const;
export type DrawingKind = keyof typeof DRAWING_KINDS;

export const isVesselKind = (kind: string) => kind === "vase" || kind === "wrap";

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
/** The browser downscales photos to a JPEG well under this. */
export const MAX_PHOTO_BYTES = 2.5 * 1024 * 1024;
/** Longest side of the photo after downscaling in the browser. */
export const PHOTO_MAX_SIDE = 1600;

export const drawingRequestSchema = z.object({
  name: z.string().trim().min(1, "Give the new item a name.").max(60, "Keep the name under 60 characters."),
  kind: z.enum(Object.keys(DRAWING_KINDS) as [DrawingKind, ...DrawingKind[]], "Pick what kind of item it is."),
  notes: z
    .string()
    .trim()
    .max(500, "Keep the notes under 500 characters.")
    .transform((n) => n || undefined),
});

/** An error message for a photo we can't accept, or null if it's fine. */
export function checkPhoto(file: { type: string; size: number } | null): string | null {
  if (!file || file.size === 0) return "Add a photo of the item.";
  if (!(PHOTO_TYPES as readonly string[]).includes(file.type)) return "Photos must be JPEG, PNG or WebP.";
  if (file.size > MAX_PHOTO_BYTES) return "That photo is too large. Try a smaller one.";
  return null;
}

export type DrawingState = "waiting" | "drawn-not-live" | "ready" | "dismissed";

/**
 * Where a request stands for the seller. A request marked drawn is only
 * usable once its artwork is in this build's registry (after a deploy).
 */
export function drawingState(req: { status: string; kind: string; artworkKey: string | null }): DrawingState {
  if (req.status === "dismissed") return "dismissed";
  if (req.status !== "drawn" || !req.artworkKey) return "waiting";
  const live = isVesselKind(req.kind) ? isVesselArtworkKey(req.artworkKey) : isStemArtworkKey(req.artworkKey);
  return live ? "ready" : "drawn-not-live";
}

/** A registry key for a new drawing: the slugified name, made unique against `taken`. */
export function suggestArtworkKey(name: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(name) || "drawing";
  if (!used.has(base)) return base;
  for (let i = 2; ; i++) if (!used.has(`${base}-${i}`)) return `${base}-${i}`;
}
