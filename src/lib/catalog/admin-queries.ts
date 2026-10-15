import "server-only";
import { db } from "@/lib/server/db";

const withColors = {
  colors: { include: { color: true }, orderBy: { position: "asc" } },
} as const;

export const adminItems = () =>
  db().item.findMany({ include: withColors, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });

export const adminItem = (id: string) => db().item.findUnique({ where: { id }, include: withColors });

export const adminVessels = () =>
  db().vessel.findMany({ include: withColors, orderBy: [{ position: "asc" }, { createdAt: "asc" }] });

export const adminVessel = (id: string) => db().vessel.findUnique({ where: { id }, include: withColors });

/** The palette, with how many items and vessels use each color. */
export const adminColors = () =>
  db().color.findMany({
    include: { _count: { select: { items: true, vessels: true } } },
    orderBy: { name: "asc" },
  });

export type AdminColor = Awaited<ReturnType<typeof adminColors>>[number];
