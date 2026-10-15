import { shade } from "@/lib/color";
import { type ArtProps, Leaf, STEM_GREEN, Stitch, filled } from "./parts";

/** Fillers are sprigs: they carry their own stem up to about y = -100. */

export function Lavender({ color }: ArtProps) {
  const stem = shade(color, -0.12);
  const buds = Array.from({ length: 8 }, (_, i) => -18 - i * 11);
  return (
    <g>
      <path d="M0 0 Q2 -50 -2 -100" stroke={stem} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {buds.map((y, i) => {
        const s = 1 - i * 0.06;
        const x = i % 2 ? 1.2 : -1.2;
        return (
          <g key={y} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse cx={-5} cy={0} rx={5.5} ry={4.2} {...filled(color, 1.4)} />
            <ellipse cx={5} cy={0} rx={5.5} ry={4.2} {...filled(color, 1.4)} />
            <ellipse cx={0} cy={-2} rx={4} ry={3.6} {...filled(shade(color, 0.12), 1.4)} />
          </g>
        );
      })}
      <ellipse cx={-2} cy={-106} rx={4} ry={5} {...filled(color, 1.4)} />
    </g>
  );
}

export function LeafSprig({ color }: ArtProps) {
  const stem = shade(color, -0.15);
  const pairs = [-30, -55, -78];
  return (
    <g>
      <path d="M0 0 Q3 -50 0 -96" stroke={stem} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {pairs.map((y, i) => (
        <g key={y}>
          <Leaf x={1} y={y} rotate={-55 + i * 4} len={22 - i * 2} color={color} />
          <Leaf x={1} y={y} rotate={55 - i * 4} len={22 - i * 2} color={color} />
        </g>
      ))}
      <Leaf x={0} y={-94} rotate={5} len={20} color={color} />
    </g>
  );
}

export function BerrySprig({ color }: ArtProps) {
  const twigs: [number, number, number, number][] = [
    [0, -30, -14, -36],
    [1, -32, 14, -38],
    [1, -58, -13, -64],
    [1, -60, 13, -68],
  ];
  return (
    <g>
      <path d="M0 0 Q3 -50 0 -96" stroke={STEM_GREEN} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {twigs.map(([x1, y1, x2, y2]) => (
        <path key={`${x2}${y2}`} d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#5b5148" strokeWidth={1.2} />
      ))}
      {[...twigs.map(([, , x, y]) => [x, y]), [0, -100]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <circle cx={x} cy={y} r={7.5} {...filled(color, 1.6)} />
          <Stitch d={`M${x - 4} ${y} a4 4 0 1 0 8 0`} color={color} />
        </g>
      ))}
    </g>
  );
}
