"use client";

import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

/**
 * Route-level error boundary — without this, a server-component error
 * during client-side navigation rendered a blank white page (that is
 * what users saw after login when the database hiccuped). Any error
 * now shows this Bangla message instead of nothing.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="animate-fade-up rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-800 dark:text-stone-100">
          পেজটি খোলা যায়নি
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          কিছু একটা সমস্যা হয়েছে — বেশিরভাগ সময় ডাটাবেজের সাথে সংযোগ
          না পেলে এমন হয়। আবার চেষ্টা করুন, না হলে হোমপেজে ফিরে যান।
        </p>
        {error?.digest ? (
          <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
            কোড: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-800"
          >
            <RotateCcw className="h-4 w-4" />
            আবার চেষ্টা করুন
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
          >
            <Home className="h-4 w-4" />
            হোমপেজে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
