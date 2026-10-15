"use client";

import { motion } from "motion/react";
import type { PointerEvent, Ref } from "react";
import { stemArtworks, vesselArtworks } from "@/components/artwork/registry";
import { outlineOf } from "@/lib/color";
import type { Stem } from "@/lib/bouquet";
import type { Catalog } from "@/lib/catalog/types";

export const CANVAS = { width: 400, height: 520 } as const;
/** Canvas units per centimeter of stem. */
export const PX_PER_CM = 6;
/** Filter for the white "sticker" edge; the saved picture applies it to `[data-content]`. */
export const STICKER_FILTER_ID = "bouquet-sticker";

const rad = (deg: number) => (deg * Math.PI) / 180;

export function stemGeometry(stem: Stem, gather: { x: number; y: number }) {
  const base = { x: gather.x + stem.offset, y: gather.y };
  const len = stem.height * PX_PER_CM;
  const tip = {
    x: base.x + Math.sin(rad(stem.angle)) * len,
    y: base.y - Math.cos(rad(stem.angle)) * len,
  };
  // Bend the stem gently outward so a fan of stems looks natural.
  const ctrl = {
    x: base.x + Math.sin(rad(stem.angle * 0.55)) * len * 0.55,
    y: base.y - Math.cos(rad(stem.angle * 0.55)) * len * 0.55,
  };
  return { base, tip, ctrl };
}

interface Props {
  catalog: Catalog;
  stems: Stem[];
  vesselId: string | null;
  vesselColorId: string | null;
  backdrop?: string;
  selectedId?: string | null;
  onStemPointerDown?: (e: PointerEvent<SVGGElement>, stem: Stem) => void;
  onBackgroundPointerDown?: () => void;
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
  /** Draw a white sticker edge with a soft shadow around the bouquet. */
  sticker?: boolean;
}

export function BouquetSvg({
  catalog,
  stems,
  vesselId,
  vesselColorId,
  backdrop,
  selectedId,
  onStemPointerDown,
  onBackgroundPointerDown,
  svgRef,
  className,
  sticker = false,
}: Props) {
  const vessel = catalog.vessels.find((v) => v.id === vesselId) ?? catalog.vessels[0];
  const vesselColor =
    vessel.colors.find((c) => c.id === vesselColorId)?.hex ?? vessel.colors[0].hex;
  const art = vesselArtworks[vessel.artworkKey];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}
      className={className}
      role="img"
      aria-label="Your bouquet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <StickerFilter />
      </defs>
      <rect
        width={CANVAS.width}
        height={CANVAS.height}
        fill={backdrop ?? "transparent"}
        data-backdrop
        onPointerDown={onBackgroundPointerDown}
      />
      <g data-content filter={sticker ? `url(#${STICKER_FILTER_ID})` : undefined}>
        <art.Back color={vesselColor} />

        {stems.map((stem) => {
          const item = catalog.items.find((i) => i.id === stem.itemId);
          if (!item) return null;
          const color = item.colors.find((c) => c.id === stem.colorId)?.hex ?? item.colors[0].hex;
          const { stemColor } = stemArtworks[item.artworkKey];
          const { base, tip, ctrl } = stemGeometry(stem, art.gather);
          const sColor = stemColor(color);
          return (
            <path
              key={`s-${stem.id}`}
              d={`M${base.x} ${base.y} Q${ctrl.x} ${ctrl.y} ${tip.x} ${tip.y}`}
              fill="none"
              stroke={sColor}
              strokeWidth={3.4}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 0.6px ${outlineOf(sColor)})` }}
            />
          );
        })}

        {stems.map((stem) => {
          const item = catalog.items.find((i) => i.id === stem.itemId);
          if (!item) return null;
          const color = item.colors.find((c) => c.id === stem.colorId)?.hex ?? item.colors[0].hex;
          const { Component } = stemArtworks[item.artworkKey];
          const { tip } = stemGeometry(stem, art.gather);
          const selected = stem.id === selectedId;
          return (
            <g
              key={stem.id}
              transform={`translate(${tip.x} ${tip.y}) rotate(${stem.angle * 0.7})`}
              onPointerDown={onStemPointerDown ? (e) => onStemPointerDown(e, stem) : undefined}
              style={{ cursor: onStemPointerDown ? "grab" : undefined, touchAction: "none" }}
              data-stem-id={stem.id}
            >
              <motion.g
                data-pop-in
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
                style={{ originX: 0.5, originY: 1 }}
              >
                {selected && (
                  <circle data-selection cx={0} cy={-30} r={38} fill="none" stroke="#c9826b" strokeWidth={1.6} strokeDasharray="4 4" />
                )}
                <Component color={color} />
              </motion.g>
            </g>
          );
        })}

        <art.Front color={vesselColor} />
      </g>
    </svg>
  );
}

/** Grows the drawing's silhouette into a white edge (in canvas units) and drops a soft shadow under it. */
function StickerFilter() {
  return (
    <filter id={STICKER_FILTER_ID} x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={5} result="grown" />
      <feFlood floodColor="#ffffff" />
      <feComposite in2="grown" operator="in" result="edge" />
      <feGaussianBlur in="grown" stdDeviation={3} />
      <feOffset dy={3} result="blurred" />
      <feFlood floodColor="#7a5a4a" floodOpacity={0.25} />
      <feComposite in2="blurred" operator="in" result="shadow" />
      <feMerge>
        <feMergeNode in="shadow" />
        <feMergeNode in="edge" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}
