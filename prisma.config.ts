import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Read leniently so `prisma generate` works without a database configured.
    // DIRECT_URL (optional) is a non-pooled connection for migrations, e.g. Neon's direct host.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
