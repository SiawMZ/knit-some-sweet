import type { Catalog, ColorOption } from "./types";

/**
 * Starting catalog, based on the photos in image_ref/.
 * Until the database and seller admin exist, the builder reads this directly;
 * afterwards it becomes the Prisma seed.
 */

const c = (id: string, name: string, hex: string): ColorOption => ({ id, name, hex });

const palette = {
  hotPink: c("hot-pink", "Hot pink", "#e8457a"),
  blush: c("blush", "Blush pink", "#f4b6c2"),
  dustyPink: c("dusty-pink", "Dusty pink", "#df8fa0"),
  butter: c("butter", "Butter yellow", "#f7d774"),
  sunny: c("sunny", "Sunny yellow", "#f6c02c"),
  peach: c("peach", "Peach", "#fbd3a9"),
  orange: c("orange", "Tangerine", "#f08a3a"),
  red: c("red", "Rose red", "#d7263d"),
  burgundy: c("burgundy", "Burgundy", "#9e2a3f"),
  lilac: c("lilac", "Lilac", "#c7a6e6"),
  lavender: c("lavender", "Lavender", "#b48ad6"),
  grape: c("grape", "Grape purple", "#6a3aa6"),
  sky: c("sky", "Sky blue", "#9cc0ea"),
  white: c("white", "Milk white", "#fdfaf3"),
  cream: c("cream", "Cream", "#f6ecd0"),
  sage: c("sage", "Sage green", "#9cbf97"),
  olive: c("olive", "Cinnamon", "#b07a3a"),
  cocoa: c("cocoa", "Cocoa brown", "#a86b3c"),
  honey: c("honey", "Honey beige", "#d9b38c"),
  kraft: c("kraft", "Kraft brown", "#d8b48a"),
};

export const seedCatalog: Catalog = {
  items: [
    { id: "puff-flower", name: "Puff flower", category: "bloom", artworkKey: "puff-flower", maxQuantity: 12, defaultHeight: 28, active: true, colors: [palette.hotPink, palette.blush, palette.butter, palette.lilac, palette.red] },
    { id: "tulip", name: "Tulip", category: "bloom", artworkKey: "tulip", maxQuantity: 10, defaultHeight: 32, active: true, colors: [palette.dustyPink, palette.red, palette.butter, palette.white, palette.lilac] },
    { id: "classic-rose", name: "Classic rose", category: "bloom", artworkKey: "classic-rose", maxQuantity: 12, defaultHeight: 34, active: true, colors: [palette.red, palette.blush, palette.white, palette.burgundy] },
    { id: "rolled-rose", name: "Rolled rose", category: "bloom", artworkKey: "rolled-rose", maxQuantity: 12, defaultHeight: 26, active: true, colors: [palette.orange, palette.red, palette.blush, palette.butter] },
    { id: "sunflower", name: "Sunflower", category: "bloom", artworkKey: "sunflower", maxQuantity: 5, defaultHeight: 36, active: true, colors: [palette.sunny, palette.orange] },
    { id: "lily", name: "Lily", category: "bloom", artworkKey: "lily", maxQuantity: 5, defaultHeight: 38, active: true, colors: [palette.white, palette.blush, palette.peach] },
    { id: "calla-lily", name: "Calla lily", category: "bloom", artworkKey: "calla-lily", maxQuantity: 8, defaultHeight: 36, active: true, colors: [palette.white, palette.cream, palette.blush, palette.grape] },
    { id: "peony", name: "Peony", category: "bloom", artworkKey: "peony", maxQuantity: 6, defaultHeight: 30, active: true, colors: [palette.grape, palette.blush, palette.white, palette.red] },
    { id: "carnation", name: "Carnation", category: "bloom", artworkKey: "carnation", maxQuantity: 10, defaultHeight: 32, active: true, colors: [palette.red, palette.blush, palette.white] },
    { id: "cosmos", name: "Cosmos", category: "bloom", artworkKey: "cosmos", maxQuantity: 8, defaultHeight: 34, active: true, colors: [palette.peach, palette.butter, palette.white, palette.blush] },
    { id: "star-blossom", name: "Star blossom", category: "bloom", artworkKey: "star-blossom", maxQuantity: 8, defaultHeight: 30, active: true, colors: [palette.white, palette.sky, palette.blush] },
    { id: "smiley-flower", name: "Smiley flower", category: "bloom", artworkKey: "smiley-flower", maxQuantity: 3, defaultHeight: 34, active: true, colors: [palette.sunny, palette.blush] },
    { id: "baby-blossoms", name: "Baby blossoms", category: "filler", artworkKey: "baby-blossoms", maxQuantity: 10, defaultHeight: 24, active: true, colors: [palette.white, palette.blush, palette.lilac] },
    { id: "lavender", name: "Lavender", category: "filler", artworkKey: "lavender", maxQuantity: 10, defaultHeight: 22, active: true, colors: [palette.lavender, palette.lilac] },
    { id: "berry-sprig", name: "Berry sprig", category: "filler", artworkKey: "berry-sprig", maxQuantity: 8, defaultHeight: 22, active: true, colors: [palette.peach, palette.white, palette.red] },
    { id: "leaf-sprig", name: "Leaf sprig", category: "filler", artworkKey: "leaf-sprig", maxQuantity: 8, defaultHeight: 22, active: true, colors: [palette.sage, palette.olive] },
    { id: "piggy", name: "Piggy", category: "friend", artworkKey: "piggy", maxQuantity: 2, defaultHeight: 26, active: true, colors: [palette.blush, palette.peach] },
    { id: "grad-chick", name: "Graduation chick", category: "friend", artworkKey: "chick", maxQuantity: 2, defaultHeight: 26, active: true, colors: [palette.sunny, palette.white] },
    { id: "grad-bear", name: "Graduation bear", category: "friend", artworkKey: "bear", maxQuantity: 2, defaultHeight: 26, active: true, colors: [palette.cocoa, palette.honey, palette.white] },
  ],
  vessels: [
    { id: "paper-wrap", name: "Paper wrap & ribbon", kind: "wrap", artworkKey: "paper-wrap", active: true, colors: [palette.cream, palette.blush, palette.sage, palette.kraft] },
    { id: "ceramic-vase", name: "Ceramic vase", kind: "vase", artworkKey: "ceramic-vase", active: true, colors: [palette.cream, palette.sage, palette.blush] },
    { id: "bubble-pot", name: "Bubble pot", kind: "vase", artworkKey: "bubble-pot", active: true, colors: [palette.white, palette.butter, palette.sky] },
  ],
};
