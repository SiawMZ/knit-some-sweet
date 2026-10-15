import Link from "next/link";
import { VesselThumb } from "@/components/builder/VesselPicker";
import { adminVessels } from "@/lib/catalog/admin-queries";
import { isVesselArtworkKey } from "@/lib/catalog/rows";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function VesselsPage() {
  await requireSeller();
  const vessels = await adminVessels();
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Vases & wraps ({vessels.length})</h2>
        <Link href="/admin/vessels/new" className="btn-primary">
          + New vase or wrap
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vessels.map((v) => {
          const first = v.colors[0]?.color;
          return (
            <li key={v.id}>
              <Link
                href={`/admin/vessels/${v.id}`}
                className={`card flex items-center gap-3 transition hover:border-rose ${v.active ? "" : "opacity-60"}`}
              >
                <div className="h-24 w-20 shrink-0 rounded-2xl bg-[#fff6ea]">
                  {isVesselArtworkKey(v.artworkKey) && first && (
                    <VesselThumb artworkKey={v.artworkKey} color={first.hex} className="h-24 w-20" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg">{v.name}</p>
                  <p className="text-sm text-ink/70">
                    {v.kind === "wrap" ? "Wrapping" : "Vase"}
                    {!v.active && <span className="ml-2 rounded-full bg-ink/10 px-2 text-xs">hidden</span>}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {v.colors.map(({ color }) => (
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
