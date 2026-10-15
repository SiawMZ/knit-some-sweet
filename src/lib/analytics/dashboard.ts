import type { Stem } from "@/lib/bouquet";

const DAY = 24 * 60 * 60 * 1000;

/** A date as YYYY-MM-DD in the given IANA time zone. */
export function dayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Page views per day for the last `days` days (oldest first), including days with none. */
export function viewsByDay(dates: Date[], now: Date, days: number, timeZone: string) {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const key = dayKey(d, timeZone);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const out: { day: string; views: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = dayKey(new Date(now.getTime() - i * DAY), timeZone);
    if (out.at(-1)?.day !== day) out.push({ day, views: counts.get(day) ?? 0 });
  }
  return out;
}

export interface Ranked {
  id: string;
  name: string;
  count: number;
  hex?: string;
}

const rank = (counts: Map<string, number>, describe: (id: string) => { name: string; hex?: string }, limit: number) =>
  [...counts]
    .map(([id, count]) => ({ id, count, ...describe(id) }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit);

/** Items ranked by how often customers added them. Deleted items keep their id as the name. */
export function topItems(
  added: { itemId: string | null; count: number }[],
  names: Map<string, string>,
  limit = 10,
): Ranked[] {
  const counts = new Map<string, number>();
  for (const { itemId, count } of added) {
    if (itemId) counts.set(itemId, (counts.get(itemId) ?? 0) + count);
  }
  return rank(counts, (id) => ({ name: names.get(id) ?? id }), limit);
}

/** Colors ranked by how many stems of submitted bouquets use them. */
export function topColors(
  bouquets: { stems: Pick<Stem, "colorId">[] }[],
  palette: Map<string, { name: string; hex: string }>,
  limit = 10,
): Ranked[] {
  const counts = new Map<string, number>();
  for (const b of bouquets) {
    for (const s of b.stems) counts.set(s.colorId, (counts.get(s.colorId) ?? 0) + 1);
  }
  return rank(counts, (id) => palette.get(id) ?? { name: id, hex: "#cccccc" }, limit);
}
