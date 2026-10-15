"use client";

import { useActionState } from "react";
import { markDrawingDrawn } from "@/app/admin/actions";

const label = (key: string) => key.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/**
 * Link a waiting request to a drawing that's already on the site (after the
 * developer's deploy). Only drawings in this build are offered.
 */
export function MarkDrawnForm({ id, choices, match }: { id: string; choices: string[]; match: string | null }) {
  const [state, action, pending] = useActionState(markDrawingDrawn, undefined);
  return (
    <form action={action} className="flex w-full flex-wrap items-center gap-2 rounded-2xl bg-white/60 p-2 text-sm">
      <input type="hidden" name="id" value={id} />
      {match ? (
        <span className="text-ink/80">
          The <strong>{label(match)}</strong> drawing is on the site now.
        </span>
      ) : (
        <span className="text-ink/70">Already drawn?</span>
      )}
      <select
        name="artworkKey"
        defaultValue={match ?? ""}
        required
        aria-label="Drawing for this request"
        className="field w-auto py-1"
      >
        {!match && (
          <option value="" disabled>
            Pick its drawing
          </option>
        )}
        {choices.map((key) => (
          <option key={key} value={key}>
            {label(key)}
          </option>
        ))}
      </select>
      <button type="submit" disabled={pending} className={match ? "btn-primary py-1" : "btn-soft py-1"}>
        {pending ? "Saving…" : "Mark as drawn"}
      </button>
      {state?.error && (
        <p role="alert" className="w-full rounded-2xl bg-rose/15 px-3 py-1">
          {state.error}
        </p>
      )}
    </form>
  );
}
