import { z } from "zod";
import { HEIGHT_RANGE, MAX_STEMS } from "@/lib/bouquet";
import { isStemArtworkKey, isVesselArtworkKey } from "./rows";

/** Turn a name into an id: "Baby's Breath!" -> "babys-breath". */
export function slugify(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

const idSchema = z
  .string()
  .trim()
  .min(1, "Give it a name with some letters or numbers.")
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Ids can only use lowercase letters, numbers and dashes.");
const nameSchema = z.string().trim().min(1, "Give it a name.").max(60, "Keep the name under 60 characters.");
const colorIdsSchema = z
  .array(idSchema)
  .min(1, "Pick at least one color.")
  .max(30, "Pick at most 30 colors.")
  .refine((ids) => new Set(ids).size === ids.length, "Each color can only be picked once.");

export const itemInputSchema = z.object({
  id: idSchema,
  name: nameSchema,
  category: z.enum(["bloom", "filler", "friend"], "Pick a category."),
  artworkKey: z.string().refine(isStemArtworkKey, "Pick one of the existing drawings."),
  maxQuantity: z.coerce
    .number("Max per bouquet must be a number.")
    .int()
    .min(1, "Max per bouquet must be at least 1.")
    .max(MAX_STEMS, `Max per bouquet can be at most ${MAX_STEMS}.`),
  defaultHeight: z.coerce
    .number("Default height must be a number.")
    .int()
    .min(HEIGHT_RANGE.min, `Default height must be ${HEIGHT_RANGE.min}–${HEIGHT_RANGE.max} cm.`)
    .max(HEIGHT_RANGE.max, `Default height must be ${HEIGHT_RANGE.min}–${HEIGHT_RANGE.max} cm.`),
  active: z.boolean(),
  colorIds: colorIdsSchema,
});
export type ItemInput = z.infer<typeof itemInputSchema>;

export const vesselInputSchema = z.object({
  id: idSchema,
  name: nameSchema,
  kind: z.enum(["vase", "wrap"], "Pick vase or wrap."),
  artworkKey: z.string().refine(isVesselArtworkKey, "Pick one of the existing drawings."),
  active: z.boolean(),
  colorIds: colorIdsSchema,
});
export type VesselInput = z.infer<typeof vesselInputSchema>;

export const colorInputSchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1, "Give the color a name.").max(40),
  hex: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^#[0-9a-f]{6}$/, "Colors must look like #f4b6c2."),
});
export type ColorInput = z.infer<typeof colorInputSchema>;

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

/** The id comes from the form when editing, otherwise from the name. */
const idFrom = (fd: FormData) => text(fd, "id").trim() || slugify(text(fd, "name"));

export const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Please check the form.";

export function parseItemForm(fd: FormData) {
  return itemInputSchema.safeParse({
    id: idFrom(fd),
    name: text(fd, "name"),
    category: text(fd, "category"),
    artworkKey: text(fd, "artworkKey"),
    maxQuantity: text(fd, "maxQuantity"),
    defaultHeight: text(fd, "defaultHeight"),
    active: fd.get("active") === "on",
    colorIds: fd.getAll("colorIds"),
  });
}

export function parseVesselForm(fd: FormData) {
  return vesselInputSchema.safeParse({
    id: idFrom(fd),
    name: text(fd, "name"),
    kind: text(fd, "kind"),
    artworkKey: text(fd, "artworkKey"),
    active: fd.get("active") === "on",
    colorIds: fd.getAll("colorIds"),
  });
}

export function parseColorForm(fd: FormData) {
  return colorInputSchema.safeParse({ id: idFrom(fd), name: text(fd, "name"), hex: text(fd, "hex") });
}
