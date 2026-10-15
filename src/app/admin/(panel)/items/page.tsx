import Link from "next/link";
import { ArtworkThumb } from "@/components/artwork/ArtworkThumb";
import { isStemArtworkKey } from "@/lib/catalog/rows";
import { adminItems } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

const CATEGORY = { bloom: "Bloom", filler: "Filler", friend: "Friend" } as const;

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function ItemsPage() {
  await requireSeller();
  const items = await adminItems();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Items ({items.length})</h2>
        <Link href="/admin/items/new" className="btn-primary">
          + New item
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const first = item.colors[0]?.color;
          return (
            <li key={item.id}>
              <Link
                href={`/admin/items/${item.id}`}
                className={`card flex items-center gap-3 transition hover:border-rose ${item.active ? "" : "opacity-60"}`}
              >
                <div className="size-20 shrink-0 rounded-2xl bg-[#fff6ea]">
                  {isStemArtworkKey(item.artworkKey) && first && (
                    <ArtworkThumb artworkKey={item.artworkKey} color={first.hex} className="size-20" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg">{item.name}</p>
                  <p className="text-sm text-ink/70">
                    {CATEGORY[item.category]} · max {item.maxQuantity}
                    {!item.active && <span className="ml-2 rounded-full bg-ink/10 px-2 text-xs">hidden</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.colors.map(({ color }) => (
                      <span
                        key={color.id}
                        title={color.name}
                        className="size-4 rounded-full border border-ink/20"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
