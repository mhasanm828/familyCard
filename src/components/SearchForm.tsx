"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Barcode,
  IdCard,
  Loader2,
  RefreshCw,
  Search,
  SearchX,
} from "lucide-react";
import ResultView from "./ResultView";
import type { ApplicantData, SearchMode } from "@/lib/familycard";

type Phase = "idle" | "loading" | "not-found" | "done" | "error";

export default function SearchForm() {
  const [mode, setMode] = useState<SearchMode>("tracking");
  const [trackingNo, setTrackingNo] = useState("");
  const [nid, setNid] = useState("");
  const [dob, setDob] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApplicantData | null>(null);

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    try {
      const res = await fetch("/api/captcha");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ক্যাপচা আনতে ব্যর্থ হয়েছে");
      setCaptchaToken(json.captcha_token);
      setCaptchaImage(json.captcha_image);
      setCaptchaValue("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "ক্যাপচা আনতে ব্যর্থ হয়েছে");
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch the first captcha; state updates happen only in the promise
    // callbacks (React 19 lint: no synchronous setState in an effect body).
    let cancelled = false;
    fetch("/api/captcha")
      .then((res) => res.json())
      .then((json: { captcha_token?: string; captcha_image?: string; error?: string }) => {
        if (cancelled) return;
        if (json.error || !json.captcha_token) {
          setError(json.error ?? "ক্যাপচা আনতে ব্যর্থ হয়েছে");
          return;
        }
        setCaptchaToken(json.captcha_token);
        setCaptchaImage(json.captcha_image ?? "");
        setCaptchaValue("");
      })
      .catch(() => {
        if (!cancelled) setError("ক্যাপচা আনতে ব্যর্থ হয়েছে");
      })
      .finally(() => {
        if (!cancelled) setCaptchaLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    if (mode === "tracking" && !/^[1-9][0-9]{9}$/.test(trackingNo.trim())) {
      setError("ট্র্যাকিং নম্বর অবশ্যই ১০ ডিজিটের হতে হবে (১–৯ দিয়ে শুরু)।");
      return;
    }
    if (mode === "idcard") {
      const n = nid.trim();
      if (!/^([1-9][0-9]{9}|[1-9][0-9]{16})$/.test(n) && !/^(19|20)[0-9]{15}$/.test(n)) {
        setError("NID ১০ বা ১৭ ডিজিট, অথবা BRN ১৭ ডিজিট হতে হবে।");
        return;
      }
      if (!dob) {
        setError("জন্ম তারিখ দিন।");
        return;
      }
    }
    if (!captchaValue.trim() || !captchaToken) {
      setError("ক্যাপচার উত্তর দিন।");
      return;
    }

    setPhase("loading");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          trackingNo: trackingNo.trim(),
          nid: nid.trim(),
          dateOfBirth: dob,
          captchaToken,
          captchaValue: Number(captchaValue),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "সার্চ করতে ব্যর্থ হয়েছে।");
      if (!json.data) {
        setPhase("not-found");
      } else {
        setResult(json.data as ApplicantData);
        setPhase("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "সার্চ করতে ব্যর্থ হয়েছে।");
      setPhase("error");
    } finally {
      // Every search needs a fresh captcha — reload for the next search.
      loadCaptcha();
    }
  }

  const tabBtn = (m: SearchMode, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => {
        setMode(m);
        setError("");
        setResult(null);
        setPhase("idle");
      }}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
        mode === m
          ? "bg-brand-700 text-white shadow"
          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
        <div className="mb-5 flex gap-2">
          {tabBtn("tracking", "ট্র্যাকিং নম্বর", <Barcode className="h-4 w-4" />)}
          {tabBtn("idcard", "আইডি কার্ড (NID/BRN) + জন্ম তারিখ", <IdCard className="h-4 w-4" />)}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "tracking" ? (
            <div>
              <label htmlFor="trackingNo" className="mb-1.5 block text-sm font-semibold text-stone-700">
                ট্র্যাকিং নম্বর / আবেদন আইডি <span className="text-red-600">*</span>
              </label>
              <input
                id="trackingNo"
                inputMode="numeric"
                maxLength={10}
                placeholder="১০ ডিজিটের ট্র্যাকিং নম্বর লিখুন"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg tracking-widest outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1.5 text-xs text-stone-500">
                ঠিক ১০ ডিজিট, ১–৯ দিয়ে শুরু। এটাই আবেদন আইডি।
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nid" className="mb-1.5 block text-sm font-semibold text-stone-700">
                  NID / BRN নম্বর <span className="text-red-600">*</span>
                </label>
                <input
                  id="nid"
                  inputMode="numeric"
                  maxLength={17}
                  placeholder="১০ বা ১৭ ডিজিটের NID, অথবা ১৭ ডিজিটের BRN"
                  value={nid}
                  onChange={(e) => setNid(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg tracking-widest outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label htmlFor="dob" className="mb-1.5 block text-sm font-semibold text-stone-700">
                  জন্ম তারিখ <span className="text-red-600">*</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          )}

          {/* Captcha */}
          <div>
            <label htmlFor="captchaValue" className="mb-1.5 block text-sm font-semibold text-stone-700">
              ক্যাপচা — ছবির অঙ্কের উত্তর লিখুন <span className="text-red-600">*</span>
            </label>
            <div className="flex items-stretch gap-3">
              <div className="flex min-h-[56px] min-w-[140px] items-center justify-center overflow-hidden rounded-xl border border-stone-300 bg-white">
                {captchaLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-stone-400" />
                ) : captchaImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={captchaImage} alt="ক্যাপচা অঙ্ক" className="h-14" />
                ) : (
                  <span className="text-xs text-stone-400">ক্যাপচা আসেনি</span>
                )}
              </div>
              <button
                type="button"
                onClick={loadCaptcha}
                disabled={captchaLoading}
                className="flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 text-sm font-medium text-stone-600 hover:bg-stone-200 disabled:opacity-50"
                title="নতুন ক্যাপচা"
              >
                <RefreshCw className={`h-4 w-4 ${captchaLoading ? "animate-spin" : ""}`} />
                নতুন
              </button>
              <input
                id="captchaValue"
                inputMode="numeric"
                placeholder="উত্তর"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value.replace(/[^0-9-]/g, ""))}
                className="w-full flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-lg outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              প্রতিটা সার্চে নতুন ক্যাপচা লাগে — এটা সরকারি সাইটের নিয়ম।
            </p>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={phase === "loading" || captchaLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3.5 text-base font-bold text-white shadow hover:bg-brand-800 disabled:opacity-60"
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                খোঁজা হচ্ছে…
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                তথ্য খুঁজুন
              </>
            )}
          </button>
        </form>
      </div>

      {phase === "not-found" && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
          <SearchX className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">কোনো রেকর্ড পাওয়া যায়নি।</p>
            <p className="text-sm">
              এই নম্বর/তথ্য দিয়ে সরকারি সিস্টেমে কোনো আবেদন মেলেনি। নম্বরটি
              আবার মিলিয়ে দেখুন, অথবা NID + জন্ম তারিখ দিয়ে চেষ্টা করুন।
            </p>
          </div>
        </div>
      )}

      {phase === "done" && result && <ResultView data={result} />}
    </div>
  );
}
