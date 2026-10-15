import { outlineOf, shade } from "@/lib/color";

/**
 * Artwork convention: every stem artwork is drawn with its anchor at (0, 0),
 * the point where the stem meets the head, and extends upward (negative y).
 * Blooms sit in roughly a 30-unit radius centered near (0, -28).
 */
export interface ArtProps {
  color: string;
}

export const STEM_GREEN = "#8fae84";
export const LEAF_GREEN = "#86a97a";
export const INK = "#4a3a30";
export const CREAM = "#fff4dc";
export const BUTTER = "#f6cf4f";

/** Dashed overlay that reads as crochet stitches. */
export function Stitch({
  d,
  color,
  width = 1.3,
  opacity = 0.7,
}: {
  d: string;
  color: string;
  width?: number;
  opacity?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={shade(color, -0.22)}
      strokeWidth={width}
      strokeDasharray="1.2 2.4"
      strokeLinecap="round"
      opacity={opacity}
    />
  );
}

/** Common props for a filled shape with a soft cartoon outline. */
export function filled(color: string, width = 2) {
  return {
    fill: color,
    stroke: outlineOf(color),
    strokeWidth: width,
    strokeLinejoin: "round" as const,
  };
}

/** Teardrop petal from the origin pointing up, `len` long and `w` half-wide. */
export function petalPath(len: number, w: number) {
  return `M0 0 C ${w} ${-len * 0.25}, ${w} ${-len * 0.85}, 0 ${-len} C ${-w} ${-len * 0.85}, ${-w} ${-len * 0.25}, 0 0 Z`;
}

/** Rounded-end petal, broader at the tip. */
export function roundPetalPath(len: number, w: number) {
  return `M0 0 C ${w * 0.6} ${-len * 0.2}, ${w * 1.1} ${-len * 0.6}, ${w * 0.7} ${-len * 0.9} Q 0 ${-len * 1.12} ${-w * 0.7} ${-len * 0.9} C ${-w * 1.1} ${-len * 0.6}, ${-w * 0.6} ${-len * 0.2}, 0 0 Z`;
}

export function Leaf({
  x,
  y,
  rotate,
  len = 22,
  color = LEAF_GREEN,
}: {
  x: number;
  y: number;
  rotate: number;
  len?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={petalPath(len, len * 0.38)} {...filled(color, 1.8)} />
      <Stitch d={`M0 -2 L0 ${-len + 3}`} color={color} />
    </g>
  );
}

/** Black graduation cap used by the friends. */
export function GradCap({ x, y, tassel }: { x: number; y: number; tassel?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-11 0 L11 0 L10 -8 L-10 -8 Z" {...filled("#3b3330", 1.6)} />
      <path d="M-20 -9 L0 -16 L20 -9 L0 -2 Z" {...filled("#3b3330", 1.6)} />
      {tassel && (
        <>
          <path d="M14 -8 Q18 -2 17 6" stroke={tassel} strokeWidth={2} fill="none" />
          <path d="M14 5 L20 5 L19 16 L15 16 Z" {...filled(tassel, 1.4)} />
        </>
      )}
    </g>
  );
}

/** Two dot eyes and optional blush. */
export function Face({
  y,
  gap = 8,
  blush,
}: {
  y: number;
  gap?: number;
  blush?: string;
}) {
  return (
    <g>
      {blush && (
        <>
          <ellipse cx={-gap - 5} cy={y + 6} rx={4} ry={2.5} fill={blush} opacity={0.7} />
          <ellipse cx={gap + 5} cy={y + 6} rx={4} ry={2.5} fill={blush} opacity={0.7} />
        </>
      )}
      <ellipse cx={-gap} cy={y} rx={2.2} ry={2.8} fill={INK} />
      <ellipse cx={gap} cy={y} rx={2.2} ry={2.8} fill={INK} />
      <circle cx={-gap + 0.8} cy={y - 1} r={0.8} fill="#fff" />
      <circle cx={gap + 0.8} cy={y - 1} r={0.8} fill="#fff" />
    </g>
  );
}
