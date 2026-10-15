import { describe, expect, it } from "vitest";
import { parseColorForm, parseItemForm, parseVesselForm, slugify } from "./admin";

const form = (fields: Record<string, string | string[]>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) for (const x of [v].flat()) fd.append(k, x);
  return fd;
};

const item = {
  name: "Mini Daisy",
  category: "bloom",
  artworkKey: "cosmos",
  maxQuantity: "6",
  defaultHeight: "30",
  active: "on",
  colorIds: ["white", "butter"],
};

describe("slugify", () => {
  it("makes readable ids", () => {
    expect(slugify("Baby's Breath!")).toBe("babys-breath");
    expect(slugify("  Crème  Brûlée ")).toBe("creme-brulee");
    expect(slugify("🌸")).toBe("");
  });
});

describe("parseItemForm", () => {
  it("parses a new item, deriving its id from the name", () => {
    const r = parseItemForm(form(item));
    expect(r.success && r.data).toEqual({
      id: "mini-daisy",
      name: "Mini Daisy",
      category: "bloom",
      artworkKey: "cosmos",
      maxQuantity: 6,
      defaultHeight: 30,
      active: true,
      colorIds: ["white", "butter"],
    });
  });

  it("keeps the id when editing and reads an unticked box as inactive", () => {
    const unticked = Object.fromEntries(Object.entries(item).filter(([k]) => k !== "active"));
    const r = parseItemForm(form({ ...unticked, id: "daisy" }));
    expect(r.success && r.data).toMatchObject({ id: "daisy", active: false });
  });

  it("only allows artwork from the registry", () => {
    const r = parseItemForm(form({ ...item, artworkKey: "dragon" }));
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe("Pick one of the existing drawings.");
  });

  it("checks quantity, height and colors", () => {
    expect(parseItemForm(form({ ...item, maxQuantity: "0" })).success).toBe(false);
    expect(parseItemForm(form({ ...item, maxQuantity: "2.5" })).success).toBe(false);
    expect(parseItemForm(form({ ...item, defaultHeight: "80" })).success).toBe(false);
    expect(parseItemForm(form({ ...item, colorIds: [] })).success).toBe(false);
    expect(parseItemForm(form({ ...item, colorIds: ["white", "white"] })).success).toBe(false);
  });
});

describe("parseVesselForm", () => {
  it("parses vessels and only allows vessel artwork", () => {
    const v = { name: "Tall vase", kind: "vase", artworkKey: "ceramic-vase", colorIds: "cream" };
    const r = parseVesselForm(form(v));
    expect(r.success && r.data).toMatchObject({ id: "tall-vase", active: false, colorIds: ["cream"] });
    expect(parseVesselForm(form({ ...v, artworkKey: "tulip" })).success).toBe(false);
  });
});

describe("parseColorForm", () => {
  it("normalizes hex codes and rejects bad ones", () => {
    expect(parseColorForm(form({ name: "Mint", hex: "#A8E6CF" })).data).toEqual({
      id: "mint",
      name: "Mint",
      hex: "#a8e6cf",
    });
    expect(parseColorForm(form({ name: "Mint", hex: "green" })).success).toBe(false);
  });
});
