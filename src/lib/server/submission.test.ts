import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/lib/catalog/seed";
import { newSlug, prepareSubmission, trustedToday } from "./submission";

const now = new Date("2026-10-15T10:00:00Z");
const tulip = (over = {}) => ({ id: "s1", itemId: "tulip", colorId: "red", height: 30, angle: 0, offset: 0, ...over });
const input = (over = {}) => ({ stems: [tulip()], vesselId: "paper-wrap", vesselColorId: "cream", ...over });

describe("trustedToday", () => {
  it("accepts the browser's date within a day of the server's", () => {
    expect(trustedToday("2026-10-16", now)).toBe("2026-10-16");
    expect(trustedToday("2026-10-14", now)).toBe("2026-10-14");
  });

  it("falls back to the server date for anything else", () => {
    expect(trustedToday("2026-10-20", now)).toBe("2026-10-15");
    expect(trustedToday("2020-01-01", now)).toBe("2026-10-15");
    expect(trustedToday("tomorrow", now)).toBe("2026-10-15");
    expect(trustedToday(undefined, now)).toBe("2026-10-15");
  });
});

describe("prepareSubmission", () => {
  it("accepts a valid bouquet and snapshots only what it uses", () => {
    const r = prepareSubmission(input({ remarks: "  For mum  " }), seedCatalog, "2026-10-15", now);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.bouquet.remarks).toBe("For mum");
    expect(r.snapshot.items.map((i) => i.id)).toEqual(["tulip"]);
    expect(r.snapshot.vessels.map((v) => v.id)).toEqual(["paper-wrap"]);
  });

  it("rejects malformed input", () => {
    expect(prepareSubmission({ stems: "lots" }, seedCatalog, "2026-10-15", now).ok).toBe(false);
  });

  it("runs the catalog checks: limits, colors and availability", () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => tulip({ id: `s${i}` }));
    expect(prepareSubmission(input({ stems: tooMany }), seedCatalog, "2026-10-15", now)).toEqual({
      ok: false,
      errors: ["Tulip: at most 10 per bouquet (you have 11)."],
    });

    const wrongColor = prepareSubmission(input({ stems: [tulip({ colorId: "grape" })] }), seedCatalog, null, now);
    expect(wrongColor.ok).toBe(false);

    const hidden = { ...seedCatalog, items: seedCatalog.items.filter((i) => i.id !== "tulip") };
    expect(prepareSubmission(input(), hidden, null, now).ok).toBe(false);
  });

  it("checks the needed-by date against a trusted today", () => {
    // A browser claiming it's September can't sneak in a past date.
    expect(prepareSubmission(input({ neededBy: "2026-10-01" }), seedCatalog, "2026-09-01", now)).toEqual({
      ok: false,
      errors: ["The date you picked has already passed."],
    });
  });
});

describe("newSlug", () => {
  it("makes distinct, URL-safe slugs", () => {
    const slugs = new Set(Array.from({ length: 200 }, () => newSlug()));
    expect(slugs.size).toBe(200);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]{10}$/);
  });
});
