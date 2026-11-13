"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";

/**
 * /auth/callback — the single landing page after ANY successful login
 * (email/password AND Google/Facebook). It asks the server where this
 * account belongs and goes straight there:
 * - admin → /admin (immediately, no stop at the homepage)
 * - pending → /pending
 * - approved user → /profile
 * - not logged in → /signin
 * The server decides (see /api/route-after-login) — the client only
 * follows. One navigation, no loops: this page never renders links
 * to itself.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/route-after-login", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("not-logged-in");
        const d = (await r.json()) as { destination?: string };
        if (cancelled) return;
        const dest = d.destination ?? "/profile";
        router.replace(dest);
      })
      .catch(() => {
        if (!cancelled) {
          setError(
            "লগইনের অবস্থা জানা যায়নি — আবার লগইন করে দেখুন। সার্ভারের সাথে সংযোগ না থাকলেও এমন হতে পারে।",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (error) {
    return (
      <div className="mx-auto max-w-md pt-10">
        <div className="animate-fade-up rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <AlertTriangle className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-stone-800 dark:text-stone-100">
            লগইন সম্পূর্ণ হয়নি
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {error}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/signin"
              className="rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-800"
            >
              লগইন পেজে যান
            </Link>
            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
            >
              হোমপেজে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pt-16 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-700 dark:text-emerald-400" />
      <p className="mt-3 text-sm font-medium text-stone-500 dark:text-stone-400">
        লগইন হচ্ছে — আপনাকে সঠিক পেজে নিয়ে যাওয়া হচ্ছে…
      </p>
    </div>
  );
}
