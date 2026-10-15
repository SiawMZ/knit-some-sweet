import Link from "next/link";
import { TopColorsChart, TopItemsChart, VisitsChart } from "@/components/admin/DashboardCharts";
import { formatDate } from "@/lib/bouquet";
import { getDashboard, shopTimeZone } from "@/lib/analytics/queries";
import { requireSeller } from "@/lib/server/session";

// Reads the session per request; navigating here waits for the server (see loading.tsx).
export const instant = false;

export default async function DashboardPage() {
  await requireSeller();
  const d = await getDashboard(new Date());
  const tiles = [
    { label: "Page views", value: d.totals.views },
    { label: "Stems added", value: d.totals.itemsAdded },
    { label: "Bouquets sent", value: d.totals.bouquets },
  ];
  const when = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: shopTimeZone(),
  });

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <li key={t.label} className="card">
            <p className="text-sm text-ink/70">{t.label}</p>
            <p className="font-display text-3xl tabular-nums sm:text-4xl">{t.value}</p>
            <p className="text-xs text-ink/50">last {d.days} days</p>
          </li>
        ))}
      </ul>
      <VisitsChart data={d.visits} days={d.days} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopItemsChart rows={d.items} days={d.days} />
        <TopColorsChart rows={d.colors} days={d.days} />
      </div>
      <section className="card">
        <h3 className="font-display text-xl">Latest bouquets</h3>
        {d.recent.length === 0 ? (
          <p className="mt-2 text-ink/60">No bouquets sent yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-ink/10">
            {d.recent.map((b) => (
              <li key={b.slug} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2 text-sm">
                <Link href={`/b/${b.slug}`} className="font-display text-base text-rose-deep underline">
                  {b.stemCount} stems
                </Link>
                <span className="text-ink/70">{when.format(b.createdAt)}</span>
                {b.neededBy && <span>Needed by {formatDate(b.neededBy)}</span>}
                {b.remarks && <span className="w-full text-ink/70">“{b.remarks}”</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
