import { z } from "zod";

/**
 * Events the browser may report. Analytics are first-party and anonymous:
 * no names, contact details, remarks, IPs or user agents are ever stored.
 */
export const clientEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("page_view"),
    // Only the path: query strings and hashes can carry personal data.
    path: z
      .string()
      .startsWith("/")
      .max(200)
      .transform((p) => p.split(/[?#]/)[0]),
  }),
  z.object({
    type: z.literal("item_added"),
    itemId: z.string().min(1).max(64),
    colorId: z.string().min(1).max(64),
  }),
]);

export type ClientEvent = z.input<typeof clientEventSchema>;

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp/i;

/** Crawlers and link previewers (like WhatsApp's) shouldn't count as visits. */
export const isBot = (userAgent: string | null) => !userAgent || BOT.test(userAgent);
