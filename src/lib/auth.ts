import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getClient, getDb } from "./db";

/**
 * Better Auth instance — native MongoDB driver (no ORM).
 * - Email + password sign-up / sign-in (passwords hashed by Better Auth).
 * - Google + Facebook social login, enabled only when their client ID and
 *   secret are set in the environment. Credentials never live in code —
 *   see .env.example and README.md for the setup steps.
 * - Auth collections: users, sessions, accounts, verifications
 *   (usePlural). BETTER_AUTH_SECRET and BETTER_AUTH_URL come from the
 *   environment; never commit a real secret.
 */

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
const facebookEnabled = Boolean(
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET,
);

/** Which social providers are actually configured (for the UI). */
export const socialProvidersEnabled = {
  google: googleEnabled,
  facebook: facebookEnabled,
};

export const auth = betterAuth({
  database: mongodbAdapter(getDb(), {
    client: getClient(),
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  socialProviders: {
    ...(googleEnabled
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : {}),
    ...(facebookEnabled
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
          },
        }
      : {}),
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
});

export type Session = typeof auth.$Infer.Session;
