import { outlineOf, shade } from "@/lib/color";
import {
  type ArtProps,
  BUTTER,
  INK,
  LEAF_GREEN,
  Leaf,
  STEM_GREEN,
  Stitch,
  filled,
  petalPath,
  roundPetalPath,
} from "./parts";

const ring = (n: number, offset = 0) =>
  Array.from({ length: n }, (_, i) => offset + (360 / n) * i);

/** Point at `deg` (0 = up) on a circle; rounded so server and client markup match. */
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { cx: Math.round(Math.sin(a) * r * 100) / 100, cy: Math.round(-Math.cos(a) * r * 100) / 100 };
};

export function PuffFlower({ color }: ArtProps) {
  const cy = -27;
  return (
    <g>
      {ring(5, -90).map((a) => (
        <g key={a} transform={`translate(0 ${cy}) rotate(${a + 90})`}>
          <ellipse cx={0} cy={-14} rx={12} ry={13} {...filled(color)} />
          <Stitch d="M0 -4 L0 -25" color={color} />
          <Stitch d="M-6 -5 Q-10 -14 -5 -24" color={color} />
          <Stitch d="M6 -5 Q10 -14 5 -24" color={color} />
        </g>
      ))}
      <circle cx={0} cy={cy} r={8} {...filled(shade(color, 0.7))} />
    </g>
  );
}

export function Cosmos({ color }: ArtProps) {
  const cy = -28;
  const petal =
    "M0 0 C 8 -5, 11 -20, 8 -28 Q 5 -32 2.5 -29 Q 0 -32 -2.5 -29 Q -5 -32 -8 -28 C -11 -20, -8 -5, 0 0 Z";
  return (
    <g>
      {ring(8, 0).map((a) => (
        <g key={a} transform={`translate(0 ${cy}) rotate(${a})`}>
          <path d={petal} {...filled(color, 1.8)} />
          <Stitch d="M0 -4 L0 -25" color={color} />
        </g>
      ))}
      <circle cx={0} cy={cy} r={7} {...filled(BUTTER)} />
      <Stitch d={`M-4 ${cy} a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0`} color={BUTTER} />
    </g>
  );
}

export function Peony({ color }: ArtProps) {
  const cy = -28;
  const inner = shade(color, 0.12);
  return (
    <g transform={`translate(0 ${cy})`}>
      {ring(7, 10).map((a) => (
        <g key={`o${a}`} transform={`rotate(${a})`}>
          <circle cx={0} cy={-17} r={12} {...filled(color)} />
          <Stitch d="M-6 -12 Q0 -26 6 -12" color={color} />
        </g>
      ))}
      {ring(5, 30).map((a) => (
        <g key={`i${a}`} transform={`rotate(${a})`}>
          <circle cx={0} cy={-8} r={9} {...filled(inner)} />
        </g>
      ))}
      <path d="M-3 0 Q-2 -6 -4 -9 M1 0 Q2 -6 4 -9 M0 1 L0 -8" stroke={BUTTER} strokeWidth={2} strokeLinecap="round" fill="none" />
    </g>
  );
}

export function Lily({ color }: ArtProps) {
  const cy = -28;
  return (
    <g>
      <Leaf x={4} y={8} rotate={45} len={26} />
      <g transform={`translate(0 ${cy})`}>
        {ring(6, 0).map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={petalPath(33, 9)} {...filled(color, 1.8)} />
            <Stitch d="M0 -4 L0 -28" color={LEAF_GREEN} width={1.6} opacity={0.8} />
          </g>
        ))}
        {[-30, -10, 10, 30].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0 0 L0 -16" stroke={LEAF_GREEN} strokeWidth={1.4} />
            <ellipse cx={0} cy={-17} rx={1.8} ry={3} fill={BUTTER} stroke={outlineOf(BUTTER)} strokeWidth={0.8} />
          </g>
        ))}
      </g>
    </g>
  );
}

export function CallaLily({ color }: ArtProps) {
  const spathe =
    "M0 0 C -16 -10 -24 -34 -14 -50 C -6 -62 6 -60 12 -58 L 16 -64 C 22 -50 22 -28 12 -12 C 7 -5 3 -2 0 0 Z";
  return (
    <g>
      <path d={spathe} {...filled(color)} />
      <ellipse cx={1} cy={-40} rx={10} ry={14} fill={shade(color, -0.08)} />
      <Stitch d="M-8 -14 Q-16 -30 -10 -48" color={color} />
      <Stitch d="M10 -14 Q18 -30 14 -52" color={color} />
      <path d="M-2.5 -16 C -6 -28 -4 -40 1 -45 C 6 -40 6 -28 2.5 -16 Z" {...filled("#f2b33d", 1.4)} />
      <circle cx={0} cy={-1} r={4.5} {...filled(LEAF_GREEN, 1.4)} />
    </g>
  );
}

export function RolledRose({ color }: ArtProps) {
  const cy = -24;
  return (
    <g>
      {[-60, 0, 60, 180].map((a) => (
        <g key={a} transform={`translate(0 -8) rotate(${a + 180})`}>
          <path d={petalPath(16, 5)} {...filled(LEAF_GREEN, 1.4)} />
        </g>
      ))}
      <circle cx={0} cy={cy} r={20} {...filled(color)} />
      <path
        d={`M0 ${cy} m -2 0 a 2 2 0 1 1 4 0 a 5 5 0 1 1 -10 0 a 8 8 0 1 1 16 0 a 11 11 0 1 1 -22 0 a 14 14 0 1 1 28 0`}
        fill="none"
        stroke={outlineOf(color)}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Stitch d={`M0 ${cy} m -6 1 a 7 7 0 1 1 14 0 a 10 10 0 1 1 -20 0`} color={color} />
    </g>
  );
}

export function ClassicRose({ color }: ArtProps) {
  const cy = -27;
  const light = shade(color, 0.1);
  return (
    <g>
      <path d="M-10 -6 Q0 2 10 -6 L8 -12 L-8 -12 Z" {...filled(LEAF_GREEN, 1.6)} />
      <g transform={`translate(0 ${cy})`}>
        {ring(5, 18).map((a) => (
          <circle key={a} {...polar(a, 13)} r={12} {...filled(color)} />
        ))}
        {ring(3, 0).map((a) => (
          <circle key={a} {...polar(a, 6)} r={9} {...filled(light)} />
        ))}
        <circle cx={0} cy={0} r={6.5} {...filled(color)} />
        <path d="M-3 1 Q0 -6 4 -1 Q2 3 -1 2" fill="none" stroke={outlineOf(color)} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Carnation({ color }: ArtProps) {
  const puffs: [number, number][] = [
    [-18, -20], [-9, -25], [0, -27], [9, -25], [18, -20],
    [-13, -34], [0, -37], [13, -34], [-6, -44], [6, -44],
  ];
  return (
    <g>
      <Leaf x={-2} y={14} rotate={-55} len={28} />
      <path d="M-7 0 C -8 -6 -8 -10 -10 -14 L 10 -14 C 8 -10 8 -6 7 0 Z" {...filled(LEAF_GREEN, 1.6)} />
      {puffs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9.5} {...filled(i % 2 ? shade(color, 0.08) : color)} />
      ))}
      <Stitch d="M-22 -16 L-16 -22 L-10 -16 L-4 -22 L2 -16 L8 -22 L14 -16 L20 -22" color={color} />
      <Stitch d="M-14 -38 L-8 -44 L-2 -38 L4 -44 L10 -38" color={color} />
    </g>
  );
}

export function Tulip({ color }: ArtProps) {
  const back = shade(color, -0.1);
  return (
    <g>
      <Leaf x={0} y={30} rotate={-28} len={42} color="#7f9e86" />
      <path d="M-12 -10 C -16 -28 -10 -44 0 -48 C 10 -44 16 -28 12 -10 C 8 -4 -8 -4 -12 -10 Z" {...filled(back)} />
      <path d="M0 -3 C -12 -3 -19 -18 -17 -34 C -13 -43 -6 -42 -2 -36 C 2 -26 2 -12 0 -3 Z" {...filled(color)} />
      <path d="M0 -3 C 12 -3 19 -18 17 -34 C 13 -43 6 -42 2 -36 C -2 -26 -2 -12 0 -3 Z" {...filled(color)} />
      <path d="M-7 -5 C -10 -19 -8 -33 0 -41 C 8 -33 10 -19 7 -5 C 4 -1 -4 -1 -7 -5 Z" {...filled(shade(color, 0.06))} />
      <Stitch d="M0 -6 L0 -36" color={color} />
      <Stitch d="M-12 -10 Q-15 -22 -13 -32" color={color} />
      <Stitch d="M12 -10 Q15 -22 13 -32" color={color} />
    </g>
  );
}

export function Sunflower({ color }: ArtProps) {
  const cy = -30;
  const seed = "#7a5230";
  return (
    <g>
      <Leaf x={-3} y={22} rotate={-60} len={30} />
      <g transform={`translate(0 ${cy})`}>
        {ring(16, 11).map((a) => (
          <g key={`b${a}`} transform={`rotate(${a})`}>
            <path d={petalPath(30, 6)} {...filled(shade(color, -0.06), 1.6)} />
          </g>
        ))}
        {ring(16, 0).map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d={petalPath(27, 6)} {...filled(color, 1.6)} />
            <Stitch d="M0 -14 L0 -24" color={color} />
          </g>
        ))}
        <circle r={14} {...filled(seed)} />
        <circle r={8} fill={shade(seed, 0.12)} />
        <Stitch d="M-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0" color={shade(seed, 0.5)} width={2} />
        <Stitch d="M-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" color={shade(seed, 0.5)} width={1.6} />
      </g>
    </g>
  );
}

export function StarBlossom({ color }: ArtProps) {
  const cy = -28;
  const petal = "M0 0 C 12 -6 15 -24 5 -32 C -1 -35 -8 -29 -8 -21 C -8 -12 -6 -4 0 0 Z";
  return (
    <g transform={`translate(0 ${cy})`}>
      {ring(5, 0).map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={petal} {...filled(color, 1.8)} />
          <Stitch d="M1 -5 Q4 -16 2 -27" color={color} />
        </g>
      ))}
      <circle r={5.5} {...filled("#f8a94a", 1.4)} />
      {ring(8, 0).map((a) => (
        <path key={a} d="M0 -4 L0 -8" transform={`rotate(${a})`} stroke="#f39a32" strokeWidth={1.8} strokeLinecap="round" />
      ))}
    </g>
  );
}

function MiniBlossom({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {ring(5, 0).map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={roundPetalPath(10, 5)} {...filled(color, 1.4)} />
        </g>
      ))}
      <ellipse rx={2.2} ry={1.6} fill="none" stroke={BUTTER} strokeWidth={1.6} />
    </g>
  );
}

export function BabyBlossoms({ color }: ArtProps) {
  return (
    <g>
      <path d="M0 0 Q-6 -12 -13 -20 M0 0 Q6 -14 11 -26 M0 0 Q0 -20 -1 -40" stroke={STEM_GREEN} strokeWidth={2} fill="none" />
      <MiniBlossom x={-13} y={-22} color={color} />
      <MiniBlossom x={11} y={-28} color={color} />
      <MiniBlossom x={-1} y={-42} color={color} />
    </g>
  );
}

const RAINBOW = ["#e8505b", "#f5925b", "#f7c548", "#9fcf7f", "#7fb6e8", "#b28ad8"];

export function SmileyFlower({ color }: ArtProps) {
  const cy = -30;
  return (
    <g transform={`translate(0 ${cy})`}>
      {ring(12, 0).map((a, i) => (
        <g key={a} transform={`rotate(${a})`}>
          <circle cx={0} cy={-22} r={7.5} {...filled(RAINBOW[Math.floor(i / 2)], 1.6)} />
        </g>
      ))}
      <circle r={18} {...filled(color)} />
      <Stitch d="M-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0" color={color} />
      <circle cx={-6} cy={-4} r={2.2} fill={INK} />
      <circle cx={6} cy={-4} r={2.2} fill={INK} />
      <path d="M-9 3 Q0 12 9 3" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

