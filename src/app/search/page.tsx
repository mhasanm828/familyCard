import { requireApproved } from "@/lib/access";
import SearchForm from "@/components/SearchForm";

export const metadata = {
  title: "সার্চ — ফ্যামিলি কার্ড সার্চ",
};

export default async function SearchPage() {
  await requireApproved();
  return (
    <div className="space-y-5 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
          আবেদন খুঁজুন
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          ট্র্যাকিং নম্বর, আইডি কার্ড (NID/BRN) + জন্ম তারিখ, অথবা শুধু
          আবেদন আইডি দিয়ে সরকারি সিস্টেম থেকে লাইভ তথ্য আনুন। সফল সার্চ
          আপনার অ্যাকাউন্টে অটো-সেভ হবে — আর প্রতিটা সার্চের হিসাব আপনার
          প্রোফাইলে জমা থাকবে।
        </p>
      </div>
      <SearchForm />
    </div>
  );
}
