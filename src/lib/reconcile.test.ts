import { describe, expect, it } from "vitest";
import { type Stem, orderMessage, reconcileStems, reconcileVessel } from "./bouquet";
import { seedCatalog } from "./catalog/seed";
import type { Catalog } from "./catalog/types";

const stem = (over: Partial<Stem> = {}): Stem => ({
  id: Math.random().toString(36).slice(2),
  itemId: "tulip",
  colorId: "red",
  height: 30,
  angle: 0,
  offset: 0,
  ...over,
});

const withItem = (id: string, patch: object): Catalog => ({
  ...seedCatalog,
  items: seedCatalog.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
});

describe("reconcileStems", () => {
  it("keeps stems that still fit the catalog untouched", () => {
    const stems = [stem(), stem({ itemId: "sunflower", colorId: "sunny" })];
    const out = reconcileStems(stems, seedCatalog);
    expect(out).toEqual(stems);
    expect(out[0]).toBe(stems[0]);
  });

  it("drops stems of removed or inactive items", () => {
    const stems = [stem(), stem({ itemId: "gone" }), stem({ itemId: "sunflower", colorId: "sunny" })];
    const catalog = withItem("sunflower", { active: false });
    expect(reconcileStems(stems, catalog).map((s) => s.itemId)).toEqual(["tulip"]);
  });

  it("resets colors the seller no longer offers to the default", () => {
    const catalog = withItem("tulip", { colors: [{ id: "white", name: "White", hex: "#fff" }] });
    expect(reconcileStems([stem({ colorId: "red" })], catalog)[0].colorId).toBe("white");
  });

  it("trims stems over a lowered max, keeping the earliest", () => {
    const stems = [stem({ id: "a" }), stem({ id: "b" }), stem({ id: "c" })];
    const catalog = withItem("tulip", { maxQuantity: 2 });
    expect(reconcileStems(stems, catalog).map((s) => s.id)).toEqual(["a", "b"]);
  });
});

describe("reconcileVessel", () => {
  it("keeps a valid choice", () => {
    expect(reconcileVessel("ceramic-vase", "sage", seedCatalog)).toMatchObject({
      vessel: { id: "ceramic-vase" },
      colorId: "sage",
    });
  });

  it("falls back to the first active vessel and its default color", () => {
    const catalog: Catalog = {
      ...seedCatalog,
      vessels: seedCatalog.vessels.map((v) => (v.id === "paper-wrap" ? { ...v, active: false } : v)),
    };
    expect(reconcileVessel("paper-wrap", "kraft", catalog)).toMatchObject({
      vessel: { id: "ceramic-vase" },
      colorId: "cream",
    });
    expect(reconcileVessel("ceramic-vase", "kraft", catalog)?.colorId).toBe("cream");
  });

  it("returns null when nothing is available", () => {
    expect(reconcileVessel(null, null, { ...seedCatalog, vessels: [] })).toBeNull();
  });
});

describe("orderMessage", () => {
  it("adds the share link when there is one", () => {
    const b = { stems: [stem()], vesselId: "paper-wrap", vesselColorId: "cream" };
    expect(orderMessage(b, seedCatalog, "https://x.test/b/abc")).toContain("See it here: https://x.test/b/abc");
    expect(orderMessage(b, seedCatalog)).not.toContain("See it here");
  });
});
