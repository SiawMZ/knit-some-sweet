import { stemArtworks, type StemArtworkKey } from "./registry";

/** Small preview of a stem artwork with a short stem, for cards and lists. */
export function ArtworkThumb({
  artworkKey,
  color,
  className,
}: {
  artworkKey: StemArtworkKey;
  color: string;
  className?: string;
}) {
  const { Component, stemColor, reach } = stemArtworks[artworkKey];
  const top = -reach - 8;
  const size = reach + 40;
  return (
    <svg
      viewBox={`${-size / 2} ${top} ${size} ${size}`}
      className={className}
      aria-hidden
    >
      <path d="M0 0 L0 30" stroke={stemColor(color)} strokeWidth={3} strokeLinecap="round" />
      <Component color={color} />
    </svg>
  );
}
