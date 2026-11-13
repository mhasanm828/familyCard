"use client";

import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

/**
 * Root error boundary — catches errors in the layout itself (e.g. the
 * header/session load). Must render its own <html>/<body> because the
 * layout may have failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#f4f6f4] font-sans text-stone-900 antialiased">
        <main className="mx-auto w-full max-w-md px-4 pt-10">
          <div className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200 sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
              <AlertTriangle className="h-8 w-8" />
            </span>
            <h1 className="mt-4 text-2xl font-bold text-stone-800">
              পেজটি খোলা যায়নি
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              কিছু একটা সমস্যা হয়েছে — বেশিরভাগ সময় ডাটাবেজের সাথে
              সংযোগ না পেলে এমন হয়। আবার চেষ্টা করুন, না হলে হোমপেজে
              ফিরে যান।
            </p>
            {error?.digest ? (
              <p className="mt-3 text-xs text-stone-400">
                কোড: {error.digest}
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white hover:bg-emerald-900"
              >
                আবার চেষ্টা করুন
              </button>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50"
              >
                <Home className="h-4 w-4" />
                হোমপেজে ফিরুন
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
