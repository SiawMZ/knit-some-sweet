import type { ClientEvent } from "./events";

/** Report an analytics event without blocking the UI. Failures are ignored. */
export function track(event: ClientEvent) {
  if (typeof window === "undefined") return;
  const body = JSON.stringify(event);
  try {
    if (navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/events", {
      method: "POST",
      body,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Analytics must never break the builder.
  }
}
