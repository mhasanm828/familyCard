"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Download,
  Eye,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

interface SavedRow {
  id: string;
  applicationId: string;
  internalId?: string | null;
  nameBn?: string | null;
  nameEn?: string | null;
  status?: string | null;
  score?: number | null;
  allowanceAmount?: number | null;
  officeName?: string | null;
  paymentBlank: boolean;
  familyMembers?: number | null;
  createdAt: string;
}

type Filter = "all" | "payment-blank" | "approved" | "pending";

export default function SavedList() {
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/saved?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "তালিকা আনতে ব্যর্থ হয়েছে");
      setRows(json.items as SavedRow[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "তালিকা আনতে ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  }, []);

  // The debounced effect below also runs on mount (q starts as ""),
  // so the first load happens there — no separate mount effect needed.
  useEffect(() => {
    const t = setTimeout(() => load(q), 400);
    return () => clearTimeout(t);
  }, [q, load]);

  async function handleDelete(id: string) {
    if (!confirm("এই আবেদনটি সেভ করা তালিকা থেকে মুছে ফেলবেন?")) return;
    setDeleting(id);
    await fetch(`/api/saved?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setRows((r) => r.filter((x) => x.id !== id));
    setDeleting(null);
  }

  const filtered = rows.filter((r) => {
    if (filter === "payment-blank") return r.paymentBlank;
    if (filter === "approved") return r.status === "2";
    if (filter === "pending") return r.status === "0";
    return true;
  });

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: `সবগুলো (${rows.length})` },
    {
      key: "payment-blank",
      label: `পেমেন্ট ফাঁকা (${rows.filter((r) => r.paymentBlank).length})`,
    },
    { key: "pending", label: "অনুমোদন হয়নি" },
    { key: "approved", label: "অনুমোদিত" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="নাম বা আবেদন আইডি দিয়ে খুঁজুন…"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                filter === c.key
                  ? "bg-brand-700 text-white"
                  : "bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-white py-16 text-stone-500 ring-1 ring-stone-200">
          <Loader2 className="h-5 w-5 animate-spin" />
          তালিকা আসছে…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-stone-200">
          <Bookmark className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-3 font-bold text-stone-700">
            {rows.length === 0
              ? "এখনো কোনো আবেদন সেভ করা হয়নি।"
              : "এই ফিল্টারে কোনো আবেদন নেই।"}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            সার্চ পেজ থেকে তথ্য খুঁজলেই সেটা এখানে অটো-সেভ হয়ে যাবে।
          </p>
          <Link
            href="/search"
            className="mt-4 inline-block rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
          >
            সার্চ করতে যান
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-stone-800">
                    {r.nameBn ?? r.nameEn ?? "—"}
                  </h3>
                  <p className="text-xs text-stone-500">{r.nameEn ?? ""}</p>
                </div>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-brand-200">
                  PMT {r.score ?? "—"}
                </span>
              </div>
              <dl className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500">আবেদন আইডি</dt>
                  <dd className="font-mono font-semibold">{r.applicationId}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500">স্ট্যাটাস</dt>
                  <dd className="font-medium">
                    {r.status === "2"
                      ? "অনুমোদিত"
                      : r.status === "0"
                        ? "গৃহীত — অনুমোদন হয়নি"
                        : r.status ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500">ভাতা</dt>
                  <dd className="font-medium">
                    {r.allowanceAmount ? `৳${r.allowanceAmount}` : "৳০"}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-stone-500">অফিস</dt>
                  <dd className="max-w-[60%] truncate text-right font-medium">
                    {r.officeName ?? "—"}
                  </dd>
                </div>
              </dl>
              {r.paymentBlank && (
                <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700 ring-1 ring-red-200">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  পেমেন্ট তথ্য ফাঁকা
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3">
                <Link
                  href={`/saved/${r.id}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-sm font-bold text-white hover:bg-brand-800"
                >
                  <Eye className="h-4 w-4" />
                  বিস্তারিত
                </Link>
                <a
                  href={`/api/pdf?application_id=${encodeURIComponent(r.applicationId)}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-stone-100 px-3 py-2 text-sm font-bold text-stone-700 hover:bg-stone-200"
                  title="অফিসিয়াল PDF"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </a>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  className="flex items-center justify-center rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
