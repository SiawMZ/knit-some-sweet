"use client";

import { vesselArtworks } from "@/components/artwork/registry";
import type { Vessel } from "@/lib/catalog/types";
import { useBuilder } from "@/lib/store";
import { Swatches } from "./Swatches";

export function VesselThumb({
  artworkKey,
  color,
  className = "mx-auto h-24 w-20",
}: {
  artworkKey: Vessel["artworkKey"];
  color: string;
  className?: string;
}) {
  const { Back, Front } = vesselArtworks[artworkKey];
  return (
    <svg viewBox="100 220 200 300" className={className} aria-hidden>
      <Back color={color} />
      <Front color={color} />
    </svg>
  );
}

export function VesselPicker({ vessels }: { vessels: Vessel[] }) {
  const vesselId = useBuilder((s) => s.vesselId);
  const vesselColorId = useBuilder((s) => s.vesselColorId);
  const setVessel = useBuilder((s) => s.setVessel);
  const setVesselColor = useBuilder((s) => s.setVesselColor);
  const active = vessels.filter((v) => v.active);
  const current = active.find((v) => v.id === vesselId) ?? active[0];

  return (
    <div className="space-y-5">
      <ul className="grid grid-cols-3 gap-2">
        {active.map((v) => {
          const selected = v.id === current.id;
          return (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setVessel(v)}
                aria-pressed={selected}
                className={`w-full rounded-3xl border-2 bg-white/70 p-2 ${
                  selected ? "border-rose" : "border-ink/10 hover:border-ink/30"
                }`}
              >
                <VesselThumb artworkKey={v.artworkKey} color={v.colors[0].hex} />
                <span className="mt-1 block font-display text-sm leading-tight text-ink">{v.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div>
        <p className="mb-2 font-display text-base text-ink">{current.kind === "wrap" ? "Paper color" : "Vase color"}</p>
        <Swatches
          label={`${current.name} color`}
          colors={current.colors}
          value={current.id === vesselId ? vesselColorId : current.colors[0].id}
          onChange={(id) => (current.id === vesselId ? setVesselColor(id) : setVessel(current, id))}
        />
      </div>
    </div>
  );
}
