"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-client";

type Provider = "google" | "facebook";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07z"
      />
    </svg>
  );
}

/**
 * Google / Facebook sign-in buttons. The buttons always render; when a
 * provider is not configured yet (no client ID/secret in the server env),
 * clicking shows a clear Bangla message instead of a cryptic error.
 */
export default function SocialLoginButtons() {
  const [enabled, setEnabled] = useState<{ google: boolean; facebook: boolean }>({
    google: false,
    facebook: false,
  });
  const [loading, setLoading] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setEnabled({
            google: Boolean(d.google),
            facebook: Boolean(d.facebook),
          });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSocial(provider: Provider) {
    setError("");
    if (!enabled[provider]) {
      setError(
        provider === "google"
          ? "Google লগইন এখনো সেটআপ হয়নি — ইমেইল + পাসওয়ার্ড দিয়ে লগইন করুন।"
          : "Facebook লগইন এখনো সেটআপ হয়নি — ইমেইল + পাসওয়ার্ড দিয়ে লগইন করুন।",
      );
      return;
    }
    setLoading(provider);
    const { error } = await signIn.social({
      provider,
      callbackURL: "/search",
    });
    setLoading(null);
    if (error) {
      setError("সোশ্যাল লগইন করা যায়নি। আবার চেষ্টা করুন।");
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocial("google")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-300 hover:bg-stone-50 disabled:opacity-60 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
        >
          {loading === "google" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </button>
        <button
          type="button"
          onClick={() => handleSocial("facebook")}
          disabled={loading !== null}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#1667d8] disabled:opacity-60"
        >
          {loading === "facebook" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FacebookIcon />
          )}
          Facebook
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900">
          {error}
        </p>
      )}
    </div>
  );
}
