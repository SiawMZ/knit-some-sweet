"use client";

import type { ColorOption } from "@/lib/catalog/types";

/**
 * Pick the allowed colors from the palette, in order. The first one is the
 * default customers start with. Submits one `colorIds` field per color.
 */
export function ColorChooser({
  palette,
  value,
  onChange,
}: {
  palette: ColorOption[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const chosen = value.map((id) => palette.find((c) => c.id === id)).filter((c) => c !== undefined);
  const move = (i: number, by: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((id) => (
        <input key={id} type="hidden" name="colorIds" value={id} />
      ))}
      {chosen.length === 0 ? (
        <p className="rounded-2xl border-2 border-dashed border-ink/20 p-3 text-sm text-ink/70">
          No colors yet. Pick some from the palette below.
        </p>
      ) : (
        <ol className="space-y-1">
          {chosen.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-2xl bg-white/80 px-2 py-1">
              <span className="size-6 shrink-0 rounded-full border-2 border-ink/20" style={{ backgroundColor: c.hex }} />
              <span className="flex-1 text-sm">
                {c.name}
                {i === 0 && <span className="ml-2 rounded-full bg-butter/60 px-2 text-xs">default</span>}
              </span>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${c.name} up`}
                className="size-7 rounded-full border-2 border-ink/15 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === chosen.length - 1}
                aria-label={`Move ${c.name} down`}
                className="size-7 rounded-full border-2 border-ink/15 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== c.id))}
                aria-label={`Remove ${c.name}`}
                className="size-7 rounded-full border-2 border-ink/15 text-rose-deep"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}
      <div>
        <p className="mb-1 text-sm text-ink/70">Palette · tap to add or remove</p>
        <ul className="flex flex-wrap gap-2">
          {palette.map((c) => {
            const on = value.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onChange(on ? value.filter((v) => v !== c.id) : [...value, c.id])}
                  aria-pressed={on}
                  title={c.name}
                  aria-label={`${on ? "Remove" : "Add"} ${c.name}`}
                  className={`size-9 rounded-full border-2 transition ${on ? "border-ink ring-2 ring-rose ring-offset-2" : "border-ink/20 hover:border-ink/50"}`}
                  style={{ backgroundColor: c.hex }}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
