import { describe, expect, it } from "vitest";
import { dayKey, topColors, topItems, viewsByDay } from "./dashboard";
import { clientEventSchema, isBot } from "./events";

describe("viewsByDay", () => {
  it("buckets views by local day and fills empty days", () => {
    const now = new Date("2026-10-15T12:00:00Z");
    const views = [
      new Date("2026-10-15T01:00:00Z"),
      new Date("2026-10-14T20:00:00Z"), // already the 15th in Kuala Lumpur (UTC+8)
      new Date("2026-10-13T10:00:00Z"),
    ];
    expect(viewsByDay(views, now, 3, "Asia/Kuala_Lumpur")).toEqual([
      { day: "2026-10-13", views: 1 },
      { day: "2026-10-14", views: 0 },
      { day: "2026-10-15", views: 2 },
    ]);
    expect(viewsByDay(views, now, 3, "UTC").map((d) => d.views)).toEqual([1, 1, 1]);
  });

  it("formats days as YYYY-MM-DD", () => {
    expect(dayKey(new Date("2026-01-02T00:00:00Z"), "UTC")).toBe("2026-01-02");
  });
});

describe("topItems", () => {
  it("ranks by count and names deleted items by id", () => {
    const names = new Map([
      ["tulip", "Tulip"],
      ["rose", "Rose"],
    ]);
    const added = [
      { itemId: "rose", count: 2 },
      { itemId: "tulip", count: 5 },
      { itemId: "old", count: 3 },
      { itemId: null, count: 9 },
    ];
    expect(topItems(added, names).map((r) => [r.name, r.count])).toEqual([
      ["Tulip", 5],
      ["old", 3],
      ["Rose", 2],
    ]);
    expect(topItems(added, names, 1)).toHaveLength(1);
  });
});

describe("topColors", () => {
  it("counts stems per color with the palette's name and hex", () => {
    const palette = new Map([["red", { name: "Rose red", hex: "#d7263d" }]]);
    const bouquets = [{ stems: [{ colorId: "red" }, { colorId: "red" }] }, { stems: [{ colorId: "gone" }] }];
    expect(topColors(bouquets, palette)).toEqual([
      { id: "red", name: "Rose red", hex: "#d7263d", count: 2 },
      { id: "gone", name: "gone", hex: "#cccccc", count: 1 },
    ]);
  });
});

describe("clientEventSchema", () => {
  it("strips query strings and hashes from paths", () => {
    expect(clientEventSchema.parse({ type: "page_view", path: "/b/abc?email=x@y.z#top" })).toEqual({
      type: "page_view",
      path: "/b/abc",
    });
  });

  it("rejects unknown events, outside URLs and long values", () => {
    expect(clientEventSchema.safeParse({ type: "bouquet_submitted" }).success).toBe(false);
    expect(clientEventSchema.safeParse({ type: "page_view", path: "https://evil.test/" }).success).toBe(false);
    const long = { type: "item_added", itemId: "x".repeat(65), colorId: "red" };
    expect(clientEventSchema.safeParse(long).success).toBe(false);
  });

  it("drops extra fields so nothing personal is stored", () => {
    expect(clientEventSchema.parse({ type: "item_added", itemId: "tulip", colorId: "red", name: "Ann" })).toEqual({
      type: "item_added",
      itemId: "tulip",
      colorId: "red",
    });
  });
});

describe("isBot", () => {
  it("skips crawlers and link previews", () => {
    expect(isBot("WhatsApp/2.23")).toBe(true);
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (iPhone) Safari/604.1")).toBe(false);
  });
});
