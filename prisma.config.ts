// Prisma 7 config — the connection URL lives here (not in schema.prisma).
// SQLite for local development. For Vercel production, set DATABASE_URL to a
// Postgres connection string (Neon/Supabase) and change the schema provider
// to "postgresql" (see README.md).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
