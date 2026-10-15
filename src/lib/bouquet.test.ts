import { describe, expect, it } from "vitest";
import { type Bouquet, type Stem, canAdd, orderMessage, summarize, validateBouquet } from "./bouquet";
import { seedCatalog } from "./catalog/seed";

const tulip = seedCatalog.items.find((i) => i.id === "tulip")!;

const stem = (over: Partial<Stem> = {}): Stem => ({
  id: Math.random().toString(36).slice(2),
  itemId: "tulip",
  colorId: "red",
  height: 30,
  angle: 0,
  offset: 0,
  ...over,
});

const bouquet = (stems: Stem[]): Bouquet => ({
  stems,
  vesselId: "paper-wrap",
  vesselColorId: "cream",
});

describe("canAdd", () => {
  it("stops at the item's max quantity", () => {
    const full = Array.from({ length: tulip.maxQuantity }, () => stem());
    expect(canAdd(full.slice(1), tulip)).toBe(true);
    expect(canAdd(full, tulip)).toBe(false);
  });

  it("refuses inactive items", () => {
    expect(canAdd([], { ...tulip, active: false })).toBe(false);
  });
});

describe("summarize", () => {
  it("groups stems by item and color", () => {
    const lines = summarize(
      [stem(), stem({ colorId: "butter" }), stem()],
      seedCatalog,
    );
    expect(lines).toEqual([
      expect.objectContaining({ itemName: "Tulip", colorName: "Rose red", quantity: 2 }),
      expect.objectContaining({ itemName: "Tulip", colorName: "Butter yellow", quantity: 1 }),
    ]);
  });
});

describe("validateBouquet", () => {
  it("accepts a valid bouquet", () => {
    expect(validateBouquet(bouquet([stem()]), seedCatalog)).toEqual([]);
  });

  it("rejects empty bouquets", () => {
    expect(validateBouquet(bouquet([]), seedCatalog)).toContain("The bouquet is empty.");
  });

  it("rejects colors the seller does not offer", () => {
    const errors = validateBouquet(bouquet([stem({ colorId: "sky" })]), seedCatalog);
    expect(errors).toEqual(["Tulip is not available in that color."]);
  });

  it("rejects more stems than the max quantity, once per item", () => {
    const stems = Array.from({ length: tulip.maxQuantity + 1 }, () => stem());
    expect(validateBouquet(bouquet(stems), seedCatalog)).toHaveLength(1);
  });

  it("rejects a needed-by date in the past", () => {
    const b = { ...bouquet([stem()]), neededBy: "2026-10-14" };
    expect(validateBouquet(b, seedCatalog, "2026-10-15")).toEqual([
      "The date you picked has already passed.",
    ]);
    expect(validateBouquet(b, seedCatalog, "2026-10-14")).toEqual([]);
  });

  it("rejects unknown items and vessels", () => {
    const errors = validateBouquet(
      { ...bouquet([stem({ itemId: "gone" })]), vesselId: "gone" },
      seedCatalog,
    );
    expect(errors).toHaveLength(2);
  });
});

describe("orderMessage", () => {
  it("lists each line and the wrapping", () => {
    const msg = orderMessage(bouquet([stem(), stem()]), seedCatalog);
    expect(msg).toContain("• 2 × Tulip (Rose red)");
    expect(msg).toContain("Wrapping: Paper wrap & ribbon (Cream)");
    expect(msg).not.toContain("Needed by");
    expect(msg).not.toContain("Remarks");
  });

  it("includes the optional date and remarks", () => {
    const msg = orderMessage(
      { ...bouquet([stem()]), neededBy: "2026-10-21", remarks: "  Happy birthday Mei!  " },
      seedCatalog,
    );
    expect(msg).toContain("Needed by: Wed, 21 Oct 2026");
    expect(msg).toContain("Remarks: Happy birthday Mei!");
  });
});
