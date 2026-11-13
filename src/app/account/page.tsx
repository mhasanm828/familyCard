import Link from "next/link";
import { Bookmark, Calendar, Mail, User } from "lucide-react";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";

export const metadata = {
  title: "আমার অ্যাকাউন্ট — ফ্যামিলি কার্ড সার্চ",
};

export default async function AccountPage() {
  const session = await requireSession();
  const savedCount = await prisma.savedApplication.count({
    where: { userId: session.user.id },
  });
  const paymentBlankCount = await prisma.savedApplication.count({
    where: { userId: session.user.id, paymentBlank: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5 pt-6">
      <h1 className="text-2xl font-bold text-stone-800 sm:text-3xl">
        আমার অ্যাকাউন্ট
      </h1>
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <User className="h-7 w-7" />
          </span>
          <div>
            <p className="text-xl font-bold text-stone-800">
              {session.user.name}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-stone-500">
              <Mail className="h-4 w-4" />
              {session.user.email}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-stone-500">
              <Calendar className="h-4 w-4" />
              অ্যাকাউন্ট খোলা:{" "}
              {new Date(session.user.createdAt).toLocaleDateString("bn-BD", {
                dateStyle: "long",
              })}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-stone-50 p-4 text-center ring-1 ring-stone-100">
            <p className="text-2xl font-bold text-brand-700">{savedCount}</p>
            <p className="text-sm text-stone-500">সেভ করা আবেদন</p>
          </div>
          <div className="rounded-xl bg-red-50 p-4 text-center ring-1 ring-red-100">
            <p className="text-2xl font-bold text-red-600">
              {paymentBlankCount}
            </p>
            <p className="text-sm text-stone-500">পেমেন্ট তথ্য ফাঁকা</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/saved"
            className="flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"
          >
            <Bookmark className="h-4 w-4" />
            সেভ করা আবেদন দেখুন
          </Link>
          <SignOutButton />
        </div>
      </section>
      <p className="text-xs leading-relaxed text-stone-500">
        আপনার সেভ করা আবেদনগুলোতে NID / মোবাইল নম্বর সংরক্ষণ করা হয় না —
        শুধু সরকারি API থেকে পাওয়া সাধারণ তথ্যই থাকে।
      </p>
    </div>
  );
}
