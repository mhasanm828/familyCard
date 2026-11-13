"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।");
      return;
    }
    setLoading(true);
    const { error } = await signUp.email({
      email,
      password,
      name,
      callbackURL: "/search",
    });
    setLoading(false);
    if (error) {
      setError(
        error.message?.includes("already")
          ? "এই ইমেইল দিয়ে অ্যাকাউন্ট আগেই খোলা হয়েছে — লগইন করুন।"
          : "অ্যাকাউন্ট খুলতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      );
      return;
    }
    router.push("/search");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
          <UserPlus className="h-6 w-6 text-brand-700 dark:text-emerald-400" />
          অ্যাকাউন্ট খুলুন
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          ইমেইল + পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুললেই সার্চ করতে পারবেন।
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
            <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              নাম
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
            />
          </div>
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
              পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="শক্ত পাসওয়ার্ড দিন"
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
            অ্যাকাউন্ট খুলুন
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-500 dark:text-stone-400">
          অ্যাকাউন্ট আছে?{" "}
          <Link href="/signin" className="font-bold text-brand-700 underline dark:text-emerald-400">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
