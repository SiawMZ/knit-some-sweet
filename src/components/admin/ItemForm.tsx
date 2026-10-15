"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveItem } from "@/app/admin/actions";
import { ArtworkThumb } from "@/components/artwork/ArtworkThumb";
import { stemArtworks, type StemArtworkKey } from "@/components/artwork/registry";
import { HEIGHT_RANGE, MAX_STEMS } from "@/lib/bouquet";
import { slugify } from "@/lib/catalog/admin";
import type { ColorOption, ItemCategory } from "@/lib/catalog/types";
import { ColorChooser } from "./ColorChooser";

export interface ItemFormValues {
  id: string;
  name: string;
  category: ItemCategory;
  artworkKey: string;
  maxQuantity: number;
  defaultHeight: number;
  active: boolean;
  colorIds: string[];
}

const ARTWORK_KEYS = Object.keys(stemArtworks) as StemArtworkKey[];
const label = (key: string) => key.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

export function ItemForm({
  mode,
  initial,
  palette,
}: {
  mode: "create" | "edit";
  initial: ItemFormValues;
  palette: ColorOption[];
}) {
  const [state, action, pending] = useActionState(saveItem, undefined);
  const [name, setName] = useState(initial.name);
  const [artworkKey, setArtworkKey] = useState(initial.artworkKey);
  const [colorIds, setColorIds] = useState(initial.colorIds);
  const [category, setCategory] = useState(initial.category);
  const [maxQuantity, setMaxQuantity] = useState(String(initial.maxQuantity));
  const [defaultHeight, setDefaultHeight] = useState(String(initial.defaultHeight));
  const [active, setActive] = useState(initial.active);

  const art = ARTWORK_KEYS.find((k) => k === artworkKey) ?? ARTWORK_KEYS[0];
  const colors = colorIds.map((id) => palette.find((c) => c.id === id)).filter((c) => c !== undefined);
  const previewHex = colors[0]?.hex ?? "#e5d8cc";
  const id = mode === "edit" ? initial.id : slugify(name);

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <input type="hidden" name="mode" value={mode} />
      {mode === "edit" && <input type="hidden" name="id" value={initial.id} />}

      <div className="card space-y-4">
        <label className="block">
          <span className="font-display">Name</span>
          <input
            name="name"
            required
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field mt-1"
          />
          <span className="mt-1 block text-xs text-ink/60">Id: {id || "…"}</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-display">Category</span>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="field mt-1"
            >
              <option value="bloom">Bloom</option>
              <option value="filler">Filler</option>
              <option value="friend">Friend</option>
            </select>
          </label>
          <label className="block">
            <span className="font-display">Drawing</span>
            <select
              name="artworkKey"
              value={art}
              onChange={(e) => setArtworkKey(e.target.value)}
              className="field mt-1"
            >
              {ARTWORK_KEYS.map((k) => (
                <option key={k} value={k}>
                  {label(k)}
                </option>
              ))}
            </select>
            <Link href="/admin/requests" className="mt-1 block text-xs text-rose-deep underline underline-offset-2">
              New shape? Request a drawing from a photo
            </Link>
          </label>
          <label className="block">
            <span className="font-display">Max per bouquet</span>
            <input
              name="maxQuantity"
              type="number"
              required
              min={1}
              max={MAX_STEMS}
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              className="field mt-1"
            />
          </label>
          <label className="block">
            <span className="font-display">Default stem height (cm)</span>
            <input
              name="defaultHeight"
              type="number"
              required
              min={HEIGHT_RANGE.min}
              max={HEIGHT_RANGE.max}
              value={defaultHeight}
              onChange={(e) => setDefaultHeight(e.target.value)}
              className="field mt-1"
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            name="active"
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="size-5 accent-rose"
          />
          <span className="font-display">Available in the builder</span>
        </label>

        <div>
          <p className="mb-2 font-display">Allowed colors</p>
          <ColorChooser palette={palette} value={colorIds} onChange={setColorIds} />
        </div>
      </div>

      <aside className="card h-fit space-y-3 lg:sticky lg:top-4">
        <p className="font-display">Preview</p>
        <div className="rounded-3xl bg-[#fff6ea] p-2">
          <ArtworkThumb artworkKey={art} color={previewHex} className="mx-auto h-44 w-44" />
        </div>
        {colors.length > 1 && (
          <ul className="grid grid-cols-4 gap-1">
            {colors.map((c) => (
              <li key={c.id} title={c.name} className="rounded-2xl bg-[#fff6ea] p-1">
                <ArtworkThumb artworkKey={art} color={c.hex} className="h-14 w-full" />
              </li>
            ))}
          </ul>
        )}
        {state?.error && (
          <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
          {pending ? "Saving…" : mode === "create" ? "Add item" : "Save changes"}
        </button>
        <Link href="/admin/items" className="block text-center text-sm text-ink/70 underline underline-offset-4">
          Cancel
        </Link>
      </aside>
    </form>
  );
}
