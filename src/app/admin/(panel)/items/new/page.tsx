import { ItemForm } from "@/components/admin/ItemForm";
import { isStemArtworkKey } from "@/lib/catalog/rows";
import type { ItemCategory } from "@/lib/catalog/types";
import { adminColors } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

const CATEGORIES: ItemCategory[] = ["bloom", "filler", "friend"];
const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

/** `?name=&artwork=&category=` prefill the form, e.g. from a finished drawing request. */
export default async function NewItemPage({ searchParams }: PageProps<"/admin/items/new">) {
  await requireSeller();
  const q = await searchParams;
  const artwork = param(q.artwork);
  const category = CATEGORIES.find((c) => c === param(q.category)) ?? "bloom";
  const palette = await adminColors();
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">New item</h2>
      <ItemForm
        mode="create"
        palette={palette.map(({ id, name, hex }) => ({ id, name, hex }))}
        initial={{
          id: "",
          name: param(q.name).slice(0, 60),
          category,
          artworkKey: isStemArtworkKey(artwork) ? artwork : "puff-flower",
          maxQuantity: 6,
          defaultHeight: 30,
          active: true,
          colorIds: [],
        }}
      />
    </section>
  );
}
