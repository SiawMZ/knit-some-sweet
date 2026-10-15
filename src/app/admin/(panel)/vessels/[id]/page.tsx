import { notFound } from "next/navigation";
import { deleteVessel } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { VesselForm } from "@/components/admin/VesselForm";
import { adminColors, adminVessel } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function EditVesselPage({ params }: PageProps<"/admin/vessels/[id]">) {
  await requireSeller();
  const { id } = await params;
  const [vessel, palette] = await Promise.all([adminVessel(id), adminColors()]);
  if (!vessel) notFound();
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">Edit {vessel.name}</h2>
      <VesselForm
        mode="edit"
        palette={palette.map(({ id, name, hex }) => ({ id, name, hex }))}
        initial={{
          id: vessel.id,
          name: vessel.name,
          kind: vessel.kind,
          artworkKey: vessel.artworkKey,
          active: vessel.active,
          colorIds: vessel.colors.map((c) => c.colorId),
        }}
      />
      <div className="mt-6 card">
        <p className="mb-2 text-sm text-ink/70">
          Removing it takes it out of the builder for good. Bouquets already sent keep showing it. To pause it
          instead, untick “Available in the builder”.
        </p>
        <DeleteButton
          label="Remove vase or wrap"
          confirmText={`Remove ${vessel.name} for good?`}
          action={deleteVessel.bind(null, vessel.id)}
        />
      </div>
    </section>
  );
}
