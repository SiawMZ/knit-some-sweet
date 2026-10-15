import type { StemArtworkKey, VesselArtworkKey } from "@/components/artwork/registry";

export type ItemCategory = "bloom" | "filler" | "friend";

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

/** Something that goes into the bouquet on its own stem. */
export interface CatalogItem {
  id: string;
  name: string;
  category: ItemCategory;
  artworkKey: StemArtworkKey;
  /** Most stems of this item a single bouquet may contain. */
  maxQuantity: number;
  /** Colors the seller currently offers. The first one is the default. */
  colors: ColorOption[];
  /** Default stem height in cm. */
  defaultHeight: number;
  active: boolean;
}

export type VesselKind = "vase" | "wrap";

export interface Vessel {
  id: string;
  name: string;
  kind: VesselKind;
  artworkKey: VesselArtworkKey;
  colors: ColorOption[];
  active: boolean;
}

export interface Catalog {
  items: CatalogItem[];
  vessels: Vessel[];
}
