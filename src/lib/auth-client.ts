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
