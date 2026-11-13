"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn.email({
      email,
      password,
      callbackURL: "/search",
    });
    setLoading(false);
    if (error) {
      setError("ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।");
      return;
    }
    router.push("/search");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800">
          <LogIn className="h-6 w-6 text-brand-700" />
          লগইন করুন
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          সার্চ করতে আর সেভ করা আবেদন দেখতে লগইন লাগবে।
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-stone-700">
              ইমেইল
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="আপনার ইমেইল"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-stone-700">
              পাসওয়ার্ড
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="আপনার পাসওয়ার্ড"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
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
        <p className="mt-5 text-center text-sm text-stone-500">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/signup" className="font-bold text-brand-700 underline">
            অ্যাকাউন্ট খুলুন
          </Link>
        </p>
      </div>
    </div>
  );
}
