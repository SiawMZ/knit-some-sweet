import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageView } from "@/components/analytics/PageView";
import { BouquetSvg } from "@/components/bouquet/BouquetSvg";
import { summarize } from "@/lib/bouquet";
import { getSavedBouquet } from "@/lib/bouquets/queries";

export const metadata: Metadata = {
  title: "A crochet bouquet · knitsomesweet",
  description: "A handmade crochet bouquet, made with the knitsomesweet bouquet builder.",
};

export default function SharedBouquetPage({ params }: PageProps<"/b/[slug]">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <p className="font-display text-sm tracking-widest text-rose-deep uppercase">knitsomesweet</p>
      <Suspense fallback={<p className="mt-10 text-center font-display text-lg text-ink/60">Unwrapping the bouquet…</p>}>
        <SharedBouquet params={params} />
      </Suspense>
      <PageView />
    </main>
  );
}

async function SharedBouquet({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const saved = await getSavedBouquet(slug);
  if (!saved) notFound();
  const { bouquet, catalog } = saved;
  const vessel = catalog.vessels.find((v) => v.id === bouquet.vesselId);
  const vesselColor = vessel?.colors.find((c) => c.id === bouquet.vesselColorId);

  return (
    <>
      <h1 className="font-display text-3xl text-ink sm:text-4xl">A bouquet made with love 💐</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_16rem]">
        <div className="rounded-[2rem] border-2 border-ink/10 bg-[#fff6ea] p-3">
          <BouquetSvg
            catalog={catalog}
            stems={bouquet.stems}
            vesselId={bouquet.vesselId}
            vesselColorId={bouquet.vesselColorId}
            className="mx-auto w-full max-w-md"
          />
        </div>
        <div className="space-y-3">
          <ul className="divide-y divide-ink/10 rounded-2xl bg-white/70 px-4">
            {summarize(bouquet.stems, catalog).map((l) => (
              <li key={`${l.itemId}:${l.colorId}`} className="flex justify-between gap-2 py-2">
                <span>
                  {l.itemName} <span className="text-ink/60">· {l.colorName}</span>
                </span>
                <span className="tabular-nums">× {l.quantity}</span>
              </li>
            ))}
          </ul>
          {vessel && (
            <p className="rounded-2xl bg-white/70 px-4 py-2">
              {vessel.kind === "wrap" ? "Wrapped in" : "In a"} {vessel.name.toLowerCase()}
              {vesselColor && <span className="text-ink/60"> · {vesselColor.name}</span>}
            </p>
          )}
          <Link href="/" className="btn-primary block text-center">
            Build your own ✿
          </Link>
        </div>
      </div>
    </>
  );
}
