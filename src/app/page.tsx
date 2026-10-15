import { Builder } from "@/components/builder/Builder";
import { seedCatalog } from "@/lib/catalog/seed";

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
        <Builder catalog={seedCatalog} />
      </main>
    </>
  );
}
