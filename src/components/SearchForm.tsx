"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import ResultView from "./ResultView";
import {
  statusLabel,
  type ApplicantData,
  type SearchMode,
} from "@/lib/familycard";

type SearchResult =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "notfound" }
  | { state: "found"; data: ApplicantData };

type HistoryItem = {
  id: string;
  mode: SearchMode;
  queryLabel: string;
  applicationId?: string | null;
  found: boolean;
  createdAt: string;
};

export default function SearchForm() {
  const [mode, setMode] = useState<SearchMode>("tracking");
  const [trackingNo, setTrackingNo] = useState("");
  const [nid, setNid] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaImage, setCaptchaImage] = useState<string | null>(null);
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult>({ state: "idle" });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const captchaInputRef = useRef<HTMLInputElement>(null);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaError(null);
    try {
      const res = await fetch("/api/captcha");
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
    } catch (e) {
      setCaptchaError(
        e instanceof Error ? e.message : "ক্যাপচা আনতে ব্যর্থ হয়েছে।",
      );
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/history");
      if (!res.ok) return;
      const data = (await res.json()) as { items?: HistoryItem[] };
      setHistory(data.items ?? []);
    } catch {
      // History is a nicety — never break the form over it.
    }
  }, []);

  // Initial load only. All setState calls happen inside promise callbacks
  // (not synchronously in the effect body) — see react-hooks/set-state-in-effect.
  // Refreshes after a submit / button press use loadCaptcha / loadHistory.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/captcha")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.captcha_token && data.captcha_image) {
          setCaptchaToken(data.captcha_token);
          setCaptchaImage(data.captcha_image);
          setCaptchaError(null);
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
    fetch("/api/history")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setHistory(data.items ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!captchaToken) return;
    setResult({ state: "loading" });
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          trackingNo: mode === "tracking" ? trackingNo : undefined,
          nid: mode === "idcard" ? nid : undefined,
          dateOfBirth: mode === "idcard" ? dateOfBirth : undefined,
          captchaToken,
          captchaValue,
        }),
      });
      const data = (await res.json()) as {
        status?: boolean;
        data?: ApplicantData | null;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "সার্চ করতে ব্যর্থ হয়েছে।");
      }
      setResult(
        data.data ? { state: "found", data: data.data } : { state: "notfound" },
      );
      loadCaptcha();
      loadHistory();
    } catch (err) {
      setResult({
        state: "error",
        message:
          err instanceof Error ? err.message : "সার্চ করতে ব্যর্থ হয়েছে।",
      });
      loadCaptcha();
    }
  }

  /** One-tap re-run from history (tracking searches only — those need
   *  no NID, just the application ID). */
  function rerun(item: HistoryItem) {
    if (!item.applicationId) return;
    setMode("tracking");
    setTrackingNo(item.applicationId);
    setResult({ state: "idle" });
    captchaInputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteHistoryItem(id: string) {
    await fetch(`/api/history?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setHistory((h) => h.filter((x) => x.id !== id));
  }

  async function clearHistory() {
    if (!confirm("সার্চের পুরো ইতিহাস মুছে ফেলবেন?")) return;
    await fetch("/api/history?all=1", { method: "DELETE" });
    setHistory([]);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800"
      >
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">আবেদন খুঁজুন</h2>

        {/* Mode tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          <button
            type="button"
            onClick={() => setMode("tracking")}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              mode === "tracking"
                ? "bg-white text-brand-700 shadow dark:bg-stone-900 dark:text-emerald-300"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
            }`}
          >
            ট্র্যাকিং নম্বর দিয়ে
          </button>
          <button
            type="button"
            onClick={() => setMode("idcard")}
            className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
              mode === "idcard"
                ? "bg-white text-brand-700 shadow dark:bg-stone-900 dark:text-emerald-300"
                : "text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
            }`}
          >
            আইডি কার্ড (NID/BRN) দিয়ে
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {mode === "tracking" ? (
            <div>
              <label
                htmlFor="trackingNo"
                className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
              >
                ট্র্যাকিং নম্বর (১০ ডিজিট)
              </label>
              <input
                id="trackingNo"
                inputMode="numeric"
                value={trackingNo}
                onChange={(e) =>
                  setTrackingNo(e.target.value.replace(/[^0-9]/g, ""))
                }
                maxLength={10}
                placeholder="যেমন: 1234567890"
                className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg font-mono tracking-wider text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
                required
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="nid"
                  className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  NID / BRN নম্বর
                </label>
                <input
                  id="nid"
                  inputMode="numeric"
                  value={nid}
                  onChange={(e) =>
                    setNid(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  maxLength={17}
                  placeholder="১০/১৭ ডিজিটের NID অথবা BRN"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-lg font-mono tracking-wider text-stone-900 placeholder:text-stone-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="dob"
                  className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300"
                >
                  জন্ম তারিখ
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:[color-scheme:dark]"
                  required
                />
              </div>
            </div>
          )}

          {/* Captcha */}
          <div className="rounded-xl bg-stone-50 p-4 ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
                ক্যাপচা — ছবির অঙ্কের উত্তর লিখুন
              </p>
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={captchaLoading}
                className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-stone-600 ring-1 ring-stone-200 hover:bg-stone-100 disabled:opacity-50 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-700 dark:hover:bg-stone-700"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${captchaLoading ? "animate-spin" : ""}`}
                />
                নতুন ক্যাপচা
              </button>
            </div>
            {captchaError ? (
              <p className="mt-3 text-sm text-red-600 dark:text-red-400">{captchaError}</p>
            ) : captchaLoading || !captchaImage ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                ক্যাপচা আসছে…
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={captchaImage}
                  alt="ক্যাপচা ছবি"
                  className="h-14 rounded-lg border border-stone-300 bg-white dark:border-stone-600"
                />
                <input
                  ref={captchaInputRef}
                  type="number"
                  inputMode="numeric"
                  value={captchaValue}
                  onChange={(e) => setCaptchaValue(e.target.value)}
                  placeholder="উত্তর"
                  className="w-32 rounded-xl border border-stone-300 px-4 py-3 text-lg text-stone-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                  required
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              result.state === "loading" || !captchaToken || captchaLoading
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 text-base font-bold text-white shadow hover:bg-brand-800 disabled:opacity-50"
          >
            {result.state === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                খোঁজা হচ্ছে…
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                সার্চ করুন
              </>
            )}
          </button>
        </div>
      </form>

      {/* Search history */}
      {history.length > 0 && (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
              <History className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
              সাম্প্রতিক সার্চ
            </h3>
            <button
              type="button"
              onClick={clearHistory}
              className="flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              সব মুছুন
            </button>
          </div>
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {history.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.found
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {item.found ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                    {item.queryLabel}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {item.found ? "পাওয়া গেছে" : "পাওয়া যায়নি"} •{" "}
                    {new Date(item.createdAt).toLocaleString("bn-BD", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {item.applicationId ? (
                  <button
                    type="button"
                    onClick={() => rerun(item)}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 dark:bg-brand-900/50 dark:text-emerald-300 dark:hover:bg-brand-900"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    আবার খুঁজুন
                  </button>
                ) : (
                  <span className="shrink-0 text-xs text-stone-400 dark:text-stone-500">
                    আবার খুঁজতে NID লাগবে
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => deleteHistoryItem(item.id)}
                  aria-label="ইতিহাস থেকে মুছুন"
                  className="shrink-0 rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-red-600 dark:hover:bg-stone-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
            ইতিহাসে NID নম্বর রাখা হয় না — শুধু ট্র্যাকিং নম্বর বা মাস্ক করা
            লেবেল থাকে।
          </p>
        </section>
      )}

      {/* Result */}
      {result.state === "loading" && (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-8 text-stone-600 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:text-stone-300 dark:ring-stone-800">
          <Loader2 className="h-5 w-5 animate-spin" />
          সরকারি সিস্টেম থেকে তথ্য আনা হচ্ছে…
        </div>
      )}

      {result.state === "error" && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">সার্চ করা যায়নি</p>
            <p className="text-sm">{result.message}</p>
            <p className="mt-1 text-sm">
              ক্যাপচার উত্তর ভুল হলে নতুন ক্যাপচা নিয়ে আবার চেষ্টা করুন।
            </p>
          </div>
        </div>
      )}

      {result.state === "notfound" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          <p className="font-bold">এই তথ্যে কোনো আবেদন পাওয়া যায়নি</p>
          <p className="mt-1 text-sm">
            ট্র্যাকিং নম্বর বা NID + জন্ম তারিখ ঠিক আছে কি না আবার দেখুন।
            ট্র্যাকিং নম্বরই আবেদন আইডি (১০ ডিজিট)।
          </p>
        </div>
      )}

      {result.state === "found" && (
        <ResultView data={result.data} />
      )}

      {result.state === "found" && (
        <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          স্ট্যাটাস: {statusLabel(result.data.status).label} —{" "}
          {result.data.status === "0"
            ? "আবেদন গৃহীত হয়েছে, কিন্তু এখনো অনুমোদন হয়নি।"
            : "স্ট্যাটাসের বিস্তারিত জানতে উপজেলা সমাজসেবা অফিসে যোগাযোগ করুন।"}
        </p>
      )}
    </div>
  );
}
