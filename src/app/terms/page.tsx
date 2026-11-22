import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Ban,
  FileText,
  Info,
  Mail,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলি — ফ্যামিলি কার্ড সার্চ",
  description:
    "Family Card Search অ্যাপ ব্যবহারের শর্তাবলি — সেবাটি কীভাবে দেওয়া হয় ও ব্যবহারের নিয়ম।",
};

const SUPPORT_EMAIL = "mhasanm828@gmail.com";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="mt-2 space-y-2 pl-10 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        {children}
      </div>
    </section>
  );
}

/**
 * /terms — public terms of service (no login or approval needed).
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl pt-6">
      <div className="animate-fade-up rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10 dark:bg-stone-900 dark:ring-stone-800">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-emerald-950 dark:text-emerald-300">
          <FileText className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
          ব্যবহারের শর্তাবলি
        </h1>
        <p className="mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
          Terms of Service — Family Card Search
        </p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          শেষ হালনাগাদ: ২২ নভেম্বর ২০২৬
        </p>

        <div className="mt-8 space-y-8">
          <Section icon={Info} title="সেবা সম্পর্কে">
            <p>
              Family Card Search একটি ব্যক্তিগত সহায়ক টুল — এটি কোনো
              সরকারি ওয়েবসাইট নয়। সেবাটি ব্যক্তিগত ব্যবহারের জন্য
              &quot;যেমন আছে&quot; ভিত্তিতে দেওয়া হয়, কোনো ধরনের
              গ্যারান্টি ছাড়া।
            </p>
            <p>
              এখানে দেখানো সব তথ্য সরকারি সিস্টেম (fc.bhata.gov.bd)
              থেকে সরাসরি আসে। ওই সিস্টেমের তথ্য বদলালে বা সিস্টেমে
              পরিবর্তন এলে এখানকার তথ্যেও পার্থক্য দেখা যেতে পারে।
              কোনো সিদ্ধান্ত নেওয়ার আগে সরকারি সিস্টেম বা সংশ্লিষ্ট
              অফিস থেকে তথ্য যাচাই করে নিন।
            </p>
          </Section>

          <Section icon={UserCheck} title="অ্যাকাউন্ট ও অনুমোদন">
            <p>
              সেবাটি ব্যবহার করতে অ্যাকাউন্ট খুলতে হয় এবং প্রতিটি নতুন
              অ্যাকাউন্টে অ্যাডমিনের অনুমোদন লাগে। অনুমোদন ছাড়া সার্চ
              বা অন্যান্য সুবিধা ব্যবহার করা যায় না। নিজের অ্যাকাউন্টের
              লগইন তথ্য গোপন রাখার দায়িত্ব আপনার নিজের।
            </p>
          </Section>

          <Section icon={Ban} title="যা করা যাবে না">
            <p>
              এই সেবা দিয়ে একসঙ্গে অনেক তথ্য সংগ্রহ (বাল্ক সার্চ) বা
              স্বয়ংক্রিয় পদ্ধতিতে তথ্য টানা (অটোমেটেড স্ক্র্যাপিং)
              সম্পূর্ণ নিষেধ। অন্যের ব্যক্তিগত তথ্য অননুমোদিতভাবে
              খোঁজাও নিষেধ। এসব করলে অ্যাকাউন্ট বন্ধ করে দেওয়া হতে
              পারে।
            </p>
          </Section>

          <Section icon={Mail} title="যোগাযোগ">
            <p>
              শর্তাবলি নিয়ে কোনো প্রশ্ন থাকলে ইমেইল করুন:{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-brand-700 hover:underline dark:text-emerald-400"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
