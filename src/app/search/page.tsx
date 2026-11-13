import { requireSession } from "@/lib/session";
import SearchForm from "@/components/SearchForm";

export const metadata = {
  title: "সার্চ — ফ্যামিলি কার্ড সার্চ",
};

export default async function SearchPage() {
  await requireSession();
  return (
    <div className="space-y-5 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 sm:text-3xl">
          আবেদন খুঁজুন
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          ট্র্যাকিং নম্বর অথবা আইডি কার্ড (NID/BRN) + জন্ম তারিখ দিয়ে সরকারি
          API থেকে লাইভ তথ্য আনুন। সফল সার্চ আপনার অ্যাকাউন্টে অটো-সেভ হবে।
        </p>
      </div>
      <SearchForm />
    </div>
  );
}
