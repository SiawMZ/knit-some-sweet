import { describe, expect, it } from "vitest";
import { type ItemRow, type VesselRow, catalogSubset, toCatalog } from "./rows";

const color = (id: string, position: number) => ({ position, color: { id, name: id, hex: "#ffffff" } });
const item = (over: Partial<ItemRow> = {}): ItemRow => ({
  id: "tulip",
  name: "Tulip",
  category: "bloom",
  artworkKey: "tulip",
  maxQuantity: 5,
  defaultHeight: 30,
  active: true,
  colors: [color("red", 1), color("white", 0)],
  ...over,
});
const vessel = (over: Partial<VesselRow> = {}): VesselRow => ({
  id: "wrap",
  name: "Wrap",
  kind: "wrap",
  artworkKey: "paper-wrap",
  active: true,
  colors: [color("cream", 0)],
  ...over,
});

describe("toCatalog", () => {
  it("orders colors by position, so the first is the default", () => {
    expect(toCatalog([item()], []).items[0].colors.map((c) => c.id)).toEqual(["white", "red"]);
  });

  it("leaves out rows it can't draw", () => {
    const c = toCatalog(
      [item({ id: "a", artworkKey: "dragon" }), item({ id: "b", colors: [] }), item({ id: "c" })],
      [vessel({ id: "x", artworkKey: "tulip" }), vessel({ id: "y" })],
    );
    expect(c.items.map((i) => i.id)).toEqual(["c"]);
    expect(c.vessels.map((v) => v.id)).toEqual(["y"]);
  });

  it("shows customers only active rows", () => {
    const rows = [item({ id: "on" }), item({ id: "off", active: false })];
    expect(toCatalog(rows, []).items).toHaveLength(2);
    expect(toCatalog(rows, [], { activeOnly: true }).items.map((i) => i.id)).toEqual(["on"]);
  });
});

describe("catalogSubset", () => {
  it("keeps only the used items and vessel", () => {
    const catalog = toCatalog([item({ id: "a" }), item({ id: "b" })], [vessel({ id: "v1" }), vessel({ id: "v2" })]);
    const sub = catalogSubset(catalog, ["b", "b"], "v2");
    expect(sub.items.map((i) => i.id)).toEqual(["b"]);
    expect(sub.vessels.map((v) => v.id)).toEqual(["v2"]);
  });
});
