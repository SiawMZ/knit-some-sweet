"use client";

import { ArtworkThumb } from "@/components/artwork/ArtworkThumb";
import { track } from "@/lib/analytics/client";
import { ANGLE_RANGE, HEIGHT_RANGE, canAdd } from "@/lib/bouquet";
import type { CatalogItem } from "@/lib/catalog/types";
import { useBuilder } from "@/lib/store";
import { Slider, Swatches } from "./Swatches";

export function StemEditor({ items }: { items: CatalogItem[] }) {
  const stems = useBuilder((s) => s.stems);
  const selectedId = useBuilder((s) => s.selectedId);
  const select = useBuilder((s) => s.select);
  const updateStem = useBuilder((s) => s.updateStem);
  const removeStem = useBuilder((s) => s.removeStem);
  const duplicateStem = useBuilder((s) => s.duplicateStem);
  const moveStem = useBuilder((s) => s.moveStem);

  if (stems.length === 0) {
    return (
      <p className="rounded-3xl border-2 border-dashed border-ink/20 p-6 text-center text-ink/70">
        Add a stem first, then tap it on the canvas to adjust it.
      </p>
    );
  }

  const stem = stems.find((s) => s.id === selectedId) ?? stems[stems.length - 1];
  const item = items.find((i) => i.id === stem.itemId);
  if (!item) return null;
  const color = item.colors.find((c) => c.id === stem.colorId) ?? item.colors[0];
  const layer = stems.indexOf(stem);

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="sr-only">Stem to edit</span>
        <select
          value={stem.id}
          onChange={(e) => select(e.target.value)}
          className="w-full rounded-2xl border-2 border-ink/15 bg-white/70 px-3 py-2 text-ink"
        >
          {stems.map((s, i) => (
            <option key={s.id} value={s.id}>
              {String(i + 1).padStart(2, "0")} · {items.find((it) => it.id === s.itemId)?.name ?? s.itemId}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3 rounded-3xl bg-white/70 p-3">
        <ArtworkThumb artworkKey={item.artworkKey} color={color.hex} className="h-20 w-20 shrink-0" />
        <div>
          <p className="font-display text-xl text-ink">{item.name}</p>
          <p className="text-sm text-ink/70">{color.name}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 font-display text-base text-ink">Color</p>
        <Swatches
          label={`${item.name} color`}
          colors={item.colors}
          value={stem.colorId}
          onChange={(colorId) => updateStem(stem.id, { colorId })}
        />
      </div>

      <Slider
        label="Height"
        value={stem.height}
        min={HEIGHT_RANGE.min}
        max={HEIGHT_RANGE.max}
        step={1}
        display={`${Math.round(stem.height)} cm`}
        onChange={(height) => updateStem(stem.id, { height })}
      />
      <Slider
        label="Tilt"
        value={stem.angle}
        min={ANGLE_RANGE.min}
        max={ANGLE_RANGE.max}
        step={1}
        display={`${Math.round(stem.angle)}°`}
        onChange={(angle) => updateStem(stem.id, { angle })}
      />

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => moveStem(stem.id, "backward")}
          disabled={layer === 0}
          className="btn-soft"
        >
          Move back
        </button>
        <button
          type="button"
          onClick={() => moveStem(stem.id, "forward")}
          disabled={layer === stems.length - 1}
          className="btn-soft"
        >
          Move forward
        </button>
        <button
          type="button"
          onClick={() => {
            if (duplicateStem(stem.id, item)) track({ type: "item_added", itemId: item.id, colorId: stem.colorId });
          }}
          disabled={!canAdd(stems, item)}
          className="btn-soft"
        >
          Duplicate
        </button>
        <button type="button" onClick={() => removeStem(stem.id)} className="btn-soft text-rose-deep">
          Remove
        </button>
      </div>
    </div>
  );
}
