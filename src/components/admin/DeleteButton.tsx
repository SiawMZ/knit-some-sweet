"use client";

import { useState, useTransition } from "react";
import type { FormState } from "@/app/admin/actions";

/** Asks first, then runs a delete action and shows its error, if any. */
export function DeleteButton({
  label,
  confirmText,
  action,
}: {
  label: string;
  confirmText: string;
  action: () => Promise<FormState>;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmText)) return;
          start(async () => setError((await action())?.error ?? null));
        }}
        className="btn-soft text-rose-deep"
      >
        {pending ? "Removing…" : label}
      </button>
      {error && (
        <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
