import Link from "next/link";
import { dismissDrawing } from "@/app/admin/actions";
import { ArtworkThumb } from "@/components/artwork/ArtworkThumb";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DrawingRequestForm } from "@/components/admin/DrawingRequestForm";
import { MarkDrawnForm } from "@/components/admin/MarkDrawnForm";
import { VesselThumb } from "@/components/builder/VesselPicker";
import { isStemArtworkKey, isVesselArtworkKey } from "@/lib/catalog/rows";
import {
  DRAWING_KINDS,
  type DrawingKind,
  drawingChoices,
  drawingState,
  isVesselKind,
  matchingDrawing,
} from "@/lib/drawings";
import { db } from "@/lib/server/db";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

const STATE_LABEL = {
  waiting: { text: "Waiting for drawing", className: "bg-butter/50" },
  "drawn-not-live": { text: "Drawn, live after the next site update", className: "bg-peach/50" },
  ready: { text: "Ready to use", className: "bg-sage/50" },
  dismissed: { text: "Cancelled", className: "bg-ink/10" },
} as const;

/** Where "Create item" goes for a finished drawing, with the form filled in. */
function createHref(req: { name: string; kind: string; artworkKey: string | null }) {
  const q = new URLSearchParams({ name: req.name, artwork: req.artworkKey ?? "" });
  if (isVesselKind(req.kind)) return `/admin/vessels/new?${q}&kind=${req.kind}`;
  return `/admin/items/new?${q}&category=${req.kind}`;
}

export default async function DrawingRequestsPage() {
  await requireSeller();
  const requests = await db().drawingRequest.findMany({
    where: { status: { not: "dismissed" } },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, kind: true, notes: true, status: true, artworkKey: true, createdAt: true },
  });

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="card">
        <h2 className="font-display text-2xl">New drawings</h2>
        <p className="mb-3 text-sm text-ink/70">
          Every item in the builder is a hand-drawn cartoon, so a new product needs its own drawing first. Send a
          photo here; once it&apos;s drawn and the site is updated, create the item from it.
        </p>
        {requests.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/20 p-6 text-center text-ink/60">
            No drawing requests yet.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {requests.map((r) => {
              const state = drawingState(r);
              const label = STATE_LABEL[state];
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-checked photo */}
                  <img
                    src={`/admin/requests/${r.id}/photo`}
                    alt={`Photo of ${r.name}`}
                    className="size-20 shrink-0 rounded-2xl object-cover"
                  />
                  {state === "ready" && r.artworkKey && (
                    <div className="size-20 shrink-0 rounded-2xl bg-[#fff6ea]">
                      {isStemArtworkKey(r.artworkKey) && (
                        <ArtworkThumb artworkKey={r.artworkKey} color="#f4b6c2" className="size-20" />
                      )}
                      {isVesselArtworkKey(r.artworkKey) && (
                        <VesselThumb artworkKey={r.artworkKey} color="#f6ecd0" className="mx-auto h-20 w-16" />
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg">{r.name}</p>
                    <p className="text-sm text-ink/70">
                      {DRAWING_KINDS[r.kind as DrawingKind] ?? r.kind} · {r.createdAt.toLocaleDateString("en-GB")}
                    </p>
                    {r.notes && <p className="text-sm text-ink/70">“{r.notes}”</p>}
                    <span className={`mt-1 inline-block rounded-full px-2 text-xs ${label.className}`}>{label.text}</span>
                  </div>
                  {state === "ready" && (
                    <Link href={createHref(r)} className="btn-primary">
                      Create item
                    </Link>
                  )}
                  {state === "waiting" && (
                    <DeleteButton
                      label="Cancel"
                      confirmText={`Cancel the drawing request for ${r.name}?`}
                      action={dismissDrawing.bind(null, r.id)}
                    />
                  )}
                  {state === "waiting" && (
                    <MarkDrawnForm id={r.id} choices={drawingChoices(r.kind)} match={matchingDrawing(r.name, r.kind)} />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <DrawingRequestForm />
    </section>
  );
}
