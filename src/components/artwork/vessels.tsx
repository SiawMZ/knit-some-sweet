import { shade } from "@/lib/color";
import { type ArtProps, Stitch, filled } from "./parts";

/**
 * Vessels are drawn in bouquet-canvas coordinates (viewBox 0 0 400 520).
 * `Back` renders behind the stems and `Front` in front of them; stems are
 * gathered at the vessel's `gather` point.
 */

export function CeramicVaseBack({ color }: ArtProps) {
  return <ellipse cx={200} cy={364} rx={38} ry={8} fill={shade(color, -0.35)} />;
}

export function CeramicVaseFront({ color }: ArtProps) {
  return (
    <g>
      <ellipse cx={200} cy={480} rx={56} ry={7} fill="#000" opacity={0.08} />
      <path d="M162 364 C 159 420 163 464 177 476 L223 476 C 237 464 241 420 238 364 C 225 371 175 371 162 364 Z" {...filled(color, 2.4)} />
      <path d="M162 364 C 175 357 225 357 238 364" fill="none" stroke={shade(color, -0.38)} strokeWidth={2.4} />
      {[392, 412, 432, 452].map((y) => (
        <Stitch key={y} d={`M${167 - (y - 392) * 0.08} ${y} Q200 ${y + 5} ${233 + (y - 392) * 0.08} ${y}`} color={color} width={1.6} />
      ))}
      <path d="M172 380 Q170 420 178 456" stroke="#fff" strokeOpacity={0.45} strokeWidth={4} strokeLinecap="round" fill="none" />
    </g>
  );
}

export function BubblePotBack({ color }: ArtProps) {
  return <ellipse cx={200} cy={370} rx={30} ry={7} fill={shade(color, -0.35)} />;
}

export function BubblePotFront({ color }: ArtProps) {
  return (
    <g>
      <ellipse cx={200} cy={480} rx={60} ry={7} fill="#000" opacity={0.08} />
      <path d="M176 378 C 140 396 144 466 178 476 L222 476 C 256 466 260 396 224 378 Z" {...filled(color, 2.4)} />
      <rect x={168} y={364} width={64} height={16} rx={7} {...filled(shade(color, -0.06), 2.4)} />
      {[404, 426, 448].map((y) => (
        <Stitch key={y} d={`M158 ${y} Q200 ${y + 8} 242 ${y}`} color={color} width={1.6} />
      ))}
      <ellipse cx={170} cy={420} rx={5} ry={18} fill="#fff" opacity={0.35} />
    </g>
  );
}

const sheet = (d: string, color: string, key: string) => (
  <path key={key} d={d} {...filled(color, 2)} />
);

export function PaperWrapBack({ color }: ArtProps) {
  const back = shade(color, -0.08);
  return (
    <g>
      {sheet("M200 430 L104 268 C 128 250 158 258 170 274 Z", back, "l1")}
      {sheet("M200 430 L296 268 C 272 250 242 258 230 274 Z", back, "r1")}
      {sheet("M200 430 L140 238 C 162 226 190 234 196 250 Z", color, "l2")}
      {sheet("M200 430 L260 238 C 238 226 210 234 204 250 Z", color, "r2")}
    </g>
  );
}

export function PaperWrapFront({ color }: ArtProps) {
  const ribbon = "#fffaf0";
  return (
    <g>
      <path d="M128 318 C 150 372 176 410 192 446 L208 446 C 224 410 250 372 272 318 C 246 338 222 344 200 346 C 178 344 154 338 128 318 Z" {...filled(color, 2.4)} />
      <path d="M150 330 C 166 372 184 404 196 440" fill="none" stroke={shade(color, -0.2)} strokeWidth={1.6} opacity={0.6} />
      <path d="M250 330 C 234 372 216 404 204 440" fill="none" stroke={shade(color, -0.2)} strokeWidth={1.6} opacity={0.6} />
      <path d="M186 446 L214 446 L222 508 L200 498 L178 508 Z" {...filled(shade(color, -0.05), 2.4)} />
      <g transform="translate(200 432)">
        <path d="M0 0 C -14 -16 -32 -10 -26 2 C -22 10 -10 6 0 0 Z" {...filled(ribbon, 1.8)} />
        <path d="M0 0 C 14 -16 32 -10 26 2 C 22 10 10 6 0 0 Z" {...filled(ribbon, 1.8)} />
        <path d="M-2 2 L-14 34 L-7 30 L-3 36 Z" {...filled(ribbon, 1.6)} />
        <path d="M2 2 L14 34 L7 30 L3 36 Z" {...filled(ribbon, 1.6)} />
        <ellipse rx={6} ry={5} {...filled(ribbon, 1.8)} />
      </g>
    </g>
  );
}
