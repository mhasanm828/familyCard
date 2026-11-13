import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireSession } from "@/lib/session";
import { COLLECTIONS, getDb, ObjectId } from "@/lib/db";
import ResultView from "@/components/ResultView";
import type { ApplicantData } from "@/lib/familycard";

export const metadata = {
  title: "আবেদনের বিস্তারিত — ফ্যামিলি কার্ড সার্চ",
};

export default async function SavedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  if (!ObjectId.isValid(id)) notFound();
  const row = await getDb()
    .collection(COLLECTIONS.savedApplications)
    .findOne({ _id: new ObjectId(id), userId: session.user.id });
  if (!row) notFound();

  let data: ApplicantData;
  try {
    data = JSON.parse(row.rawJson) as ApplicantData;
  } catch {
    notFound();
  }

  return (
    <div className="space-y-5 pt-6">
      <Link
        href="/saved"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-700 hover:underline dark:text-emerald-400"
      >
        <ArrowLeft className="h-4 w-4" />
        সেভ করা তালিকায় ফিরুন
      </Link>
      <ResultView data={data} initialSaved />
    </div>
  );
}
