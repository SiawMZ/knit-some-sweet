"use server";

import { getCatalog } from "@/lib/catalog/queries";
import { db } from "@/lib/server/db";
import { newSlug, prepareSubmission } from "@/lib/server/submission";

export type SubmitResult = { ok: true; slug: string } | { ok: false; errors: string[] };

/**
 * Validate a bouquet against the live catalog and save it as a snapshot with
 * a share slug. The client checks limits too, but this is the check that counts.
 */
export async function submitBouquet(input: unknown, clientToday: unknown): Promise<SubmitResult> {
  const catalog = await getCatalog();
  const result = prepareSubmission(input, catalog, clientToday, new Date());
  if (!result.ok) return result;

  const slug = newSlug();
  await db().$transaction([
    db().savedBouquet.create({
      data: {
        slug,
        bouquet: result.bouquet,
        catalog: result.snapshot as object,
        stemCount: result.bouquet.stems.length,
      },
    }),
    db().analyticsEvent.create({ data: { type: "bouquet_submitted", path: "/" } }),
  ]);
  return { ok: true, slug };
}
