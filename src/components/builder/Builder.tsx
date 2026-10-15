"use client";

import { useEffect, useRef, useState } from "react";
import { localDate, reconcileVessel } from "@/lib/bouquet";
import type { Catalog } from "@/lib/catalog/types";
import { type Backdrop, useBuilder } from "@/lib/store";
import { BACKDROPS, BouquetCanvas } from "./BouquetCanvas";
import { FinishDialog } from "./FinishDialog";
import { ItemPicker } from "./ItemPicker";
import { StemEditor } from "./StemEditor";
import { VesselPicker } from "./VesselPicker";

type Panel = "pick" | "adjust" | "vessel";

const PANELS: { id: Panel; label: string; step: string }[] = [
  { id: "pick", label: "Pick stems", step: "01" },
  { id: "adjust", label: "Adjust", step: "02" },
  { id: "vessel", label: "Vase & wrap", step: "03" },
];

export function Builder({ catalog }: { catalog: Catalog }) {
  const [panel, setPanel] = useState<Panel>("pick");
  /** Today's date while the finish dialog is open, read on click so prerendering never sees `new Date()`. */
  const [finishingOn, setFinishingOn] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { stems, vesselId, vesselColorId, backdrop, neededBy, remarks } = useBuilder();
  const setBackdrop = useBuilder((s) => s.setBackdrop);
  const reconcile = useBuilder((s) => s.reconcile);
  const reset = useBuilder((s) => s.reset);

  // Restore the saved bouquet, then fit it to the catalog, which the seller may have changed since.
  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(useBuilder.persist.rehydrate()).then(() => {
      if (!cancelled) reconcile(catalog);
    });
    return () => {
      cancelled = true;
    };
  }, [catalog, reconcile]);

  const current = reconcileVessel(vesselId, vesselColorId, catalog);
  if (!current) {
    return (
      <p className="mx-auto mt-12 max-w-sm rounded-[2rem] bg-paper-deep/60 p-6 text-center font-display text-lg">
        The shop is restocking its vases and wraps. Please check back soon ✿
      </p>
    );
  }
  const vessel = current.vessel;

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 pb-8 lg:grid-cols-[22rem_1fr]">
      <aside className="order-2 rounded-[2rem] border-2 border-ink/10 bg-paper-deep/60 p-4 lg:order-1 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <nav role="tablist" aria-label="Builder steps" className="mb-4 grid grid-cols-3 gap-1 rounded-full bg-white/70 p-1">
          {PANELS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={panel === p.id}
              onClick={() => setPanel(p.id)}
              className={`rounded-full px-2 py-2 text-xs leading-tight transition-colors sm:text-sm ${
                panel === p.id ? "bg-rose text-white" : "text-ink/80 hover:bg-rose/15"
              }`}
            >
              <span className="block font-display">{p.label}</span>
            </button>
          ))}
        </nav>
        {panel === "pick" && <ItemPicker items={catalog.items} />}
        {panel === "adjust" && <StemEditor items={catalog.items} />}
        {panel === "vessel" && <VesselPicker vessels={catalog.vessels} />}
      </aside>

      <section
        className="relative order-1 flex flex-col rounded-[2rem] border-2 border-ink/10 p-3 transition-colors lg:order-2"
        style={{ backgroundColor: BACKDROPS[backdrop].fill }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="radiogroup" aria-label="Background">
            {(Object.keys(BACKDROPS) as Backdrop[]).map((b) => (
              <button
                key={b}
                role="radio"
                aria-checked={backdrop === b}
                aria-label={`${BACKDROPS[b].label} background`}
                onClick={() => setBackdrop(b)}
                className={`size-7 rounded-full border-2 ${backdrop === b ? "border-ink" : "border-ink/15"}`}
                style={{ backgroundColor: BACKDROPS[b].fill }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => stems.length && confirm("Start over with an empty bouquet?") && reset()}
              disabled={stems.length === 0}
              className="btn-soft disabled:opacity-40"
            >
              Start over
            </button>
            <button
              type="button"
              onClick={() => setFinishingOn(localDate(new Date()))}
              disabled={stems.length === 0}
              className="btn-primary disabled:opacity-40"
            >
              Finish ✿
            </button>
          </div>
        </div>

        <div className="relative mt-2 flex flex-1 items-center justify-center">
          <BouquetCanvas catalog={catalog} svgRef={svgRef} onSelect={() => setPanel("adjust")} />
          {stems.length === 0 && (
            <p className="pointer-events-none absolute top-1/3 max-w-60 text-center font-display text-lg text-ink/60">
              Pick a stem to start your bouquet
            </p>
          )}
        </div>
        <p className="text-center text-xs text-ink/60">
          {stems.length} stem{stems.length === 1 ? "" : "s"} · Tap a stem to edit it, drag its head to tilt and stretch
        </p>
      </section>

      <FinishDialog
        open={finishingOn !== null}
        today={finishingOn ?? ""}
        onClose={() => setFinishingOn(null)}
        bouquet={{
          stems,
          vesselId: vessel.id,
          vesselColorId: current.colorId,
          neededBy: neededBy || undefined,
          remarks: remarks || undefined,
        }}
        catalog={catalog}
        svgRef={svgRef}
      />
    </div>
  );
}
