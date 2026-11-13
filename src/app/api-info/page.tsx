import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  IdCard,
  Landmark,
  Search,
  XCircle,
} from "lucide-react";

const SEARCH_OPTIONS = [
  {
    icon: Search,
    title: "ট্র্যাকিং নম্বর দিয়ে",
    ok: true,
    text: "১০ ডিজিটের আবেদন আইডি (১–৯ দিয়ে শুরু)। এটাই ট্র্যাকিং নম্বর — দুটো একই জিনিস।",
    endpoint: "POST /global/applicants_tracking — tracking_type=2, tracking_no=<১০ ডিজিট>",
  },
  {
    icon: IdCard,
    title: "আইডি কার্ড (NID/BRN) + জন্ম তারিখ দিয়ে",
    ok: true,
    text: "NID ১০ বা ১৭ ডিজিট, অথবা BRN ১৭ ডিজিট + জন্ম তারিখ (YYYY-MM-DD)। ট্র্যাকিং নম্বর না জানলেও এভাবে আবেদন খোঁজা যায়।",
    endpoint: "POST /global/applicants_tracking — tracking_type=1, nid=<NID/BRN>, date_of_birth=<YYYY-MM-DD>",
  },
  {
    icon: FileDown,
    title: "ভেতরের আইডি (৭ ডিজিট) — শুধু PDF-এর জন্য",
    ok: true,
    text: "API-র JSON-এ থাকা ভেতরের ৭ ডিজিটের id দিয়ে ট্র্যাকিং সার্চ হয় না — সার্ভার খালি উত্তর দেয়। কিন্তু অফিসিয়াল PDF নামাতে এই আইডিও চলে, আবেদন আইডিও চলে।",
    endpoint: "GET /global/applicants_copy?application_id=<৭ বা ১০ ডিজিট>&lang=bn",
  },
];

const ALSO_EXISTS = [
  {
    title: "NID যাচাই (card-verification)",
    text: "NID + জন্ম তারিখ + নাম মিলিয়ে কার্ডটা আসল কি না, বয়স কত — এটা আবেদন করার সময়ের যাচাই। এটা দিয়ে আবেদন খোঁজা যায় না।",
  },
  {
    title: "ডুপ্লিকেট যাচাই",
    text: "একই NID বা একই ব্যাংক/MFS অ্যাকাউন্ট আগে Family Card-এ ব্যবহার হয়েছে কি না — check-duplicate-family-id / check-duplicate-account।",
  },
  {
    title: "প্রতিবন্ধী কার্ড যাচাই (DIS)",
    text: "প্রতিবন্ধী পরিচয়পত্র নম্বর + জন্ম তারিখ মেলানো হয় — dis-card-verification।",
  },
  {
    title: "অভিযোগ ট্র্যাকিং",
    text: "অভিযোগের অবস্থা দেখার আলাদা পাতা আছে — /grievance-tracking।",
  },
];

export default function ApiInfoPage() {
  return (
    <div className="space-y-8 pt-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-stone-800 sm:text-3xl">
          <Landmark className="h-7 w-7 text-brand-700" />
          API তথ্য — কী দিয়ে সার্চ যায়, কী দিয়ে যায় না
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
          এই অ্যাপটি সরকারি সাইট fc.bhata.gov.bd-এর আসল API ব্যবহার করে।
          নিচের সব তথ্য সাইটের JavaScript কোড পড়ে যাচাই করা (নভেম্বর ২০২৬)।
        </p>
      </div>

      <section className="space-y-4">
        {SEARCH_OPTIONS.map(({ icon: Icon, title, text, endpoint }) => (
          <article
            key={title}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6"
          >
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800">
              <Icon className="h-5 w-5 text-brand-700" />
              {title}
              <span className="ml-auto flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                চলে
              </span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{text}</p>
            <code className="mt-3 block overflow-x-auto rounded-xl bg-stone-900 px-4 py-2.5 text-xs text-emerald-100">
              {endpoint}
            </code>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-red-800">
          <XCircle className="h-5 w-5" />
          যা চলে না
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-red-900/90">
          <li>
            <strong>নাম বা মোবাইল নম্বর দিয়ে সার্চ</strong> — এমন কোনো API
            নেই।
          </li>
          <li>
            <strong>ভেতরের ৭ ডিজিটের আইডি দিয়ে ট্র্যাকিং সার্চ</strong> — সার্ভার
            সফল বললেও ডেটা দেয় না।
          </li>
          <li>
            <strong>একসাথে অনেক আবেদন অটো-সার্চ (bulk)</strong> — প্রতিটা
            সার্চে নতুন ক্যাপচা (অঙ্ক) সমাধান করতে হয়, তাই পুরোপুরি
            অটোমেটিক সংগ্রহ সম্ভব নয়।
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-stone-800">
          আরও যেসব API আছে (সার্চ নয়, যাচাইয়ের কাজে)
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ALSO_EXISTS.map((a) => (
            <article
              key={a.title}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"
            >
              <h3 className="font-bold text-stone-800">{a.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                {a.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900">
          <AlertTriangle className="h-5 w-5" />
          ক্যাপচা সম্পর্কে
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
          প্রতিটা সার্চের আগে সরকারি API থেকে একটি অঙ্কের ক্যাপচা আনতে হয়
          (GET /captcha) — সেই অঙ্কের উত্তর আর টোকেন ছাড়া সার্চ হয় না।
          ক্যাপচা একবার ব্যবহারের পর বাতিল হয়ে যায়, তাই প্রতিটা সার্চে
          নতুন ক্যাপচা লাগে।
        </p>
        <Link
          href="/search"
          className="mt-4 inline-block rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800"
        >
          সার্চ করতে যান
        </Link>
      </section>
    </div>
  );
}
