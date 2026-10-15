"use client";

import { useActionState, useState } from "react";
import { deleteColor, saveColor } from "@/app/admin/actions";
import type { ColorOption } from "@/lib/catalog/types";
import { DeleteButton } from "./DeleteButton";

function Status({ state }: { state: { error?: string; message?: string } | undefined }) {
  if (state?.error) {
    return (
      <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
        {state.error}
      </p>
    );
  }
  if (state?.message) {
    return (
      <p role="status" className="rounded-2xl bg-sage/30 px-3 py-2 text-sm">
        {state.message}
      </p>
    );
  }
  return null;
}

function HexInput({ hex, onChange }: { hex: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label="Pick a color"
        value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-10 shrink-0 cursor-pointer rounded-full border-2 border-ink/20 bg-transparent"
      />
      <input
        name="hex"
        aria-label="Hex code"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="field w-28 font-mono text-sm"
      />
    </div>
  );
}

export function ColorRow({ color, uses }: { color: ColorOption; uses: number }) {
  const [state, action, pending] = useActionState(saveColor, undefined);
  const [name, setName] = useState(color.name);
  const [hex, setHex] = useState(color.hex);
  const dirty = name !== color.name || hex !== color.hex;

  return (
    <li className="py-3">
      <form action={action} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="mode" value="edit" />
        <input type="hidden" name="id" value={color.id} />
        <HexInput hex={hex} onChange={setHex} />
        <input
          name="name"
          aria-label="Color name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field min-w-32 flex-1"
        />
        <span className="w-20 text-xs text-ink/60">
          {uses === 0 ? "unused" : `on ${uses} item${uses === 1 ? "" : "s"}`}
        </span>
        <button type="submit" disabled={!dirty || pending} className="btn-soft">
          {pending ? "Saving…" : "Save"}
        </button>
        {uses === 0 && (
          <DeleteButton
            label="Remove"
            confirmText={`Remove ${color.name} from the palette?`}
            action={deleteColor.bind(null, color.id)}
          />
        )}
      </form>
      <div className="mt-2">
        <Status state={state} />
      </div>
    </li>
  );
}

export function NewColorForm() {
  const [state, action, pending] = useActionState(saveColor, undefined);
  return (
    <form action={action} className="card h-fit space-y-3">
      <h3 className="font-display text-xl">Add a color</h3>
      <input type="hidden" name="mode" value="create" />
      {/* A fresh set of fields after each successful add. */}
      <NewColorFields key={state?.message ?? "new"} />
      <Status state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Adding…" : "Add color"}
      </button>
    </form>
  );
}

function NewColorFields() {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#f4b6c2");
  return (
    <>
      <label className="block">
        <span className="font-display">Name</span>
        <input
          name="name"
          required
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Mint green"
          className="field mt-1"
        />
      </label>
      <div>
        <span className="font-display">Color</span>
        <div className="mt-1">
          <HexInput hex={hex} onChange={setHex} />
        </div>
      </div>
    </>
  );
}
