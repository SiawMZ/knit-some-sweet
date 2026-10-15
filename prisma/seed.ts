/**
 * Seeds the starting catalog from src/lib/catalog/seed.ts.
 * Safe to re-run: rows that already exist are left as the seller edited them.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCatalog } from "../src/lib/catalog/seed";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const colors = new Map<string, { id: string; name: string; hex: string }>();
  for (const row of [...seedCatalog.items, ...seedCatalog.vessels]) {
    for (const c of row.colors) colors.set(c.id, c);
  }
  for (const c of colors.values()) {
    await prisma.color.upsert({ where: { id: c.id }, create: c, update: {} });
  }

  for (const [position, { colors: itemColors, ...item }] of seedCatalog.items.entries()) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        position,
        colors: { create: itemColors.map((c, i) => ({ colorId: c.id, position: i })) },
      },
    });
  }

  for (const [position, { colors: vesselColors, ...vessel }] of seedCatalog.vessels.entries()) {
    await prisma.vessel.upsert({
      where: { id: vessel.id },
      update: {},
      create: {
        ...vessel,
        position,
        colors: { create: vesselColors.map((c, i) => ({ colorId: c.id, position: i })) },
      },
    });
  }

  console.log(
    `Seeded ${colors.size} colors, ${seedCatalog.items.length} items and ${seedCatalog.vessels.length} vessels.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
