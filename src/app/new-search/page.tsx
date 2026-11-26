import PublicSearchForm from "@/components/PublicSearchForm";

export const metadata = {
  title: "নতুন সার্চ — ফ্যামিলি কার্ড সার্চ",
};

/**
 * /new-search — public, no login required.
 * Application-ID (10-digit tracking number) search only, behind the
 * government captcha. Nothing is saved, no history is recorded.
 * NID/BRN search and the 7-digit internal id stay on the logged-in
 * /search page behind admin approval.
 */
export default function NewSearchPage() {
  return (
    <div className="space-y-5 pt-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
          নতুন সার্চ — লগইন ছাড়াই
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          আবেদন আইডি (১০ ডিজিটের ট্র্যাকিং নম্বর) দিয়ে সরকারি সিস্টেম
          থেকে লাইভ তথ্য আনুন — অ্যাকাউন্ট লাগবে না, ফলাফল সেভও হয় না।
        </p>
      </div>
      <PublicSearchForm />
    </div>
  );
}
