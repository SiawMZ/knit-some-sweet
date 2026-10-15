import type { ColorOption } from "@/lib/catalog/types";

export function Swatches({
  colors,
  value,
  onChange,
  label,
}: {
  colors: ColorOption[];
  value: string | null;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {colors.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.id)}
            className={`size-9 rounded-full border-2 transition-transform hover:scale-110 ${
              active ? "border-ink ring-2 ring-rose ring-offset-2 ring-offset-paper" : "border-ink/20"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm">
        <span className="font-display text-base text-ink">{label}</span>
        <span className="tabular-nums text-ink/70">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="yarn-range mt-2 w-full"
      />
    </label>
  );
}
