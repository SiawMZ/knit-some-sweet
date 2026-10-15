import { DRAWING_KINDS, type DrawingKind } from "@/lib/drawings";

/**
 * The developer's notification when the seller sends a drawing request
 * (`DRAWING_REQUEST_WEBHOOK_URL`). Only the item's name and kind and a link
 * to the queue go out: never the photo or the seller's notes.
 */

export const WEBHOOK_FORMATS = ["ntfy", "discord", "slack", "json"] as const;
export type WebhookFormat = (typeof WEBHOOK_FORMATS)[number];

export type WebhookRequest = { url: string; body: Record<string, unknown> };

/** The format named by `DRAWING_REQUEST_WEBHOOK_FORMAT`, else the one the URL's host implies. */
export function webhookFormat(url: URL, setting?: string): WebhookFormat {
  const named = setting?.trim().toLowerCase();
  if ((WEBHOOK_FORMATS as readonly string[]).includes(named ?? ""))
    return named as WebhookFormat;
  const host = url.hostname.toLowerCase();
  if (host === "ntfy.sh") return "ntfy";
  if (
    [
      "discord.com",
      "discordapp.com",
      "ptb.discord.com",
      "canary.discord.com",
    ].includes(host)
  )
    return "discord";
  if (host === "hooks.slack.com") return "slack";
  return "json";
}

/** Slack reads `&`, `<` and `>` as markup. */
const slackEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The POST to send for a new request, or null when the webhook is unset or
 * not a valid http(s) URL. `adminUrl` is the absolute link to /admin/requests.
 */
export function buildDrawingWebhook(
  env: { url?: string; format?: string },
  request: { name: string; kind: DrawingKind; adminUrl: string },
): WebhookRequest | null {
  let target: URL;
  try {
    target = new URL(env.url?.trim() ?? "");
  } catch {
    return null;
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") return null;

  const kind = DRAWING_KINDS[request.kind];
  const title = "New drawing request";
  const message = `The seller asked for a drawing of "${request.name}" (${kind}).`;

  switch (webhookFormat(target, env.format)) {
    case "ntfy": {
      // ntfy takes JSON only at the server root, with the topic in the body.
      const topic = target.pathname.replace(/^\/+|\/+$/g, "");
      if (!topic) return null;
      return {
        url: `${target.origin}/`,
        body: { topic, title, message, click: request.adminUrl, tags: ["art"] },
      };
    }
    case "discord":
      return {
        url: target.href,
        body: {
          content: `**${title}**\n${message}\n<${request.adminUrl}>`,
          // The name is seller-typed: never let it ping anyone.
          allowed_mentions: { parse: [] },
        },
      };
    case "slack":
      return {
        url: target.href,
        body: {
          text: `*${title}*\nThe seller asked for a drawing of "${slackEscape(request.name)}" (${kind}).\n<${request.adminUrl}|Open the requests>`,
        },
      };
    case "json":
      return {
        url: target.href,
        body: {
          event: "drawing_request",
          title,
          text: message,
          name: request.name,
          kind: request.kind,
          url: request.adminUrl,
        },
      };
  }
}
