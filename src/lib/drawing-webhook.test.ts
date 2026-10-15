import { describe, expect, it } from "vitest";
import { buildDrawingWebhook, webhookFormat } from "./drawing-webhook";

const request = {
  name: "Mini daisy",
  kind: "bloom" as const,
  adminUrl: "https://shop.test/admin/requests",
};

describe("webhookFormat", () => {
  it("detects the service from the host", () => {
    expect(webhookFormat(new URL("https://ntfy.sh/my-topic"))).toBe("ntfy");
    expect(
      webhookFormat(new URL("https://discord.com/api/webhooks/1/abc")),
    ).toBe("discord");
    expect(
      webhookFormat(new URL("https://discordapp.com/api/webhooks/1/abc")),
    ).toBe("discord");
    expect(
      webhookFormat(new URL("https://hooks.slack.com/services/T/B/x")),
    ).toBe("slack");
    expect(webhookFormat(new URL("https://example.com/hook"))).toBe("json");
  });

  it("lets the setting override the host, ignoring unknown values", () => {
    expect(
      webhookFormat(new URL("https://ntfy.example.com/topic"), " NTFY "),
    ).toBe("ntfy");
    expect(webhookFormat(new URL("https://ntfy.sh/topic"), "json")).toBe(
      "json",
    );
    expect(webhookFormat(new URL("https://ntfy.sh/topic"), "teams")).toBe(
      "ntfy",
    );
  });
});

describe("buildDrawingWebhook", () => {
  it("does nothing without a valid http(s) URL", () => {
    expect(buildDrawingWebhook({}, request)).toBeNull();
    expect(buildDrawingWebhook({ url: "" }, request)).toBeNull();
    expect(buildDrawingWebhook({ url: "not a url" }, request)).toBeNull();
    expect(
      buildDrawingWebhook({ url: "ftp://example.com/x" }, request),
    ).toBeNull();
  });

  it("publishes to ntfy's root with the topic in the body", () => {
    expect(
      buildDrawingWebhook({ url: "https://ntfy.sh/knit-requests/" }, request),
    ).toEqual({
      url: "https://ntfy.sh/",
      body: {
        topic: "knit-requests",
        title: "New drawing request",
        message: 'The seller asked for a drawing of "Mini daisy" (Bloom).',
        click: "https://shop.test/admin/requests",
        tags: ["art"],
      },
    });
    expect(
      buildDrawingWebhook({ url: "https://ntfy.sh/" }, request),
    ).toBeNull();
  });

  it("sends Discord content without mentions", () => {
    const hook = buildDrawingWebhook(
      { url: "https://discord.com/api/webhooks/1/abc" },
      { ...request, name: "@everyone", kind: "vase" },
    );
    expect(hook?.url).toBe("https://discord.com/api/webhooks/1/abc");
    expect(hook?.body.content).toContain('"@everyone" (Vase)');
    expect(hook?.body.content).toContain("<https://shop.test/admin/requests>");
    expect(hook?.body.allowed_mentions).toEqual({ parse: [] });
  });

  it("sends Slack text with the name escaped", () => {
    const hook = buildDrawingWebhook(
      { url: "https://hooks.slack.com/services/T/B/x" },
      { ...request, name: "<Rose & co>", kind: "wrap" },
    );
    expect(hook?.body).toEqual({
      text: '*New drawing request*\nThe seller asked for a drawing of "&lt;Rose &amp; co&gt;" (Wrapping).\n<https://shop.test/admin/requests|Open the requests>',
    });
  });

  it("sends plain JSON to other hosts", () => {
    expect(
      buildDrawingWebhook({ url: "https://example.com/hook?k=1" }, request),
    ).toEqual({
      url: "https://example.com/hook?k=1",
      body: {
        event: "drawing_request",
        title: "New drawing request",
        text: 'The seller asked for a drawing of "Mini daisy" (Bloom).',
        name: "Mini daisy",
        kind: "bloom",
        url: "https://shop.test/admin/requests",
      },
    });
  });

  it("never includes notes or the photo", () => {
    for (const url of [
      "https://ntfy.sh/t",
      "https://discord.com/api/webhooks/1/a",
      "https://hooks.slack.com/x",
      "https://e.com",
    ]) {
      const body = JSON.stringify(buildDrawingWebhook({ url }, request)?.body);
      expect(body).not.toMatch(/notes|photo/i);
    }
  });
});
