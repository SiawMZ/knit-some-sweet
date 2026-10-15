"use client";

import { type PointerEvent, useRef } from "react";
import { vesselArtworks } from "@/components/artwork/registry";
import { BouquetSvg, PX_PER_CM } from "@/components/bouquet/BouquetSvg";
import type { Stem } from "@/lib/bouquet";
import type { Catalog } from "@/lib/catalog/types";
import { type Backdrop, useBuilder } from "@/lib/store";

export const BACKDROPS: Record<Backdrop, { label: string; fill: string }> = {
  cream: { label: "Cream", fill: "#fff6ea" },
  blush: { label: "Blush", fill: "#fde6ea" },
  sage: { label: "Sage", fill: "#e7f0e2" },
};

/** Interactive canvas: tap a stem to select it, drag its head to tilt and stretch. */
export function BouquetCanvas({
  catalog,
  svgRef,
  onSelect,
}: {
  catalog: Catalog;
  svgRef: React.RefObject<SVGSVGElement | null>;
  onSelect: () => void;
}) {
  const { stems, vesselId, vesselColorId, selectedId, backdrop } = useBuilder();
  const select = useBuilder((s) => s.select);
  const updateStem = useBuilder((s) => s.updateStem);
  const drag = useRef<{ stem: Stem; pointerId: number } | null>(null);

  const vessel = catalog.vessels.find((v) => v.id === vesselId) ?? catalog.vessels[0];
  const gather = vesselArtworks[vessel.artworkKey].gather;

  const toCanvas = (e: PointerEvent) => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const onStemPointerDown = (e: PointerEvent<SVGGElement>, stem: Stem) => {
    e.stopPropagation();
    select(stem.id);
    onSelect();
    drag.current = { stem, pointerId: e.pointerId };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const p = toCanvas(e);
    if (!p) return;
    const dx = p.x - (gather.x + d.stem.offset);
    const dy = gather.y - p.y;
    // The head is drawn about 28 units above the stem tip; aim the tip under the pointer.
    const len = Math.hypot(dx, dy) - 28;
    updateStem(d.stem.id, {
      angle: (Math.atan2(dx, dy) * 180) / Math.PI,
      height: len / PX_PER_CM,
    });
  };

  const endDrag = (e: PointerEvent) => {
    if (drag.current?.pointerId === e.pointerId) drag.current = null;
  };

  return (
    <div className="flex w-full justify-center" onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <BouquetSvg
        svgRef={svgRef}
        catalog={catalog}
        stems={stems}
        vesselId={vesselId}
        vesselColorId={vesselColorId}
        backdrop={BACKDROPS[backdrop].fill}
        selectedId={selectedId}
        onStemPointerDown={onStemPointerDown}
        onBackgroundPointerDown={() => select(null)}
        className="h-[52vh] w-auto max-w-full select-none lg:h-[min(72vh,44rem)]"
      />
    </div>
  );
}
