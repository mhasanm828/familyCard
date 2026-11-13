import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hourglass, RefreshCw } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserAccess } from "@/lib/access";
import SignOutButton from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "অনুমোদনের অপেক্ষায় — ফ্যামিলি কার্ড সার্চ",
};

/**
 * /pending — what a logged-in but NOT YET approved user sees instead
 * of search / saved / profile. Approved users are sent to /profile,
 * logged-out visitors to /signin.
 */
export default async function PendingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");
  const { access } = await getUserAccess(session.user.id);
  if (access.approved) redirect("/profile");

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className="animate-fade-up rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          <Hourglass className="h-8 w-8" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-800 dark:text-stone-100">
          অ্যাডমিনের অনুমোদনের অপেক্ষায় আছেন
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          আপনার অ্যাকাউন্টটি খোলা হয়েছে — {session.user.email} — কিন্তু
          সার্চ, সেভ করা আবেদন আর প্রোফাইল ব্যবহার করতে অ্যাডমিনের অনুমোদন
          লাগবে। অ্যাডমিন অনুমোদন দিলেই আপনি সবকিছু ব্যবহার করতে পারবেন।
        </p>
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          অনুমোদন পেয়েছেন কি না দেখতে নিচের বাটনে চাপ দিন।
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/profile"
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-bold text-white hover:bg-brand-800"
          >
            <RefreshCw className="h-4 w-4" />
            আবার দেখুন
          </Link>
          <SignOutButton />
        </div>
        <p className="mt-5 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
          এটি একটি নিরাপত্তা ব্যবস্থা — শুধু অনুমোদিত অ্যাকাউন্টই সরকারি
          সিস্টেম থেকে তথ্য খুঁজতে পারে।
        </p>
      </div>
    </div>
  );
}
