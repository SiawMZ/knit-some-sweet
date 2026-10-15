import { shade } from "@/lib/color";
import { type ArtProps, CREAM, Face, GradCap, INK, Stitch, filled } from "./parts";

/** Amigurumi friends on a stem. Bodies are centered near (0, -32). */

export function Piggy({ color }: ArtProps) {
  const dark = shade(color, -0.18);
  const bow = shade(color, -0.25);
  return (
    <g transform="translate(0 -30)">
      <ellipse cx={-21} cy={18} rx={6} ry={5} {...filled(color)} />
      <ellipse cx={21} cy={18} rx={6} ry={5} {...filled(color)} />
      <path d="M-18 -16 L-22 -28 L-8 -22 Z" {...filled(color)} />
      <path d="M18 -16 L22 -28 L8 -22 Z" {...filled(color)} />
      <ellipse cx={0} cy={0} rx={26} ry={24} {...filled(color)} />
      <Stitch d="M-22 -6 Q0 -12 22 -6" color={color} />
      <Stitch d="M-24 6 Q0 1 24 6" color={color} />
      <ellipse cx={-25} cy={6} rx={5} ry={6} {...filled(color)} />
      <ellipse cx={25} cy={6} rx={5} ry={6} {...filled(color)} />
      <Face y={-4} gap={9} blush={dark} />
      <ellipse cx={0} cy={6} rx={8} ry={5.5} {...filled(dark, 1.6)} />
      <ellipse cx={-2.8} cy={6} rx={1.2} ry={2} fill={INK} />
      <ellipse cx={2.8} cy={6} rx={1.2} ry={2} fill={INK} />
      <g transform="translate(0 -25)">
        <path d="M0 0 L-14 -8 Q-17 0 -14 8 Z" {...filled(bow, 1.6)} />
        <path d="M0 0 L14 -8 Q17 0 14 8 Z" {...filled(bow, 1.6)} />
        <circle r={4} {...filled(bow, 1.6)} />
      </g>
    </g>
  );
}

export function Chick({ color }: ArtProps) {
  const orange = "#f08a4b";
  return (
    <g transform="translate(0 -32)">
      <ellipse cx={-9} cy={25} rx={6} ry={4.5} {...filled(orange)} />
      <ellipse cx={9} cy={25} rx={6} ry={4.5} {...filled(orange)} />
      <path d="M-22 -2 Q-34 0 -28 8 Q-24 8 -20 6 Z" {...filled(color)} />
      <path d="M22 -2 Q34 0 28 8 Q24 8 20 6 Z" {...filled(color)} />
      <ellipse cx={0} cy={0} rx={23} ry={26} {...filled(color)} />
      <Stitch d="M-20 -10 Q0 -16 20 -10" color={color} />
      <Stitch d="M-22 8 Q0 3 22 8" color={color} />
      <Face y={-4} gap={8} blush="#f6a98d" />
      <path d="M-6 2 Q0 -2 6 2 Q4 9 0 9 Q-4 9 -6 2 Z" {...filled(orange, 1.6)} />
      <GradCap x={0} y={-24} />
    </g>
  );
}

export function Bear({ color }: ArtProps) {
  const inner = shade(color, 0.3);
  return (
    <g transform="translate(0 -30)">
      <circle cx={-19} cy={-17} r={8} {...filled(color)} />
      <circle cx={19} cy={-17} r={8} {...filled(color)} />
      <circle cx={-19} cy={-17} r={4} fill={inner} />
      <circle cx={19} cy={-17} r={4} fill={inner} />
      <circle r={25} {...filled(color)} />
      <Stitch d="M-21 -8 Q0 -14 21 -8" color={color} />
      <Stitch d="M-23 8 Q0 3 23 8" color={color} />
      <Face y={-3} gap={10} />
      <ellipse cx={0} cy={7} rx={8.5} ry={6.5} {...filled(CREAM, 1.6)} />
      <path d="M-3 4 Q0 2 3 4 Q0 8 -3 4 Z M0 6 L0 9" fill={INK} stroke={INK} strokeWidth={1.2} />
      <GradCap x={0} y={-22} tassel="#d9473f" />
    </g>
  );
}

const MILK = "#fffaf2";
const EAR_PINK = "#f4b3b8";

/** A fluffy long-haired cat: white muzzle, paws and tail tip, tabby stripes on the forehead. */
export function Cat({ color }: ArtProps) {
  const stripe = shade(color, -0.28);
  return (
    <g transform="translate(0 -30)">
      {/* Fluffy tail curling up behind the head. */}
      <path d="M14 14 Q30 19 37 11 Q43 4 40 -4 Q43 -13 35 -18 Q27 -20 26 -13 Q30 0 17 5 Z" {...filled(color)} />
      <path d="M41.5 -9 Q42 -15 35 -18 Q28 -19.5 26.5 -14 Q32 -14 36 -11 Q39 -9 41.5 -9 Z" {...filled(MILK, 1.6)} />
      <Stitch d="M19 11 Q34 9 35 -6" color={color} />
      {/* Ears. */}
      <path d="M-24 -6 L-20 -30 Q-18.5 -33 -16 -31 L-4 -20 Z" {...filled(color)} />
      <path d="M24 -6 L20 -30 Q18.5 -33 16 -31 L4 -20 Z" {...filled(color)} />
      <path d="M-19 -12 L-18 -26 L-9 -19 Z" fill={EAR_PINK} />
      <path d="M19 -12 L18 -26 L9 -19 Z" fill={EAR_PINK} />
      {/* Long-hair cheek tufts. */}
      <path d="M-22 -2 L-31 2 L-25 6 L-31 10 L-24 13 L-28 17 L-18 16 Z" {...filled(color)} />
      <path d="M22 -2 L31 2 L25 6 L31 10 L24 13 L28 17 L18 16 Z" {...filled(color)} />
      <ellipse cx={0} cy={0} rx={26} ry={22} {...filled(color)} />
      <Stitch d="M-21 -9 Q0 -15 21 -9" color={color} />
      <Stitch d="M-24 6 Q0 1 24 6" color={color} />
      <path d="M-6 -20 L-5 -14 M0 -21 L0 -14 M6 -20 L5 -14" stroke={stripe} strokeWidth={2} strokeLinecap="round" />
      <Face y={-4} gap={10} blush="#f6a98d" />
      {/* White muzzle, pink nose, little mouth and whiskers. */}
      <circle cx={-4.5} cy={8} r={5.5} {...filled(MILK, 1.4)} />
      <circle cx={4.5} cy={8} r={5.5} {...filled(MILK, 1.4)} />
      <path d="M-2.6 3.6 L2.6 3.6 L0 6.6 Z" fill={EAR_PINK} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
      <path d="M0 6.6 Q-1.8 9.6 -3.8 8.2 M0 6.6 Q1.8 9.6 3.8 8.2" fill="none" stroke={INK} strokeWidth={1.1} strokeLinecap="round" />
      <path
        d="M-10 7 L-20 5 M-10 9.5 L-20 10.5 M10 7 L20 5 M10 9.5 L20 10.5"
        stroke={INK}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.55}
      />
      {/* White front paws. */}
      <ellipse cx={-11} cy={21} rx={7} ry={5} {...filled(MILK)} />
      <ellipse cx={11} cy={21} rx={7} ry={5} {...filled(MILK)} />
      <Stitch d="M-11 18 L-11 22 M11 18 L11 22" color={MILK} />
    </g>
  );
}
