import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, checkPhoto, drawingRequestSchema, drawingState, suggestArtworkKey } from "./drawings";

describe("drawingRequestSchema", () => {
  it("accepts a request and drops empty notes", () => {
    expect(drawingRequestSchema.parse({ name: " Mini daisy ", kind: "bloom", notes: "  " })).toEqual({
      name: "Mini daisy",
      kind: "bloom",
      notes: undefined,
    });
  });

  it("rejects unknown kinds and missing names", () => {
    expect(drawingRequestSchema.safeParse({ name: "Daisy", kind: "tree", notes: "" }).success).toBe(false);
    expect(drawingRequestSchema.safeParse({ name: "", kind: "bloom", notes: "" }).success).toBe(false);
  });
});

describe("checkPhoto", () => {
  it("accepts reasonably sized images", () => {
    expect(checkPhoto({ type: "image/jpeg", size: 300_000 })).toBeNull();
    expect(checkPhoto({ type: "image/webp", size: 10 })).toBeNull();
  });

  it("explains what's wrong otherwise", () => {
    expect(checkPhoto(null)).toBe("Add a photo of the item.");
    expect(checkPhoto({ type: "image/jpeg", size: 0 })).toBe("Add a photo of the item.");
    expect(checkPhoto({ type: "application/pdf", size: 100 })).toBe("Photos must be JPEG, PNG or WebP.");
    expect(checkPhoto({ type: "image/png", size: MAX_PHOTO_BYTES + 1 })).toMatch(/too large/);
  });
});

describe("drawingState", () => {
  it("waits until a request is marked drawn", () => {
    expect(drawingState({ status: "waiting", kind: "bloom", artworkKey: null })).toBe("waiting");
    expect(drawingState({ status: "dismissed", kind: "bloom", artworkKey: null })).toBe("dismissed");
  });

  it("is only ready once the artwork is in this build's registry", () => {
    expect(drawingState({ status: "drawn", kind: "bloom", artworkKey: "tulip" })).toBe("ready");
    expect(drawingState({ status: "drawn", kind: "bloom", artworkKey: "mini-daisy" })).toBe("drawn-not-live");
  });

  it("checks vessels against the vessel registry", () => {
    expect(drawingState({ status: "drawn", kind: "vase", artworkKey: "bubble-pot" })).toBe("ready");
    expect(drawingState({ status: "drawn", kind: "vase", artworkKey: "tulip" })).toBe("drawn-not-live");
  });
});

describe("suggestArtworkKey", () => {
  it("slugifies the name and avoids taken keys", () => {
    expect(suggestArtworkKey("Mini Daisy", ["tulip"])).toBe("mini-daisy");
    expect(suggestArtworkKey("Tulip", ["tulip", "tulip-2"])).toBe("tulip-3");
    expect(suggestArtworkKey("🌸", [])).toBe("drawing");
  });
});
