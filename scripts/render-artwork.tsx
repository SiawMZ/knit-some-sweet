/**
 * Render a registry artwork to a PNG, so a drawing can be checked by eye
 * (used by the `/draw-requests` Claude Code command).
 *
 *   npm run artwork:render -- <key> [#hex ...]
 *
 * Draws the artwork in each color (default: a few palette colors) next to an
 * existing artwork of the same type for a style comparison, and writes
 * drawing-requests/render-<key>.png.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { renderToStaticMarkup } from "react-dom/server";
import { stemArtworks, vesselArtworks } from "../src/components/artwork/registry";

const DEFAULT_COLORS = ["#f4b6c2", "#d7263d", "#f7d774", "#fdfaf3", "#b48ad6"];
const CELL = 220;

function stemCell(key: keyof typeof stemArtworks, color: string, x: number) {
  const { Component, stemColor, reach } = stemArtworks[key];
  const size = reach + 40;
  // Same framing as ArtworkThumb.
  return (
    <svg key={`${key}-${color}-${x}`} x={x} y={0} width={CELL} height={CELL} viewBox={`${-size / 2} ${-reach - 8} ${size} ${size}`}>
      <path d="M0 0 L0 30" stroke={stemColor(color)} strokeWidth={3} strokeLinecap="round" />
      <Component color={color} />
    </svg>
  );
}

function vesselCell(key: keyof typeof vesselArtworks, color: string, x: number) {
  const { Back, Front } = vesselArtworks[key];
  return (
    <svg key={`${key}-${color}-${x}`} x={x} y={0} width={CELL} height={CELL} viewBox="100 220 200 300">
      <Back color={color} />
      <Front color={color} />
    </svg>
  );
}

async function main() {
  const [key, ...hexes] = process.argv.slice(2);
  if (!key) throw new Error("Usage: npm run artwork:render -- <key> [#hex ...]");
  const colors = hexes.length ? hexes : DEFAULT_COLORS;
  const isStem = Object.hasOwn(stemArtworks, key);
  if (!isStem && !Object.hasOwn(vesselArtworks, key)) throw new Error(`"${key}" isn't in the artwork registry.`);

  // An existing artwork first, in the same pink, as the style reference.
  const reference = isStem ? (key === "tulip" ? "puff-flower" : "tulip") : key === "ceramic-vase" ? "bubble-pot" : "ceramic-vase";
  const cells = isStem
    ? [stemCell(reference as keyof typeof stemArtworks, colors[0], 0), ...colors.map((c, i) => stemCell(key as keyof typeof stemArtworks, c, (i + 1) * CELL))]
    : [vesselCell(reference as keyof typeof vesselArtworks, colors[0], 0), ...colors.map((c, i) => vesselCell(key as keyof typeof vesselArtworks, c, (i + 1) * CELL))];

  const width = CELL * cells.length;
  const svg = renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={CELL + 24} viewBox={`0 0 ${width} ${CELL + 24}`}>
      <rect width={width} height={CELL + 24} fill="#fff6ea" />
      {cells}
      <text x={CELL / 2} y={CELL + 16} textAnchor="middle" fontSize={13} fill="#5a4434">
        reference: {reference}
      </text>
      <text x={CELL + (width - CELL) / 2} y={CELL + 16} textAnchor="middle" fontSize={13} fill="#5a4434">
        {key}
      </text>
    </svg>,
  );
  const png = new Resvg(svg, { font: { loadSystemFonts: true } }).render().asPng();
  const out = path.join(process.cwd(), "drawing-requests", `render-${key}.png`);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, png);
  console.log(`Wrote ${path.relative(process.cwd(), out).replaceAll("\\", "/")}`);
}

main().catch((e: Error) => {
  console.error(e.message);
  process.exitCode = 1;
});
