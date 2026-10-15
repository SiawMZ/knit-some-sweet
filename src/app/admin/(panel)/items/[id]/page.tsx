import { notFound } from "next/navigation";
import { deleteItem } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ItemForm } from "@/components/admin/ItemForm";
import { adminColors, adminItem } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function EditItemPage({ params }: PageProps<"/admin/items/[id]">) {
  await requireSeller();
  const { id } = await params;
  const [item, palette] = await Promise.all([adminItem(id), adminColors()]);
  if (!item) notFound();
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">Edit {item.name}</h2>
      <ItemForm
        mode="edit"
        palette={palette.map(({ id, name, hex }) => ({ id, name, hex }))}
        initial={{
          id: item.id,
          name: item.name,
          category: item.category,
          artworkKey: item.artworkKey,
          maxQuantity: item.maxQuantity,
          defaultHeight: item.defaultHeight,
          active: item.active,
          colorIds: item.colors.map((c) => c.colorId),
        }}
      />
      <div className="mt-6 card">
        <p className="mb-2 text-sm text-ink/70">
          Removing an item takes it out of the builder for good. Bouquets already sent keep showing it. To pause it
          instead, untick “Available in the builder”.
        </p>
        <DeleteButton
          label="Remove item"
          confirmText={`Remove ${item.name} for good?`}
          action={deleteItem.bind(null, item.id)}
        />
      </div>
    </section>
  );
}
