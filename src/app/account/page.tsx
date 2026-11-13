import Link from "next/link";
import { Bookmark, Calendar, History, Mail, Search, User } from "lucide-react";
import { requireApproved } from "@/lib/access";
import { COLLECTIONS, getDb } from "@/lib/db";
import SignOutButton from "@/components/SignOutButton";

export const metadata = {
  title: "আমার অ্যাকাউন্ট — ফ্যামিলি কার্ড সার্চ",
};

export default async function AccountPage() {
  const { session } = await requireApproved();
  const db = getDb();
  const [savedCount, paymentBlankCount, historyCount] = await Promise.all([
    db
      .collection(COLLECTIONS.savedApplications)
      .countDocuments({ userId: session.user.id }),
    db
      .collection(COLLECTIONS.savedApplications)
      .countDocuments({ userId: session.user.id, paymentBlank: true }),
    db
      .collection(COLLECTIONS.searchHistory)
      .countDocuments({ userId: session.user.id }),
  ]);

  return (
    <div className="animate-fade-up mx-auto max-w-2xl space-y-5 pt-6">
      <h1 className="font-display text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
        আমার অ্যাকাউন্ট
      </h1>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300">
            <User className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xl font-bold text-stone-800 dark:text-stone-100">
              {session.user.name}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Mail className="h-4 w-4" />
              {session.user.email}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Calendar className="h-4 w-4" />
              অ্যাকাউন্ট খোলা:{" "}
              {new Date(session.user.createdAt).toLocaleDateString("bn-BD", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-stone-50 p-4 text-center ring-1 ring-stone-100 dark:bg-stone-800 dark:ring-stone-700">
            <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400">{savedCount}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">সেভ করা আবেদন</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4 text-center ring-1 ring-red-100 dark:bg-red-950/50 dark:ring-red-900">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {paymentBlankCount}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400">পেমেন্ট তথ্য ফাঁকা</p>
          </div>
          <div className="rounded-xl bg-stone-50 p-4 text-center ring-1 ring-stone-100 dark:bg-stone-800 dark:ring-stone-700">
            <p className="text-2xl font-bold text-brand-700 dark:text-emerald-400">{historyCount}</p>
            <p className="flex items-center justify-center gap-1 text-sm text-stone-500 dark:text-stone-400">
              <History className="h-3.5 w-3.5" />
              মোট সার্চ
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
          >
            <User className="h-4 w-4" />
            আমার প্রোফাইল দেখুন
          </Link>
          <Link
            href="/saved"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
          >
            <Bookmark className="h-4 w-4" />
            সেভ করা আবেদন দেখুন
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-700"
          >
            <Search className="h-4 w-4" />
            নতুন সার্চ
          </Link>
          <SignOutButton />
        </div>
      </section>
      <p className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">
        আপনার সেভ করা আবেদনগুলোতে NID / মোবাইল নম্বর সংরক্ষণ করা হয় না —
        শুধু সরকারি সিস্টেম থেকে পাওয়া সাধারণ তথ্যই থাকে।
      </p>
    </div>
  );
}
