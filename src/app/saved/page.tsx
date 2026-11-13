import { requireSession } from "@/lib/session";
import SavedList from "@/components/SavedList";

export const metadata = {
  title: "সেভ করা আবেদন — ফ্যামিলি কার্ড সার্চ",
};

export default async function SavedPage() {
  await requireSession();
  return (
    <div className="space-y-5 pt-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-800 sm:text-3xl">
          সেভ করা আবেদন
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          আপনি যেসব আবেদন খুঁজেছেন, সেগুলো এখানে জমা আছে — স্ট্যাটাস, PMT
          স্কোর আর পেমেন্ট তথ্য ফাঁকা কি না, এক নজরে দেখুন।
        </p>
      </div>
      <SavedList />
    </div>
  );
}
