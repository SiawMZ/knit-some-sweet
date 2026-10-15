import { clientEventSchema, isBot } from "@/lib/analytics/events";
import { getCatalog } from "@/lib/catalog/queries";
import { db } from "@/lib/server/db";

export async function POST(request: Request) {
  // The user agent is only checked here, never stored.
  if (isBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });

  const parsed = clientEventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });
  const event = parsed.data;

  if (event.type === "page_view") {
    await db().analyticsEvent.create({ data: { type: "page_view", path: event.path } });
  } else {
    // Only count picks of real, offered items so the dashboard can't be filled with junk.
    const { items } = await getCatalog();
    const item = items.find((i) => i.id === event.itemId);
    if (!item?.colors.some((c) => c.id === event.colorId)) return new Response(null, { status: 400 });
    await db().analyticsEvent.create({
      data: { type: "item_added", itemId: event.itemId, colorId: event.colorId },
    });
  }
  return new Response(null, { status: 204 });
}
