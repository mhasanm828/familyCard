"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Client-side auth client.
 *
 * baseURL: prefer NEXT_PUBLIC_APP_URL when it is set at build time.
 * Otherwise default to `window.location.origin` — NEVER localhost.
 * The old fallback `"http://localhost:3000"` was baked into the client
 * bundle whenever the env var was unset, so on a deployed site every
 * auth call went to the visitor's own localhost and failed with
 * ERR_CONNECTION_REFUSED. On the server (SSR) there is no window, so
 * baseURL is left undefined there — auth calls only happen in the
 * browser, where window.location.origin is always the right origin.
 */
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined),
});

export const { signIn, signUp, signOut, useSession } = authClient;

type AuthClientError = {
  status?: number;
  message?: string;
  code?: string;
};

/**
 * Turn a Better Auth client error into a Bangla message the user can
 * act on. The old code swallowed every non-"already" failure into one
 * generic line, so a 403 origin mismatch looked identical to a wrong
 * password. Known failures get a specific message; anything else
 * surfaces the server's own (short) message instead of hiding it.
 */
export function authErrorMessage(error: unknown, fallback: string): string {
  const e = (error ?? {}) as AuthClientError;
  const msg = (e.message ?? "").toLowerCase();
  if (
    e.status === 403 ||
    msg.includes("origin") ||
    msg.includes("forbidden")
  ) {
    return "সাইটের ঠিকানা মিলছে না (403) — Vercel-এ BETTER_AUTH_URL সাইটের আসল ঠিকানার সাথে হুবহু মিলিয়ে বসান (ছোট হাতের অক্ষরে, শেষে / ছাড়া), তারপর Redeploy দিন।";
  }
  if (
    msg.includes("already") ||
    (e.code ?? "").includes("USER_ALREADY_EXISTS")
  ) {
    return "এই ইমেইল দিয়ে অ্যাকাউন্ট আগেই খোলা হয়েছে — লগইন করুন।";
  }
  if (msg.includes("password")) {
    return "পাসওয়ার্ড সঠিক নয় — কমপক্ষে ৮ অক্ষরের হতে হবে।";
  }
  if (msg.includes("invalid email") || msg.includes("invalidemail")) {
    return "ইমেইল ঠিকানাটি সঠিক নয়।";
  }
  if (e.message && e.message.length < 120) return e.message;
  return fallback;
}
