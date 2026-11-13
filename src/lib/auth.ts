import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

const isSqlite = (process.env.DATABASE_URL ?? "file:./dev.db").startsWith(
  "file:",
);

/**
 * Better Auth instance.
 * - Email + password sign-up / sign-in.
 * - Prisma adapter (SQLite locally, Postgres on Vercel — see README.md).
 * - BETTER_AUTH_SECRET and BETTER_AUTH_URL come from the environment;
 *   never commit a real secret (see .env.example).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: isSqlite ? "sqlite" : "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
