import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  FileDown,
  IdCard,
  Landmark,
  Search,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "লাইভ সার্চ",
    text: "ট্র্যাকিং নম্বর বা NID/BRN + জন্ম তারিখ দিয়ে সরকারি সিস্টেম থেকে সরাসরি তথ্য আসে — কোনো ডেমো ডেটা নয়।",
  },
  {
    icon: IdCard,
    title: "আইডি কার্ড দিয়ে খোঁজা",
    text: "NID (১০/১৭ ডিজিট) বা BRN (১৭ ডিজিট) + জন্ম তারিখ দিলেও আবেদন বের হয়।",
  },
  {
    icon: FileDown,
    title: "অফিসিয়াল PDF",
    text: "আবেদনপত্রের সরকারি ৫ পেজের PDF ডাউনলোড করুন — আবেদন আইডি বা ভেতরের ৭ ডিজিটের আইডি, দুটোই চলে।",
  },
  {
    icon: Bookmark,
    title: "সেভ করা তালিকা",
    text: "যে আবেদন একবার খুঁজবেন, সেটা আপনার অ্যাকাউন্টে সেভ থাকবে — স্ট্যাটাস, PMT স্কোর আর পেমেন্ট-ফাঁকা চিহ্নসহ।",
  },
];

const STEPS = [
  { n: "১", title: "লগইন করুন", text: "ইমেইল + পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন বা লগইন করুন। Google / Facebook দিয়েও লগইন করা যায়।" },
  { n: "২", title: "তথ্য দিয়ে সার্চ করুন", text: "ট্র্যাকিং নম্বর অথবা NID/BRN + জন্ম তারিখ দিন।" },
  { n: "৩", title: "ক্যাপচার উত্তর দিন", text: "ছবির অঙ্কের উত্তর লিখুন — প্রতিটা সার্চে নতুন ক্যাপচা লাগে।" },
  { n: "৪", title: "তথ্য দেখুন ও PDF নিন", text: "পুরো বিবরণ, ছবি, PMT স্কোর দেখুন আর অফিসিয়াল PDF ডাউনলোড করুন।" },
];

export default function HomePage() {
  return (
    <div className="space-y-10 pt-6">
      {/* Hero */}
      <section className="animate-fade-up overflow-hidden rounded-3xl bg-brand-800 text-white shadow-lg dark:bg-brand-900 dark:ring-1 dark:ring-emerald-800">
        <div className="px-6 py-10 sm:px-10 sm:py-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
            <Landmark className="h-3.5 w-3.5" />
            সরকারি Family Card — লাইভ তথ্য
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-snug sm:text-4xl">
            ফ্যামিলি কার্ডের আবেদন খুঁজুন
            <span className="text-gold-400"> এক ক্লিকে</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-emerald-100">
            ট্র্যাকিং নম্বর অথবা আইডি কার্ড (NID/BRN) + জন্ম তারিখ দিয়ে
            আবেদনের সর্বশেষ অবস্থা, PMT স্কোর, ছবি আর পেমেন্ট তথ্য দেখুন —
            সরাসরি সরকারি সিস্টেম থেকে।
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/search"
              className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 font-bold text-stone-900 shadow hover:bg-gold-400"
            >
              <Search className="h-5 w-5" />
              এখনই সার্চ করুন
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-white/10 px-6 py-3 font-bold text-white ring-1 ring-white/30 hover:bg-white/20"
            >
              অ্যাকাউন্ট খুলুন
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-emerald-200">
            <ShieldCheck className="h-4 w-4" />
            NID / মোবাইল নম্বর কোথাও দেখানো বা সংরক্ষণ করা হয় না।
          </p>
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">যা যা করতে পারবেন</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-3 font-bold text-stone-800 dark:text-stone-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8 dark:bg-stone-900 dark:ring-stone-800">
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">কীভাবে কাজ করে</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-stone-50 p-4 ring-1 ring-stone-100 dark:bg-stone-800 dark:ring-stone-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-base font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-bold text-stone-800 dark:text-stone-100">{s.title}</h3>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Honest note */}
      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/50">
        <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900 dark:text-amber-200">
          <BadgeCheck className="h-5 w-5" />
          সত্যিটা আগেই জেনে রাখুন
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/80">
          <li>এটি সরকারি ওয়েবসাইট নয় — তথ্য সরকারি সিস্টেম থেকে লাইভ আনা হয়।</li>
          <li>প্রতিটা সার্চে নতুন ক্যাপচা (অঙ্ক) সমাধান করতে হয়, তাই একসাথে অনেক আবেদন অটো-সার্চ করা যায় না।</li>
          <li>ট্র্যাকিং নম্বরই আবেদন আইডি (১০ ডিজিট)। ভেতরের ৭ ডিজিটের আইডি দিয়ে শুধু অফিসিয়াল PDF নামে, ট্র্যাকিং সার্চ হয় না।</li>
          <li>খোঁজা প্রতিটা আবেদন আপনার অ্যাকাউন্টে সেভ থাকে — সার্চের ইতিহাস থেকেও আবার এক ক্লিকে খোঁজা যায়।</li>
        </ul>
      </section>
    </div>
  );
}
