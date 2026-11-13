import Link from "next/link";
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  FileDown,
  History,
  IdCard,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { requireApproved } from "@/lib/access";
import { COLLECTIONS, getDb, toPlain } from "@/lib/db";

export const metadata = {
  title: "আমার প্রোফাইল — ফ্যামিলি কার্ড সার্চ",
};

const MODE_LABEL: Record<string, string> = {
  tracking: "ট্র্যাকিং সার্চ",
  idcard: "আইডি কার্ড সার্চ",
  idpdf: "আইডি PDF",
};

function StatCard({
  value,
  label,
  sub,
}: {
  value: number | string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="animate-fade-up rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
      <p className="text-3xl font-bold text-brand-700 dark:text-emerald-400">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </p>
      {sub ? (
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{sub}</p>
      ) : null}
    </div>
  );
}

export default async function ProfilePage() {
  const { session } = await requireApproved();
  const userId = session.user.id;
  const db = getDb();

  const [
    totalSearches,
    foundCount,
    notFoundCount,
    errorCount,
    pdfCount,
    byMode,
    savedCount,
    recent,
  ] = await Promise.all([
    db.collection(COLLECTIONS.searchHistory).countDocuments({ userId }),
    db
      .collection(COLLECTIONS.searchHistory)
      .countDocuments({ userId, result: "found" }),
    db
      .collection(COLLECTIONS.searchHistory)
      .countDocuments({ userId, result: "not_found" }),
    db
      .collection(COLLECTIONS.searchHistory)
      .countDocuments({ userId, result: "error" }),
    db
      .collection(COLLECTIONS.searchHistory)
      .countDocuments({ userId, result: "pdf" }),
    db
      .collection(COLLECTIONS.searchHistory)
      .aggregate([
        { $match: { userId } },
        { $group: { _id: "$mode", count: { $sum: 1 } } },
      ])
      .toArray(),
    db
      .collection(COLLECTIONS.savedApplications)
      .countDocuments({ userId }),
    db
      .collection(COLLECTIONS.searchHistory)
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray(),
  ]);

  const modeCounts: Record<string, number> = { tracking: 0, idcard: 0, idpdf: 0 };
  for (const row of byMode as { _id?: string; count?: number }[]) {
    if (row._id) modeCounts[row._id] = row.count ?? 0;
  }
  const recentPlain = recent.map(
    (r) =>
      toPlain(r) as unknown as {
        id: string;
        mode: string;
        queryLabel: string;
        found: boolean;
        result?: string;
        createdAt: string;
      },
  );

  const memberSince = new Date(session.user.createdAt).toLocaleDateString(
    "bn-BD",
    { dateStyle: "long" },
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-6">
      {/* Identity */}
      <section className="animate-fade-up rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300">
            <User className="h-8 w-8" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-stone-800 dark:text-stone-100">
              {session.user.name}
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {session.user.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Calendar className="h-4 w-4" />
              সদস্য যেদিন থেকে: {memberSince}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow transition hover:bg-brand-800 active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            নতুন সার্চ
          </Link>
          <Link
            href="/saved"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 transition hover:bg-stone-50 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
          >
            <Bookmark className="h-4 w-4" />
            সেভ করা আবেদন
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 transition hover:bg-stone-50 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
          >
            <User className="h-4 w-4" />
            অ্যাকাউন্ট সেটিংস
          </Link>
        </div>
      </section>

      {/* Live stats */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-stone-800 dark:text-stone-100">
          আমার সার্চের হিসাব
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard value={totalSearches} label="মোট সার্চ" sub="সব ধরন মিলিয়ে" />
          <StatCard value={foundCount} label="পাওয়া গেছে" sub="ট্র্যাকিং / NID সার্চ" />
          <StatCard value={pdfCount} label="PDF নেওয়া হয়েছে" sub="আইডি PDF মোড" />
          <StatCard value={notFoundCount} label="পাওয়া যায়নি" sub="কোনো রেকর্ড মেলেনি" />
          <StatCard value={errorCount} label="সমস্যা হয়েছে" sub="সার্ভার / ক্যাপচা ভুল" />
          <StatCard value={savedCount} label="সেভ করা আবেদন" sub="আপনার তালিকায় আছে" />
        </div>
      </section>

      {/* Searches by type */}
      <section className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">
          কোন ধরনে কয়টা সার্চ
        </h2>
        <ul className="mt-4 space-y-3">
          {(
            [
              { key: "tracking", icon: Search, hint: "১০ ডিজিটের ট্র্যাকিং নম্বর" },
              { key: "idcard", icon: IdCard, hint: "NID/BRN + জন্ম তারিখ" },
              { key: "idpdf", icon: FileDown, hint: "৭ বা ১০ ডিজিটের আইডি দিয়ে PDF" },
            ] as const
          ).map(({ key, icon: Icon, hint }) => {
            const count = modeCounts[key] ?? 0;
            const pct =
              totalSearches > 0 ? Math.round((count / totalSearches) * 100) : 0;
            return (
              <li key={key}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 font-medium text-stone-700 dark:text-stone-200">
                    <Icon className="h-4 w-4 text-brand-700 dark:text-emerald-400" />
                    {MODE_LABEL[key]}
                    <span className="font-normal text-stone-500 dark:text-stone-400">
                      ({hint})
                    </span>
                  </span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">
                    {count} টি • {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500 dark:bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {totalSearches === 0 && (
          <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
            এখনো কোনো সার্চ করেননি — প্রথম সার্চটি করলেই এখানে হিসাব জমা
            হতে থাকবে।
          </p>
        )}
      </section>

      {/* Recent searches */}
      <section className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          <History className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
          সাম্প্রতিক সার্চ (সর্বশেষ {recentPlain.length}টি)
        </h2>
        {recentPlain.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            এখনো কোনো সার্চের রেকর্ড নেই।
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recentPlain.map((item) => (
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
                    <XCircle className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                    {item.queryLabel}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {MODE_LABEL[item.mode] ?? item.mode} •{" "}
                    {item.result === "pdf"
                      ? "PDF পাওয়া গেছে"
                      : item.found
                        ? "পাওয়া গেছে"
                        : item.result === "error"
                          ? "সমস্যা হয়েছে"
                          : "পাওয়া যায়নি"}{" "}
                    •{" "}
                    {new Date(item.createdAt).toLocaleString("bn-BD", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          এখানে NID নম্বর কখনো দেখানো হয় না — শুধু ট্র্যাকিং নম্বর বা মাস্ক
          করা লেবেল থাকে।
        </p>
      </section>
    </div>
  );
}
