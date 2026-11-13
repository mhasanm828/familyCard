"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { signIn, useSession, authErrorMessage } from "@/lib/auth-client";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in (e.g. came back to /signin)? Don't show the
  // form — send the account where it belongs (admin → /admin).
  const { data: session } = useSession();
  useEffect(() => {
    if (session) router.replace("/auth/callback");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // No callbackURL here on purpose: Better Auth would do a full
      // window.location navigation itself AND this code would also
      // router.push — the race left users on a blank page. Instead
      // the single landing page /auth/callback routes by role
      // (admin → /admin, approved → /profile, pending → /pending).
      const { error } = await signIn.email({
        email,
        password,
      });
      if (error) {
        setError(
          authErrorMessage(error, "ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।"),
        );
        return;
      }
      router.push("/auth/callback");
    } catch {
      // Network failure (e.g. the server is down or unreachable) used
      // to reject the promise uncaught — "Uncaught TypeError: Failed
      // to fetch" in the console and a stuck spinner. Show it plainly.
      setError(
        "সার্ভারের সাথে সংযোগ হয়নি — ইন্টারনেট সংযোগ আর সাইটটি চালু আছে কি না দেখে আবার চেষ্টা করুন।",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
          <LogIn className="h-6 w-6 text-brand-700 dark:text-emerald-400" />
          লগইন করুন
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          সার্চ করতে আর সেভ করা আবেদন দেখতে লগইন লাগবে।
        </p>
        <div className="mt-6">
          <SocialLoginButtons />
        </div>
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          <span className="text-xs font-bold text-stone-400 dark:text-stone-500">অথবা ইমেইল দিয়ে</span>
          <span className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="আপনার পাসওয়ার্ড"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-800 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            লগইন করুন
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-500 dark:text-stone-400">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/signup" className="font-bold text-brand-700 underline dark:text-emerald-400">
            অ্যাকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </div>
  );
}
