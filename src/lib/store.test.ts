import { beforeEach, describe, expect, it } from "vitest";
import { seedCatalog } from "./catalog/seed";
import { useBuilder } from "./store";

const [a, b, c] = seedCatalog.items;
const ids = () => useBuilder.getState().stems.map((s) => s.itemId);

describe("moveStem", () => {
  beforeEach(() => {
    useBuilder.getState().reset();
    for (const item of [a, b, c]) useBuilder.getState().addStem(item);
  });

  const idOf = (itemId: string) =>
    useBuilder.getState().stems.find((s) => s.itemId === itemId)!.id;

  it("moves a stem one layer forward per call", () => {
    useBuilder.getState().moveStem(idOf(a.id), "forward");
    expect(ids()).toEqual([b.id, a.id, c.id]);
    useBuilder.getState().moveStem(idOf(a.id), "forward");
    expect(ids()).toEqual([b.id, c.id, a.id]);
  });

  it("moves a stem one layer back per call", () => {
    useBuilder.getState().moveStem(idOf(c.id), "backward");
    expect(ids()).toEqual([a.id, c.id, b.id]);
  });

  it("does nothing at the front or back edge", () => {
    useBuilder.getState().moveStem(idOf(c.id), "forward");
    useBuilder.getState().moveStem(idOf(a.id), "backward");
    expect(ids()).toEqual([a.id, b.id, c.id]);
  });
});
