"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  FileSearch,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { statusLabel, type ApplicantData } from "@/lib/familycard";
import ResultView from "./ResultView";

type ResultState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "not-found" }
  | { state: "found"; data: ApplicantData }
  | { state: "error"; message: string };

/**
 * Public search form for /new-search — no login, nothing saved.
 * Application ID (10-digit tracking number) ONLY, behind the
 * government captcha, exactly like the public tracking page.
 * NID/BRN search and the 7-digit internal id are intentionally NOT
 * here — they stay on the logged-in /search page.
 */
export default function PublicSearchForm() {
  const [trackingNo, setTrackingNo] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState>({ state: "idle" });

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaError(null);
    try {
      const res = await fetch("/api/public-captcha");
      const data = (await res.json()) as {
        captcha_token?: string;
        captcha_image?: string;
        error?: string;
      };
      if (!res.ok || !data.captcha_token || !data.captcha_image) {
        throw new Error(data.error ?? "ক্যাপচা আনতে ব্যর্থ হয়েছে।");
      }
      setCaptchaToken(data.captcha_token);
      setCaptchaImage(data.captcha_image);
      setCaptchaValue("");
    } catch (e) {
      setCaptchaError(
        e instanceof Error ? e.message : "ক্যাপচা আনতে ব্যর্থ হয়েছে।",
      );
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  // Initial load only. All setState calls happen inside promise callbacks
  // (not synchronously in the effect body) — see react-hooks/set-state-in-effect.
  // Refreshes after a submit / button press use loadCaptcha.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/public-captcha")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.captcha_token && data.captcha_image) {
          setCaptchaToken(data.captcha_token);
          setCaptchaImage(data.captcha_image);
          setCaptchaError(null);
          setCaptchaValue("");
        } else {
          setCaptchaError(data.error ?? "ক্যাপচা আনতে ব্যর্থ হয়েছে।");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setCaptchaError(
            e instanceof Error ? e.message : "ক্যাপচা আনতে ব্যর্থ হয়েছে।",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setCaptchaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = trackingNo.trim();
    if (!/^[1-9][0-9]{9}$/.test(id)) {
      setResult({
        state: "error",
        message: "ট্র্যাকিং নম্বর অবশ্যই ১০ ডিজিটের হতে হবে (১–৯ দিয়ে শুরু)।",
      });
      return;
    }
    if (!captchaToken || !captchaValue.trim()) {
      setResult({ state: "error", message: "ক্যাপচার উত্তর দিন।" });
      return;
    }
    setResult({ state: "loading" });
    try {
      const res = await fetch("/api/public-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNo: id,
          captchaToken,
          captchaValue: Number(captchaValue),
        }),
      });
      const json = (await res.json()) as {
        data?: ApplicantData | null;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error ?? "সার্চ করতে ব্যর্থ হয়েছে।");
      }
      await loadCaptcha();
      if (!json.data) {
        setResult({ state: "not-found" });
      } else {
        setResult({ state: "found", data: json.data });
      }
    } catch (err) {
      await loadCaptcha();
      setResult({
        state: "error",
        message:
          err instanceof Error ? err.message : "সার্চ করতে ব্যর্থ হয়েছে।",
      });
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={onSubmit}
        className="animate-fade-up rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800"
      >
        <label
          htmlFor="public-tracking-no"
          className="text-sm font-bold text-stone-700 dark:text-stone-200"
        >
          আবেদন আইডি / ট্র্যাকিং নম্বর (১০ ডিজিট)
        </label>
        <input
          id="public-tracking-no"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          value={trackingNo}
          onChange={(e) =>
            setTrackingNo(e.target.value.replace(/[^0-9]/g, ""))
          }
          placeholder="যেমন: 7002743626"
          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-lg tracking-wider text-stone-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        />

        <div className="mt-4">
          <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
            ক্যাপচা — ছবির অঙ্কটির উত্তর দিন
          </p>
          {captchaLoading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              <Loader2 className="h-4 w-4 animate-spin" /> ক্যাপচা আসছে…
            </p>
          ) : captchaError ? (
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {captchaError}
              </p>
              <button
                type="button"
                onClick={loadCaptcha}
                className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
              >
                <RefreshCw className="h-3.5 w-3.5" /> আবার চেষ্টা করুন
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {captchaImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={captchaImage}
                  alt="ক্যাপচা — ছবির অঙ্কটির উত্তর দিন"
                  className="h-12 rounded-lg border border-stone-200 dark:border-stone-700"
                />
              )}
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={captchaValue}
                onChange={(e) =>
                  setCaptchaValue(e.target.value.replace(/[^0-9-]/g, ""))
                }
                placeholder="উত্তর"
                className="w-28 rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg text-stone-800 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-200 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={loadCaptcha}
                title="নতুন ক্যাপচা"
                className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200"
              >
                <RefreshCw className="h-3.5 w-3.5" /> নতুন
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={result.state === "loading" || captchaLoading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white shadow transition hover:bg-brand-800 active:scale-[0.99] disabled:opacity-60"
        >
          {result.state === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> খোঁজা হচ্ছে…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" /> সার্চ করুন
            </>
          )}
        </button>

        <p className="mt-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          লগইন ছাড়া সার্চ — ফলাফল সেভ হয় না, হিসাবও জমা থাকে না। NID/BRN
          দিয়ে খুঁজতে চাইলে{" "}
          <Link
            href="/search"
            className="font-bold text-brand-700 underline dark:text-emerald-400"
          >
            লগইন করে সার্চ পেজে যান
          </Link>
          ।
        </p>
      </form>

      {result.state === "error" && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{result.message}</p>
        </div>
      )}

      {result.state === "not-found" && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          <FileSearch className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            এই ট্র্যাকিং নম্বরে কোনো আবেদন পাওয়া যায়নি। নম্বরটি আবার মিলিয়ে
            দেখুন — ভুল হলে সঠিক ১০ ডিজিটের নম্বর দিয়ে আবার চেষ্টা করুন।
          </p>
        </div>
      )}

      {result.state === "found" && (
        <>
          <ResultView data={result.data} publicMode />
          <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
            স্ট্যাটাস: {statusLabel(result.data.status).label} —{" "}
            {result.data.status === "0"
              ? "আবেদন গৃহীত হয়েছে, কিন্তু এখনো অনুমোদন হয়নি।"
              : "স্ট্যাটাসের বিস্তারিত জানতে উপজেলা সমাজসেবা অফিসে যোগাযোগ করুন।"}
          </p>
        </>
      )}
    </div>
  );
}
