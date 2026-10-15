import { VesselForm } from "@/components/admin/VesselForm";
import { isVesselArtworkKey } from "@/lib/catalog/rows";
import { adminColors } from "@/lib/catalog/admin-queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

const param = (v: string | string[] | undefined) => (typeof v === "string" ? v : "");

/** `?name=&artwork=&kind=` prefill the form, e.g. from a finished drawing request. */
export default async function NewVesselPage({ searchParams }: PageProps<"/admin/vessels/new">) {
  await requireSeller();
  const q = await searchParams;
  const artwork = param(q.artwork);
  const palette = await adminColors();
  return (
    <section>
      <h2 className="mb-4 font-display text-2xl">New vase or wrap</h2>
      <VesselForm
        mode="create"
        palette={palette.map(({ id, name, hex }) => ({ id, name, hex }))}
        initial={{
          id: "",
          name: param(q.name).slice(0, 60),
          kind: param(q.kind) === "wrap" ? "wrap" : "vase",
          artworkKey: isVesselArtworkKey(artwork) ? artwork : "ceramic-vase",
          active: true,
          colorIds: [],
        }}
      />
    </section>
  );
}
