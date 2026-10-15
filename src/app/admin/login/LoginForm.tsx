"use client";

import { useActionState } from "react";
import { login } from "./actions";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-5 space-y-3">
      <label className="block">
        <span className="font-display">Email</span>
        <input name="email" type="email" required autoComplete="username" className="field mt-1" />
      </label>
      <label className="block">
        <span className="font-display">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="field mt-1" />
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-rose/15 px-3 py-2 text-sm">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
