import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  // SQLite (local dev) via the better-sqlite3 driver adapter.
  // For Postgres on Vercel, swap this adapter for @prisma/adapter-pg
  // (see README.md) — the rest of the app code stays the same.
  if (url.startsWith("file:")) {
    const path = url.replace(/^file:/, "");
    const adapter = new PrismaBetterSqlite3({ url: path });
    return new PrismaClient({ adapter });
  }
  // Postgres (or any other URL) — the pg adapter is wired in when
  // DATABASE_URL is not a file: URL. Kept lazy so the sqlite-only
  // install does not need pg at runtime.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require("pg") as typeof import("pg");
  const pool = new Pool({ connectionString: url });
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
