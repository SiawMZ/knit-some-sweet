import { ColorRow, NewColorForm } from "@/components/admin/ColorForms";
import { adminColors } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function ColorsPage() {
  await requireSeller();
  const colors = await adminColors();
  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="card">
        <h2 className="font-display text-2xl">Yarn palette ({colors.length})</h2>
        <p className="mb-3 text-sm text-ink/70">
          These are the colors you can offer on items and vases. Pick which ones each item allows on its own page.
        </p>
        <ul className="divide-y divide-ink/10">
          {colors.map((c) => (
            <ColorRow key={c.id} color={{ id: c.id, name: c.name, hex: c.hex }} uses={c._count.items + c._count.vessels} />
          ))}
        </ul>
      </div>
      <NewColorForm />
    </section>
  );
}
