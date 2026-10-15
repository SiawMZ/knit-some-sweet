"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Ranked } from "@/lib/analytics/dashboard";

// Brand tokens (globals.css): one hue for single-series magnitude, ink for text.
const ROSE = "#c4566f";
const ROSE_SOFT = "#f3d3db";
const INK = "#5a4434";
const GRID = "rgb(90 68 52 / 0.12)";
const TICK = { fill: INK, fontSize: 12, opacity: 0.75 };

const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function TooltipBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink/15 bg-paper px-3 py-2 text-sm text-ink shadow-sm">
      <p className="font-display">{title}</p>
      <p className="tabular-nums">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  hint,
  empty,
  table,
  children,
}: {
  title: string;
  hint: string;
  empty: boolean;
  table: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card">
      <h3 className="font-display text-xl">{title}</h3>
      <p className="mb-3 text-sm text-ink/70">{hint}</p>
      {empty ? (
        <p className="rounded-2xl border-2 border-dashed border-ink/20 p-6 text-center text-ink/60">
          Nothing yet. Check back once customers start building ✿
        </p>
      ) : (
        <>
          {children}
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-ink/70">Show as a table</summary>
            {table}
          </details>
        </>
      )}
    </section>
  );
}

function RankTable({ rows, unit }: { rows: Ranked[]; unit: string }) {
  return (
    <table className="mt-2 w-full">
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} className="border-t border-ink/10">
            <td className="py-1">{r.name}</td>
            <td className="py-1 text-right tabular-nums">
              {r.count} {unit}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function VisitsChart({ data, days }: { data: { day: string; views: number }[]; days: number }) {
  return (
    <ChartCard
      title="Visits"
      hint={`Page views per day, last ${days} days`}
      empty={data.every((d) => d.views === 0)}
      table={
        <table className="mt-2 w-full">
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-t border-ink/10">
                <td className="py-1">{shortDay(d.day)}</td>
                <td className="py-1 text-right tabular-nums">{d.views}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <ResponsiveContainer width="100%" height={220} initialDimension={{ width: 600, height: 220 }}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey="day"
            tickFormatter={shortDay}
            tick={TICK}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            minTickGap={24}
          />
          <YAxis allowDecimals={false} tick={TICK} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: INK, strokeOpacity: 0.3 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox title={shortDay(String(label))} value={`${payload[0].value} views`} />
              ) : null
            }
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke={ROSE}
            strokeWidth={2}
            fill={ROSE_SOFT}
            fillOpacity={0.6}
            activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: ROSE }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function RankChart({ rows, unit, colorOf }: { rows: Ranked[]; unit: string; colorOf: (r: Ranked) => string }) {
  const height = rows.length * 34 + 16;
  return (
    <ResponsiveContainer width="100%" height={height} initialDimension={{ width: 400, height }}>
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }} barCategoryGap={6}>
        <XAxis type="number" hide allowDecimals={false} domain={[0, "dataMax"]} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={TICK}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgb(90 68 52 / 0.06)" }}
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipBox
                title={(payload[0].payload as Ranked).name}
                value={`${payload[0].value} ${unit}`}
              />
            ) : null
          }
        />
        <Bar
          dataKey="count"
          maxBarSize={22}
          radius={[0, 4, 4, 0]}
          stroke="rgb(90 68 52 / 0.35)"
          strokeWidth={1}
          label={{ position: "right", fill: INK, fontSize: 12 }}
        >
          {rows.map((r) => (
            <Cell key={r.id} fill={colorOf(r)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopItemsChart({ rows, days }: { rows: Ranked[]; days: number }) {
  return (
    <ChartCard
      title="Most-picked items"
      hint={`Times added to a bouquet, last ${days} days`}
      empty={rows.length === 0}
      table={<RankTable rows={rows} unit="adds" />}
    >
      <RankChart rows={rows} unit="adds" colorOf={() => ROSE} />
    </ChartCard>
  );
}

export function TopColorsChart({ rows, days }: { rows: Ranked[]; days: number }) {
  return (
    <ChartCard
      title="Most-picked colors"
      hint={`Stems in sent bouquets, last ${days} days. Each bar is the yarn color itself.`}
      empty={rows.length === 0}
      table={<RankTable rows={rows} unit="stems" />}
    >
      <RankChart rows={rows} unit="stems" colorOf={(r) => r.hex ?? ROSE} />
    </ChartCard>
  );
}
