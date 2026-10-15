function toRgb(hex: string): [number, number, number] {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

/** Mix a hex color toward black (amount < 0) or white (amount > 0). */
export function shade(hex: string, amount: number): string {
  const target = amount < 0 ? 0 : 255;
  const t = Math.min(Math.abs(amount), 1);
  return (
    "#" +
    toRgb(hex)
      .map((c) => Math.round(c + (target - c) * t))
      .map((c) => c.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Cartoon outline color for a fill: a soft, darker shade of it. */
export const outlineOf = (hex: string) => shade(hex, -0.22);
