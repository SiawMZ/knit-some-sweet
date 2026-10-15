import type { ComponentType } from "react";
import { shade } from "@/lib/color";
import {
  BabyBlossoms,
  CallaLily,
  Carnation,
  ClassicRose,
  Cosmos,
  Lily,
  Peony,
  PuffFlower,
  RolledRose,
  SmileyFlower,
  StarBlossom,
  Sunflower,
  Tulip,
} from "./blooms";
import { BerrySprig, Lavender, LeafSprig } from "./fillers";
import { Bear, Chick, Piggy } from "./friends";
import type { ArtProps } from "./parts";
import { STEM_GREEN } from "./parts";
import {
  BubblePotBack,
  BubblePotFront,
  CeramicVaseBack,
  CeramicVaseFront,
  PaperWrapBack,
  PaperWrapFront,
} from "./vessels";

export interface StemArtwork {
  Component: ComponentType<ArtProps>;
  /** Stem color for a given head color. */
  stemColor: (color: string) => string;
  /** How far above the anchor the artwork reaches, used for thumbnails. */
  reach: number;
}

const green = () => STEM_GREEN;
const sameHue = (c: string) => shade(c, -0.15);

export const stemArtworks = {
  "puff-flower": { Component: PuffFlower, stemColor: green, reach: 56 },
  cosmos: { Component: Cosmos, stemColor: green, reach: 60 },
  peony: { Component: Peony, stemColor: green, reach: 58 },
  lily: { Component: Lily, stemColor: green, reach: 62 },
  "calla-lily": { Component: CallaLily, stemColor: green, reach: 66 },
  "rolled-rose": { Component: RolledRose, stemColor: () => "#4f6b45", reach: 46 },
  "classic-rose": { Component: ClassicRose, stemColor: green, reach: 54 },
  carnation: { Component: Carnation, stemColor: () => "#4f6b45", reach: 56 },
  tulip: { Component: Tulip, stemColor: () => "#5f7f55", reach: 50 },
  sunflower: { Component: Sunflower, stemColor: green, reach: 62 },
  "star-blossom": { Component: StarBlossom, stemColor: green, reach: 62 },
  "baby-blossoms": { Component: BabyBlossoms, stemColor: green, reach: 54 },
  "smiley-flower": { Component: SmileyFlower, stemColor: green, reach: 62 },
  lavender: { Component: Lavender, stemColor: sameHue, reach: 112 },
  "leaf-sprig": { Component: LeafSprig, stemColor: sameHue, reach: 116 },
  "berry-sprig": { Component: BerrySprig, stemColor: green, reach: 110 },
  piggy: { Component: Piggy, stemColor: sameHue, reach: 64 },
  chick: { Component: Chick, stemColor: sameHue, reach: 74 },
  bear: { Component: Bear, stemColor: sameHue, reach: 72 },
} satisfies Record<string, StemArtwork>;

export type StemArtworkKey = keyof typeof stemArtworks;

export interface VesselArtwork {
  Back: ComponentType<ArtProps>;
  Front: ComponentType<ArtProps>;
  /** Where stems meet, in canvas coordinates. */
  gather: { x: number; y: number };
}

export const vesselArtworks = {
  "ceramic-vase": { Back: CeramicVaseBack, Front: CeramicVaseFront, gather: { x: 200, y: 392 } },
  "bubble-pot": { Back: BubblePotBack, Front: BubblePotFront, gather: { x: 200, y: 396 } },
  "paper-wrap": { Back: PaperWrapBack, Front: PaperWrapFront, gather: { x: 200, y: 428 } },
} satisfies Record<string, VesselArtwork>;

export type VesselArtworkKey = keyof typeof vesselArtworks;
