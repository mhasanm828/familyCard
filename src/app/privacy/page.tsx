import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  EyeOff,
  Info,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি — ফ্যামিলি কার্ড সার্চ",
  description:
    "Family Card Search অ্যাপের গোপনীয়তা নীতি — কোন তথ্য নেওয়া হয়, কীভাবে ব্যবহার হয়, আর কীভাবে মুছে ফেলা যায়।",
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
 * /privacy — public privacy policy (no login or approval needed).
 * Required as a real URL for the Google OAuth branding / app
 * verification, and written to match how the app actually behaves.
 */
export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl pt-6">
      <div className="animate-fade-up rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10 dark:bg-stone-900 dark:ring-stone-800">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 dark:bg-emerald-950 dark:text-emerald-300">
          <ShieldCheck className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
          গোপনীয়তা নীতি
        </h1>
        <p className="mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
          Privacy Policy — Family Card Search
        </p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          শেষ হালনাগাদ: ২২ নভেম্বর ২০২৬
        </p>

        <div className="mt-8 space-y-8">
          <Section icon={Info} title="এই অ্যাপ সম্পর্কে">
            <p>
              Family Card Search (family-crd.vercel.app) কোনো সরকারি
              ওয়েবসাইট নয়। এটি একটি ব্যক্তিগত সহায়ক টুল — ব্যবহারকারী
              সার্চ করলে অ্যাপটি সরকারি সিস্টেম (fc.bhata.gov.bd) থেকে
              সরাসরি (লাইভ) আবেদনের তথ্য এনে শুধু তাকেই দেখায়।
            </p>
          </Section>

          <Section icon={UserRound} title="আমরা যেসব তথ্য সংগ্রহ করি">
            <p>
              অ্যাকাউন্ট খুলতে ও লগইন করতে শুধু আপনার নাম ও ইমেইল ঠিকানা
              নেওয়া হয়। Google বা Facebook দিয়ে লগইন করলে ওই সেবা থেকে
              আপনার নাম ও প্রোফাইল ছবিও পাওয়া যায়। এর বাইরে কোনো
              ব্যক্তিগত তথ্য চাওয়া হয় না।
            </p>
          </Section>

          <Section icon={Bookmark} title="সেভ করা আবেদন ও সার্চ ইতিহাস">
            <p>
              আপনি যেসব আবেদন খোঁজেন, সেগুলো ও আপনার সার্চের ইতিহাস
              শুধুমাত্র আপনার নিজের অ্যাকাউন্টে সংরক্ষণ করা হয় — যাতে
              পরে আবার সহজে দেখতে পারেন। অন্য কোনো ব্যবহারকারী আপনার
              সেভ করা তথ্য দেখতে পারে না।
            </p>
          </Section>

          <Section icon={EyeOff} title="NID / জন্ম নিবন্ধন নম্বর ও জন্ম তারিখ">
            <p>
              সার্চের ইতিহাসে NID বা জন্ম নিবন্ধন (BRN) নম্বর পুরোপুরি
              দেখানো হয় না এবং পুরো নম্বর সংরক্ষণও করা হয় না — শুধু
              মাস্ক করা (আংশিক লুকানো) আকারে থাকে। জন্ম তারিখ কখনোই
              সংরক্ষণ করা হয় না।
            </p>
          </Section>

          <Section icon={Lock} title="তৃতীয় পক্ষের সঙ্গে শেয়ার">
            <p>
              আপনার কোনো তথ্য বিক্রি করা হয় না এবং কোনো তৃতীয় পক্ষের
              সঙ্গে শেয়ারও করা হয় না। তথ্য শুধু এই অ্যাপটি চালানোর
              জন্যই ব্যবহার হয়।
            </p>
          </Section>

          <Section icon={Trash2} title="আপনার তথ্য মুছে ফেলা">
            <p>
              আপনি চাইলে যেকোনো সময় আপনার অ্যাকাউন্ট ও সব সংরক্ষিত তথ্য
              মুছে ফেলার অনুরোধ করতে পারেন। নিচের ইমেইলে যোগাযোগ করলেই
              আপনার অ্যাকাউন্ট ও ডেটা মুছে দেওয়া হবে।
            </p>
          </Section>

          <Section icon={Mail} title="যোগাযোগ">
            <p>
              গোপনীয়তা নিয়ে কোনো প্রশ্ন থাকলে বা তথ্য মুছে ফেলতে চাইলে
              ইমেইল করুন:{" "}
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
