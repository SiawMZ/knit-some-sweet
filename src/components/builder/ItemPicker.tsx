"use client";

import { useState } from "react";
import { ArtworkThumb } from "@/components/artwork/ArtworkThumb";
import { track } from "@/lib/analytics/client";
import { canAdd, countOf } from "@/lib/bouquet";
import type { CatalogItem, ItemCategory } from "@/lib/catalog/types";
import { useBuilder } from "@/lib/store";

const TABS: { id: ItemCategory; label: string; hint: string }[] = [
  { id: "bloom", label: "Blooms", hint: "The stars of your bouquet" },
  { id: "filler", label: "Fillers", hint: "Little sprigs to fill the gaps" },
  { id: "friend", label: "Friends", hint: "A tiny buddy on a stem" },
];

export function ItemPicker({ items }: { items: CatalogItem[] }) {
  const [tab, setTab] = useState<ItemCategory>("bloom");
  const stems = useBuilder((s) => s.stems);
  const addStem = useBuilder((s) => s.addStem);
  const removeLastOf = useBuilder((s) => s.removeLastOf);
  const visible = items.filter((i) => i.category === tab && i.active);
  const add = (item: CatalogItem) => {
    if (addStem(item)) track({ type: "item_added", itemId: item.id, colorId: item.colors[0].id });
  };

  return (
    <div>
      <div role="tablist" aria-label="Item type" className="grid grid-cols-3 gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-2xl border-2 px-2 py-2 font-display text-sm transition-colors ${
              tab === t.id
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 bg-white/60 text-ink hover:border-ink/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-ink/70">{TABS.find((t) => t.id === tab)?.hint}</p>

      <ul className="mt-3 grid grid-cols-2 gap-3">
        {visible.map((item) => {
          const count = countOf(stems, item.id);
          const addable = canAdd(stems, item);
          return (
            <li
              key={item.id}
              className={`relative rounded-3xl border-2 bg-white/70 p-2 transition ${
                count > 0 ? "border-rose" : "border-ink/10"
              }`}
            >
              <button
                type="button"
                onClick={() => add(item)}
                disabled={!addable}
                aria-label={`Add ${item.name}`}
                className="block w-full rounded-2xl disabled:opacity-50"
              >
                <ArtworkThumb artworkKey={item.artworkKey} color={item.colors[0].hex} className="mx-auto h-24 w-24" />
                <span className="mt-1 block text-center font-display text-ink">{item.name}</span>
              </button>
              <div className="mt-1 flex items-center justify-center gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => removeLastOf(item.id)}
                  disabled={count === 0}
                  aria-label={`Remove one ${item.name}`}
                  className="size-7 rounded-full border-2 border-ink/20 leading-none text-ink disabled:opacity-30"
                >
                  −
                </button>
                <span className="min-w-12 text-center tabular-nums text-ink/80" aria-label={`${count} of ${item.maxQuantity}`}>
                  {count} / {item.maxQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => add(item)}
                  disabled={!addable}
                  aria-label={`Add one ${item.name}`}
                  className="size-7 rounded-full border-2 border-ink/20 leading-none text-ink disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
