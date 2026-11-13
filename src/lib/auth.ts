import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getClient, getLazyDb } from "./db";

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

/**
 * Normalize an env-provided origin to its canonical form
 * (`new URL(v).origin` — lowercased host, no trailing slash).
 * Returns null for empty/invalid values so a bad env var can never
 * poison the list. Lowercasing matters: Vercel lowercases project
 * names, so `https://familyCard.vercel.app` in BETTER_AUTH_URL does
 * NOT match the real origin `https://familycard.vercel.app`.
 */
function normalizeOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

/**
 * Origins allowed to call the auth API. Better Auth answers 403
 * `INVALID_ORIGIN` for any POST whose Origin header is not in this
 * list, and by default the list holds ONLY baseURL — so a single
 * typo/case difference in BETTER_AUTH_URL broke registration on the
 * deployed site with a bare 403. The list therefore covers:
 * - BETTER_AUTH_URL and NEXT_PUBLIC_APP_URL (normalized, so a capital
 *   letter or trailing slash in the env var cannot break it),
 * - `https://*.vercel.app` — every Vercel deployment of this project
 *   (preview + production), wildcard supported by Better Auth,
 * - `http://localhost:3000` for local development.
 */
const trustedOrigins = [
  normalizeOrigin(process.env.BETTER_AUTH_URL),
  normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL),
  "https://*.vercel.app",
  "http://localhost:3000",
].filter((o): o is string => o !== null);

if (!process.env.BETTER_AUTH_SECRET) {
  // Without a secret Better Auth falls back to a per-boot random one,
  // which silently breaks sessions on every redeploy/restart.
  console.warn(
    "[auth] BETTER_AUTH_SECRET is not set — set it in Vercel env vars " +
      "or .env.local, otherwise logins will not survive a redeploy.",
  );
}

/** Which social providers are actually configured (for the UI). */
export const socialProvidersEnabled = {
  google: googleEnabled,
  facebook: facebookEnabled,
};

export const auth = betterAuth({
  // getLazyDb(): the adapter only touches the Db on the first real
  // query, so importing this module (e.g. during `next build`) must
  // not throw when DATABASE_URL is unset yet.
  database: mongodbAdapter(getLazyDb(), {
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
  trustedOrigins,
});

export type Session = typeof auth.$Infer.Session;
