"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BookmarkCheck,
  BookmarkPlus,
  Calendar,
  Check,
  ClipboardCopy,
  Download,
  FileText,
  Home,
  IdCard,
  Loader2,
  MapPin,
  Printer,
  Users,
  Wallet,
} from "lucide-react";
import {
  isPaymentBlank,
  officialPdfUrl,
  proxiedImageUrl,
  statusLabel,
  type ApplicantData,
} from "@/lib/familycard";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-stone-100 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:justify-between dark:border-stone-800">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <span className="text-sm font-medium text-stone-800 sm:text-right dark:text-stone-100">
        {value === null || value === undefined || value === "" ? "—" : String(value)}
      </span>
    </div>
  );
}

function PhotoCard({
  title,
  src,
  alt,
}: {
  title: string;
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4 text-center text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
        {title} — ছবি নেই
      </div>
    );
  }
  return (
    <figure className="print-card overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="relative aspect-[4/3] w-full">
        {/* Plain <img>: the src is our own /api/image proxy with a query
            string, which next/image does not accept without localPatterns. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </div>
      <figcaption className="border-t border-stone-100 px-3 py-2 text-center text-sm font-medium text-stone-700 dark:border-stone-800 dark:text-stone-200">
        {title}
      </figcaption>
    </figure>
  );
}

const toneClasses: Record<string, string> = {
  amber:
    "bg-amber-100 text-amber-800 ring-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:ring-amber-700",
  green:
    "bg-emerald-100 text-emerald-800 ring-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:ring-emerald-700",
  red: "bg-red-100 text-red-800 ring-red-300 dark:bg-red-900/60 dark:text-red-200 dark:ring-red-700",
  gray: "bg-stone-100 text-stone-700 ring-stone-300 dark:bg-stone-700 dark:text-stone-200 dark:ring-stone-600",
};

/** Clean Bangla summary for copying — NID / mobile are never included. */
export function buildSummary(data: ApplicantData): string {
  const status = statusLabel(data.status);
  const officeName =
    data.office_has_ward?.office?.name_bn ??
    data.office_has_ward?.office?.name_en ??
    "—";
  const lines = [
    "ফ্যামিলি কার্ড আবেদন — সারাংশ",
    `নাম: ${data.name_bn ?? "—"}${data.name_en ? ` (${data.name_en})` : ""}`,
    `আবেদন আইডি: ${data.application_id ?? "—"}`,
    `স্ট্যাটাস: ${status.label}`,
    `PMT স্কোর: ${data.score ?? "—"}`,
    `পরিবারের সদস্য: ${data.no_of_family_members ?? "—"}`,
    `ভাতার পরিমাণ: ${data.allowance_amount ? `৳${data.allowance_amount}` : "৳০"}`,
    `অফিস: ${officeName}`,
    `পেমেন্ট তথ্য: ${isPaymentBlank(data) ? "ফাঁকা — ব্যাংক/MFS দেওয়া হয়নি" : "দেওয়া আছে"}`,
  ];
  return lines.join("\n");
}

export default function ResultView({
  data,
  initialSaved = false,
}: {
  data: ApplicantData;
  /** True when this record is already in the user's saved list
   *  (auto-saved by the search, or opened from /saved). */
  initialSaved?: boolean;
}) {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const status = statusLabel(data.status);
  const paymentBlank = isPaymentBlank(data);
  const officeName =
    data.office_has_ward?.office?.name_bn ??
    data.office_has_ward?.office?.name_en ??
    "—";
  const created = data.created_at ? new Date(data.created_at) : null;

  /** Explicit save — POSTs the (already sanitized) record to /api/saved.
   *  Upsert on the server makes a second tap harmless. */
  async function saveNow() {
    if (!data.application_id || saved || saving) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: String(data.application_id),
          data,
        }),
      });
      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "সেভ করা যায়নি।");
      }
      setSaved(true);
      setSaveMessage("✓ সেভ হয়েছে — সেভ করা তালিকায় দেখতে পাবেন।");
    } catch (e) {
      setSaveMessage(
        e instanceof Error ? e.message : "সেভ করা যায়নি — আবার চেষ্টা করুন।",
      );
    } finally {
      setSaving(false);
    }
  }

  async function copySummary() {
    const text = buildSummary(data);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API unavailable (older browser / insecure context).
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Summary header */}
      <div className="print-card overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
        <div className="bg-brand-800 px-5 py-4 text-white sm:px-6 dark:bg-brand-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold">{data.name_bn ?? "—"}</h2>
              <p className="text-sm text-emerald-100">
                {data.name_en ?? ""} • আবেদন আইডি:{" "}
                <span className="font-mono font-semibold">
                  {data.application_id ?? "—"}
                </span>
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${toneClasses[status.tone]}`}
            >
              {status.label}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-px bg-stone-100 sm:grid-cols-4 dark:bg-stone-800">
          <div className="bg-white px-4 py-3 text-center dark:bg-stone-900">
            <p className="text-xs text-stone-500 dark:text-stone-400">PMT স্কোর</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400">
              {data.score ?? "—"}
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center dark:bg-stone-900">
            <p className="text-xs text-stone-500 dark:text-stone-400">পরিবারের সদস্য</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400">
              {data.no_of_family_members ?? "—"}
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center dark:bg-stone-900">
            <p className="text-xs text-stone-500 dark:text-stone-400">ভাতার পরিমাণ</p>
            <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400">
              {data.allowance_amount ? `৳${data.allowance_amount}` : "৳০"}
            </p>
          </div>
          <div className="bg-white px-4 py-3 text-center dark:bg-stone-900">
            <p className="text-xs text-stone-500 dark:text-stone-400">অনুমোদনের তারিখ</p>
            <p className="text-lg font-bold text-brand-700 dark:text-emerald-400">
              {data.approve_date ?? "হয়নি"}
            </p>
          </div>
        </div>
      </div>

      {/* Payment warning */}
      {paymentBlank ? (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">পেমেন্ট তথ্য ফাঁকা!</p>
            <p className="text-sm">
              এই আবেদনে ব্যাংক অ্যাকাউন্ট নম্বর, অ্যাকাউন্টের নাম বা
              বিকাশ/নগদ (MFS) — কিছুই দেওয়া হয়নি। টাকা ছাড় হলেও পেমেন্ট
              আটকে যাবে। উপজেলা সমাজসেবা অফিসে গিয়ে পেমেন্ট তথ্য যুক্ত করতে
              হবে।
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
          <Wallet className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm">
            পেমেন্ট তথ্য দেওয়া আছে — ব্যাংক: {data.bank_name ?? "—"}, শাখা:{" "}
            {data.branch_name ?? "—"}, MFS: {data.mfs_name ?? "—"}।
          </p>
        </div>
      )}

      {/* Photos */}
      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          <IdCard className="h-5 w-5 text-brand-700 dark:text-emerald-400" /> ছবি ও স্বাক্ষর
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <PhotoCard
            title="আবেদনকারীর ছবি"
            src={proxiedImageUrl(data.image)}
            alt="আবেদনকারীর ছবি"
          />
          <PhotoCard
            title="বাড়ির ছবি"
            src={proxiedImageUrl(data.house_image)}
            alt="বাড়ির ছবি"
          />
          <PhotoCard
            title="স্বাক্ষর"
            src={proxiedImageUrl(data.signature)}
            alt="স্বাক্ষর"
          />
        </div>
      </section>

      {/* Details */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="print-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
            <Users className="h-5 w-5 text-brand-700 dark:text-emerald-400" /> ব্যক্তিগত তথ্য
          </h3>
          <InfoRow label="নাম (বাংলা)" value={data.name_bn} />
          <InfoRow label="Name (English)" value={data.name_en} />
          <InfoRow label="জন্ম তারিখ" value={data.date_of_birth} />
          <InfoRow label="বয়স" value={data.age} />
          <InfoRow
            label="বাবার নাম"
            value={
              data.father_name_bn
                ? `${data.father_name_bn} / ${data.father_name_en ?? ""}`
                : undefined
            }
          />
          <InfoRow
            label="মায়ের নাম"
            value={
              data.mother_name_bn
                ? `${data.mother_name_bn} / ${data.mother_name_en ?? ""}`
                : undefined
            }
          />
          <InfoRow label="পরিবারের সদস্য" value={data.no_of_family_members} />
        </section>

        <section className="print-card rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
            <MapPin className="h-5 w-5 text-brand-700 dark:text-emerald-400" /> ঠিকানা ও অফিস
          </h3>
          <InfoRow label="বর্তমান ঠিকানা" value={data.current_address} />
          <InfoRow label="স্থায়ী ঠিকানা" value={data.permanent_address} />
          <InfoRow label="পোস্ট কোড" value={data.current_post_code} />
          <InfoRow label="অফিস" value={officeName} />
          <InfoRow
            label="আবেদনের তারিখ"
            value={
              created
                ? created.toLocaleString("bn-BD", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : undefined
            }
          />
          <InfoRow label="প্রোগ্রাম" value={data.program?.name_bn} />
        </section>
      </div>

      {/* Actions */}
      <div className="no-print flex flex-wrap items-center gap-3">
        {data.application_id && (
          <a
            href={officialPdfUrl(String(data.application_id))}
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-800 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            অফিসিয়াল আবেদনপত্র PDF ডাউনলোড
          </a>
        )}
        <button
          onClick={saveNow}
          disabled={saved || saving}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm ring-1 transition active:scale-[0.98] ${
            saved
              ? "bg-emerald-50 text-emerald-700 ring-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800"
              : "bg-white text-stone-700 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
          } disabled:opacity-90`}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              সেভ হচ্ছে…
            </>
          ) : saved ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              ✓ সেভ করা আছে
            </>
          ) : (
            <>
              <BookmarkPlus className="h-4 w-4" />
              সেভ করুন
            </>
          )}
        </button>
        <button
          onClick={copySummary}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              কপি হয়েছে
            </>
          ) : (
            <>
              <ClipboardCopy className="h-4 w-4" />
              সারাংশ কপি করুন
            </>
          )}
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
        >
          <Printer className="h-4 w-4" />
          প্রিন্ট করুন
        </button>
        <button
          onClick={() => setShowJson((v) => !v)}
          className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 shadow-sm ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
        >
          <FileText className="h-4 w-4" />
          {showJson ? "Raw JSON লুকান" : "Raw JSON দেখুন"}
        </button>
        <span className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <Calendar className="h-3.5 w-3.5" />
          NID / মোবাইল নম্বর দেখানো হয় না — Raw JSON-এ *** দিয়ে ঢাকা আছে।
        </span>
      </div>

      {saveMessage && (
        <p
          className={`no-print rounded-xl px-4 py-3 text-sm font-medium ring-1 ${
            saved
              ? "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900"
              : "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900"
          }`}
        >
          {saveMessage}
        </p>
      )}

      {showJson && (
        <pre className="no-print max-h-96 overflow-auto rounded-2xl bg-stone-900 p-4 text-xs leading-relaxed text-emerald-100 dark:ring-1 dark:ring-stone-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      <p className="flex items-start gap-2 text-xs text-stone-500 dark:text-stone-400">
        <Home className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        তথ্য সরকারি সিস্টেম থেকে সরাসরি আনা হয়েছে। এই অ্যাপটি সরকারি
        ওয়েবসাইট নয়।
      </p>
    </div>
  );
}
