import "server-only";
import { buildDrawingWebhook } from "@/lib/drawing-webhook";
import type { DrawingKind } from "@/lib/drawings";

/**
 * Tells the developer a drawing request arrived, if `DRAWING_REQUEST_WEBHOOK_URL`
 * is set. Never throws: a broken webhook must not fail the seller's request.
 */
export async function notifyDrawingRequest(request: {
  name: string;
  kind: DrawingKind;
  adminUrl: string;
}) {
  const hook = buildDrawingWebhook(
    {
      url: process.env.DRAWING_REQUEST_WEBHOOK_URL,
      format: process.env.DRAWING_REQUEST_WEBHOOK_FORMAT,
    },
    request,
  );
  if (!hook) return;
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hook.body),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok)
      console.error(`Drawing request webhook answered ${res.status}.`);
  } catch (error) {
    console.error(
      "Drawing request webhook failed:",
      error instanceof Error ? error.message : error,
    );
  }
}
