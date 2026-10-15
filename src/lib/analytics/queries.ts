import "server-only";
import { bouquetSchema } from "@/lib/bouquet";
import { db } from "@/lib/server/db";
import { topColors, topItems, viewsByDay } from "./dashboard";

export const DASHBOARD_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;

export const shopTimeZone = () => process.env.SHOP_TIME_ZONE || "UTC";

/** Everything the seller dashboard shows, for the last 30 days. */
export async function getDashboard(now: Date) {
  const since = new Date(now.getTime() - DASHBOARD_DAYS * DAY);
  const [views, added, bouquets, items, colors] = await Promise.all([
    db().analyticsEvent.findMany({
      where: { type: "page_view", createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db().analyticsEvent.groupBy({
      by: ["itemId"],
      where: { type: "item_added", createdAt: { gte: since } },
      _count: { _all: true },
    }),
    db().savedBouquet.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      select: { slug: true, bouquet: true, stemCount: true, createdAt: true },
    }),
    db().item.findMany({ select: { id: true, name: true } }),
    db().color.findMany({ select: { id: true, name: true, hex: true } }),
  ]);

  const parsed = bouquets.flatMap((b) => {
    const r = bouquetSchema.safeParse(b.bouquet);
    return r.success ? [{ ...b, bouquet: r.data }] : [];
  });
  const addedCounts = added.map((a) => ({ itemId: a.itemId, count: a._count._all }));

  return {
    days: DASHBOARD_DAYS,
    totals: {
      views: views.length,
      itemsAdded: addedCounts.reduce((n, a) => n + a.count, 0),
      bouquets: bouquets.length,
    },
    visits: viewsByDay(views.map((v) => v.createdAt), now, DASHBOARD_DAYS, shopTimeZone()),
    items: topItems(addedCounts, new Map(items.map((i) => [i.id, i.name]))),
    colors: topColors(
      parsed.map((b) => b.bouquet),
      new Map(colors.map((c) => [c.id, c])),
    ),
    recent: parsed.slice(0, 8).map((b) => ({
      slug: b.slug,
      stemCount: b.stemCount,
      createdAt: b.createdAt,
      neededBy: b.bouquet.neededBy ?? null,
      remarks: b.bouquet.remarks ?? null,
    })),
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
