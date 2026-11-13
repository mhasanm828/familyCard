# ফ্যামিলি কার্ড সার্চ — Family Card Search

Next.js (App Router, TypeScript) + **Better Auth** অ্যাপ — সরকারি ফ্যামিলি
কার্ড API (`fc.bhata.gov.bd`) থেকে লাইভ আবেদন খোঁজার জন্য।

> ⚠️ **এটি সরকারি ওয়েবসাইট নয়।** এই অ্যাপটি সরকারি API থেকে সরাসরি তথ্য
> দেখায়। NID / মোবাইল নম্বর কোথাও দেখানো বা সংরক্ষণ করা হয় না।

## যা যা আছে

- **Better Auth লগইন** — ইমেইল + পাসওয়ার্ডে সাইন আপ / সাইন ইন। সার্চ ও
  সেভ করা তালিকা লগইন ছাড়া খোলে না।
- **লাইভ সার্চ (২ ভাবে)** — (১) ট্র্যাকিং নম্বর (১০ ডিজিটের আবেদন আইডি),
  (২) আইডি কার্ড NID (১০/১৭ ডিজিট) বা BRN (১৭ ডিজিট) + জন্ম তারিখ।
  প্রতিটা সার্চে সরকারি API-র আসল অঙ্কের ক্যাপচা সমাধান করতে হয়।
- **পুরো ফলাফল** — নাম, স্ট্যাটাস, PMT স্কোর, ভাতা, ঠিকানা, অফিস,
  আবেদনকারী/বাড়ি/স্বাক্ষরের ছবি, পেমেন্ট তথ্য ফাঁকা থাকলে লাল সতর্কবার্তা।
- **অফিসিয়াল PDF** — আবেদনপত্রের সরকারি ৫ পেজের PDF ডাউনলোড। আবেদন আইডি
  (১০ ডিজিট) বা ভেতরের আইডি (৭ ডিজিট) — দুটোই চলে।
- **সেভ করা আবেদন** — সফল প্রতিটা সার্চ লগইন করা ইউজারের অ্যাকাউন্টে
  ডেটাবেসে সেভ হয় (NID/মোবাইল ছাড়া)। ড্যাশবোর্ডে স্ট্যাটাস, PMT স্কোর,
  পেমেন্ট-ফাঁকা ব্যাজ, খোঁজা/ফিল্টার, বিস্তারিত দেখা ও মুছে ফেলা যায়।
- **API তথ্য পাতা** — কী দিয়ে সার্চ যায়, কী দিয়ে যায় না — সত্যটা লেখা
  আছে।

## লোকাল সেটআপ

```bash
npm install
cp .env.example .env
# .env-এ BETTER_AUTH_SECRET-এ লম্বা র‍্যান্ডম সিক্রেট দিন, যেমন:
# openssl rand -base64 32
npx prisma migrate dev
npm run dev
# http://localhost:3000
```

> **নোট (Prisma ইঞ্জিন):** `prisma generate` / `migrate` চালাতে schema-engine
> বাইনারি ডাউনলোড লাগে। নেটওয়ার্ক সমস্যা হলে এভাবে চালান:
>
> ```bash
> export PRISMA_SCHEMA_ENGINE_BINARY="$HOME/.cache/prisma/all_commits/<commit>/debian-openssl-3.0.x/schema-engine"
> ```
>
> (Vercel-এ এই সমস্যা হয় না — সেখানে বিল্ডের সময় ইঞ্জিন ঠিকমতো নামে।)

## Vercel-এ ডিপ্লয়

1. এই রিপো GitHub-এ পুশ করুন।
2. Vercel Dashboard → **Add New → Project** → রিপো ইমপোর্ট করুন।
3. **Environment Variables**-এ এগুলো দিন:
   - `BETTER_AUTH_SECRET` — লম্বা র‍্যান্ডম সিক্রেট
   - `BETTER_AUTH_URL` — `https://<আপনার-ডোমেইন>` (যেমন
     `https://family-card-search.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` — উপরের একই URL
   - `DATABASE_URL` — Postgres কানেকশন স্ট্রিং (Neon / Supabase)।
     **সাথে** `prisma/schema.prisma`-এ provider `sqlite` থেকে
     `postgresql`-এ বদলাতে হবে, আর `src/lib/prisma.ts` অটোমেটিক pg
     অ্যাডাপ্টার ব্যবহার করবে।
4. Deploy করুন। প্রথম ডিপ্লয়ের পর ডেটাবেসে টেবিল বানাতে একবার চালান:
   `npx prisma migrate deploy` (DATABASE_URL সেট করে)।

## API চুক্তি (যাচাই করা)

সরকারি সাইটের JavaScript পড়ে ও লাইভ কল করে যাচাই করা (নভেম্বর ২০২৬):

| কাজ | এন্ডপয়েন্ট |
| --- | --- |
| ক্যাপচা | `GET https://familycard-api.bhata.gov.bd/api/v1/captcha` |
| ট্র্যাকিং সার্চ | `POST https://familycard-api.bhata.gov.bd/api/v1/global/applicants_tracking` (multipart/form-data: `captcha_token`, `captcha_value` (সংখ্যা), `tracking_type`, `tracking_no`, `nid`, `date_of_birth`) |
| ছবি | `GET https://familycard-api.bhata.gov.bd/cloud/<path>` |
| অফিসিয়াল PDF | `GET https://familycard-api.bhata.gov.bd/api/v1/global/applicants_copy?application_id=<id>&lang=bn` |

- `tracking_type=2` → ট্র্যাকিং নম্বর (ঠিক ১০ ডিজিট, ১–৯ দিয়ে শুরু)।
- `tracking_type=1` → NID/BRN + জন্ম তারিখ।
- রেকর্ড না মিললে API দেয় `{ status: true, data: null }`।
- ভেতরের ৭ ডিজিটের আইডি দিয়ে ট্র্যাকিং সার্চ হয় না — শুধু PDF নামে।
- প্রতিটা সার্চে নতুন ক্যাপচা লাগে, তাই bulk অটো-সংগ্রহ সম্ভব নয়।

## প্রজেক্ট কাঠামো

```
src/
  app/
    page.tsx              হোম / হিরো
    signin/ signup/       Better Auth পাতা
    search/               সার্চ পাতা (লগইন আবশ্যক)
    saved/                সেভ করা তালিকা + [id] বিস্তারিত
    account/              অ্যাকাউন্ট পাতা
    api-info/             API তথ্য পাতা
    api/
      auth/[...all]/      Better Auth হ্যান্ডলার
      captcha/            সরকারি ক্যাপচা প্রক্সি
      search/             ট্র্যাকিং সার্চ + অটো-সেভ
      image/              ছবি প্রক্সি
      pdf/                অফিসিয়াল PDF প্রক্সি
      saved/              সেভ করা তালিকার API
  components/             Header, SearchForm, ResultView, SavedList
  lib/
    auth.ts               Better Auth কনফিগ
    auth-client.ts        Better Auth React ক্লায়েন্ট
    prisma.ts             PrismaClient (SQLite / Postgres অ্যাডাপ্টার)
    familycard.ts         সরকারি API ক্লায়েন্ট + NID/মোবাইল মাস্কিং
    session.ts            সার্ভার-সাইড লগইন গার্ড
prisma/
  schema.prisma           User/Session/Account/Verification + SavedApplication
  migrations/             SQLite মাইগ্রেশন
```

## গোপনীয়তা

- NID / ভেরিফিকেশন নম্বর ও মোবাইল নম্বর UI-তে, লগে, ডেটাবেসে, টেস্টে বা
  README-তে কোথাও রাখা হয় না। Raw JSON দেখালেও সেগুলো `***` দিয়ে ঢাকা
  থাকে।
- OTP / PIN কখনো চাওয়া হয় না, কারো সাথে শেয়ার করবেন না।
