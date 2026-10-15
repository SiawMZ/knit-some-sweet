import { connection } from "next/server";
import { Suspense } from "react";
import { PageView } from "@/components/analytics/PageView";
import { Builder } from "@/components/builder/Builder";
import { getCatalog } from "@/lib/catalog/queries";

export default function Home() {
  return (
    <>
      <header className="mx-auto flex w-full max-w-6xl items-end justify-between gap-4 px-4 pt-6 pb-4">
        <div>
          <p className="font-display text-sm tracking-widest text-rose-deep uppercase">knitsomesweet</p>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Build your crochet bouquet</h1>
        </div>
        <p className="hidden max-w-xs text-right text-sm text-ink/70 sm:block">
          Every stem is handmade. Mix, match, and send it to us when you&apos;re happy ✿
        </p>
      </header>
      <main className="flex flex-1 flex-col">
        <Suspense fallback={<BuilderSkeleton />}>
          <CatalogBuilder />
        </Suspense>
      </main>
      <PageView />
    </>
  );
}

async function CatalogBuilder() {
  // Read the catalog per request (it's cached until the seller edits it), so
  // builds never need a database and edits show up right away.
  await connection();
  const catalog = await getCatalog();
  return <Builder catalog={catalog} />;
}

function BuilderSkeleton() {
  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 pb-8 lg:grid-cols-[22rem_1fr]" aria-busy>
      <div className="order-2 h-96 animate-pulse rounded-[2rem] bg-paper-deep/60 lg:order-1" />
      <div className="order-1 flex min-h-[28rem] items-center justify-center rounded-[2rem] border-2 border-ink/10 bg-[#fff6ea] lg:order-2">
        <p className="font-display text-lg text-ink/60">Gathering the stems…</p>
      </div>
    </div>
  );
}
