"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  ANGLE_RANGE,
  HEIGHT_RANGE,
  type Stem,
  canAdd,
  clamp,
  placementFor,
} from "./bouquet";
import type { CatalogItem, Vessel } from "./catalog/types";

export type Backdrop = "cream" | "blush" | "sage";

interface BuilderState {
  stems: Stem[];
  vesselId: string | null;
  vesselColorId: string | null;
  selectedId: string | null;
  backdrop: Backdrop;
  neededBy: string;
  remarks: string;
  /** Adds one stem; returns false when the item's limit is reached. */
  addStem: (item: CatalogItem, colorId?: string) => boolean;
  removeLastOf: (itemId: string) => void;
  updateStem: (id: string, patch: Partial<Omit<Stem, "id" | "itemId">>) => void;
  removeStem: (id: string) => void;
  duplicateStem: (id: string, item: CatalogItem) => boolean;
  /** Moves a stem one layer forward or back. */
  moveStem: (id: string, to: "forward" | "backward") => void;
  select: (id: string | null) => void;
  setVessel: (vessel: Vessel, colorId?: string) => void;
  setVesselColor: (colorId: string) => void;
  setBackdrop: (b: Backdrop) => void;
  setOrderNotes: (notes: { neededBy?: string; remarks?: string }) => void;
  reset: () => void;
}

const newId = () => Math.random().toString(36).slice(2, 10);

const sanitize = (patch: Partial<Stem>): Partial<Stem> => ({
  ...patch,
  ...(patch.height !== undefined && { height: clamp(patch.height, HEIGHT_RANGE.min, HEIGHT_RANGE.max) }),
  ...(patch.angle !== undefined && { angle: clamp(patch.angle, ANGLE_RANGE.min, ANGLE_RANGE.max) }),
});

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      stems: [],
      vesselId: null,
      vesselColorId: null,
      selectedId: null,
      backdrop: "cream",
      neededBy: "",
      remarks: "",

      addStem: (item, colorId) => {
        const { stems } = get();
        if (!canAdd(stems, item)) return false;
        const stem: Stem = {
          id: newId(),
          itemId: item.id,
          colorId: colorId ?? item.colors[0].id,
          height: item.defaultHeight,
          ...placementFor(stems.length),
        };
        set({ stems: [...stems, stem], selectedId: stem.id });
        return true;
      },

      removeLastOf: (itemId) => {
        const { stems, selectedId } = get();
        const idx = stems.findLastIndex((s) => s.itemId === itemId);
        if (idx === -1) return;
        const removed = stems[idx];
        set({
          stems: stems.filter((_, i) => i !== idx),
          selectedId: selectedId === removed.id ? null : selectedId,
        });
      },

      updateStem: (id, patch) =>
        set((s) => ({
          stems: s.stems.map((st) => (st.id === id ? { ...st, ...sanitize(patch) } : st)),
        })),

      removeStem: (id) =>
        set((s) => ({
          stems: s.stems.filter((st) => st.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      duplicateStem: (id, item) => {
        const { stems } = get();
        const src = stems.find((s) => s.id === id);
        if (!src || !canAdd(stems, item)) return false;
        const copy: Stem = {
          ...src,
          id: newId(),
          angle: clamp(src.angle + 10, ANGLE_RANGE.min, ANGLE_RANGE.max),
        };
        set({ stems: [...stems, copy], selectedId: copy.id });
        return true;
      },

      moveStem: (id, to) =>
        set((s) => {
          const i = s.stems.findIndex((st) => st.id === id);
          const j = to === "forward" ? i + 1 : i - 1;
          if (i === -1 || j < 0 || j >= s.stems.length) return s;
          const stems = [...s.stems];
          [stems[i], stems[j]] = [stems[j], stems[i]];
          return { stems };
        }),

      select: (id) => set({ selectedId: id }),

      setVessel: (vessel, colorId) =>
        set({ vesselId: vessel.id, vesselColorId: colorId ?? vessel.colors[0].id }),

      setVesselColor: (colorId) => set({ vesselColorId: colorId }),

      setBackdrop: (backdrop) => set({ backdrop }),

      setOrderNotes: (notes) => set(notes),

      reset: () => set({ stems: [], selectedId: null }),
    }),
    {
      name: "nss-bouquet",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated manually after mount to avoid hydration mismatches.
      skipHydration: true,
      partialize: ({ stems, vesselId, vesselColorId, backdrop, neededBy, remarks }) => ({
        stems,
        vesselId,
        vesselColorId,
        backdrop,
        neededBy,
        remarks,
      }),
    },
  ),
);
