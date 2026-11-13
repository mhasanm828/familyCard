import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

/**
 * Better Auth instance.
 * - Email + password sign-up / sign-in.
 * - Prisma adapter with provider "mongodb" (MongoDB Atlas on Vercel,
 *   Atlas or a local mongod for local dev — see README.md).
 * - BETTER_AUTH_SECRET and BETTER_AUTH_URL come from the environment;
 *   never commit a real secret (see .env.example).
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
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
