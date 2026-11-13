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

## ডেটাবেস — MongoDB Atlas (ফ্রি)

অ্যাপটি MongoDB ব্যবহার করে (Prisma + Better Auth Prisma অ্যাডাপ্টার,
provider `mongodb`)। কোনো Postgres/SQLite দরকার নেই।

### Atlas ফ্রি ক্লাস্টার বানানো

1. [cloud.mongodb.com](https://cloud.mongodb.com)-এ অ্যাকাউন্ট খুলুন
   (ফ্রি M0 ক্লাস্টার)।
2. **Build a Database** → **M0 Free** → ক্লাস্টার বানান (নাম যা খুশি,
   যেমন `familycard`)।
3. **Database Access** → **Add New Database User** → ইউজারনেম/পাসওয়ার্ড
   দিন (পাসওয়ার্ড নিরাপদে রাখুন) → **Built-in Role: Atlas Admin** বা
   **Read and write to any database**।
4. **Network Access** → **Add IP Address** → **Allow Access from
   Anywhere (`0.0.0.0/0`)** — Vercel-এর IP বদলায়, তাই এটা লাগবে।
5. ক্লাস্টারের **Connect** → **Drivers** → কানেকশন স্ট্রিং কপি করুন:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/familycard?retryWrites=true&w=majority`
   — `<username>` / `<password>` / `<cluster>`-এর জায়গায় নিজেরটা বসান।
   এই স্ট্রিংটাই `.env` ও Vercel-এর `DATABASE_URL`।
6. প্রথমবার স্কিমা চালু করতে (লোকাল বা যেকোনো জায়গা থেকে, `DATABASE_URL`
   সেট করে): `npx prisma db push` — MongoDB-তে মাইগ্রেশন চলে না, `db push`
   দিয়েই কালেকশন/ইনডেক্স তৈরি হয়।

লোকাল ডেভেও একই Atlas স্ট্রিং ব্যবহার করা যায়, অথবা লোকাল `mongod`
চালিয়ে `DATABASE_URL="mongodb://localhost:27017/familycard"` দিন।
লোকাল `mongod`-এর ক্ষেত্রে একটা জরুরি কথা: Better Auth ইউজার বানানোর
সময় ট্রানজাকশন ব্যবহার করে, আর MongoDB-তে ট্রানজাকশন চলে শুধু
replica set-এ। তাই লোকাল `mongod` চালাতে হবে single-node replica set
হিসেবে: `mongod --replSet rs0` দিয়ে চালিয়ে `rs.initiate()` করুন, আর
`DATABASE_URL`-এ `?replicaSet=rs0` যোগ করুন। Atlas-এ এটা আগে থেকেই
replica set, তাই সেখানে কিছু করতে হয় না।

> **নোট (Prisma সংস্করণ):** MongoDB-র জন্য Prisma 7 চলে না — Prisma-র
> নিজের ডকুমেন্টেশন অনুযায়ী MongoDB প্রজেক্ট Prisma 6.19-এ থাকতে হয়।
> তাই এই প্রজেক্টে `prisma` ও `@prisma/client` 6.19.2-এ পিন করা আছে;
> আপগ্রেড করবেন না।

## লোকাল সেটআপ

```bash
npm install
cp .env.example .env
# .env-এ BETTER_AUTH_SECRET-এ লম্বা র‍্যান্ডম সিক্রেট দিন, যেমন:
# openssl rand -base64 32
# .env-এ DATABASE_URL-এ Atlas কানেকশন স্ট্রিং দিন (উপরে দেখুন)
npx prisma db push
npm run dev
# http://localhost:3000
```

> **নোট (Prisma ইঞ্জিন):** `prisma generate` / `db push` চালাতে
> schema-engine বাইনারি ডাউনলোড লাগে। নেটওয়ার্ক সমস্যা হলে এভাবে চালান:
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
   - `BETTER_AUTH_SECRET` — লম্বা র‍্যান্ডম সিক্রেট (ডেভেরটা নয়, নতুন
     করে বানান: `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` — `https://<আপনার-ডোমেইন>` (যেমন
     `https://family-card-search.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` — উপরের একই URL
   - `DATABASE_URL` — Atlas MongoDB কানেকশন স্ট্রিং (উপরে দেখুন)।
4. Deploy করুন। প্রথম ডিপ্লয়ের পর একবার চালান:
   `npx prisma db push` (DATABASE_URL সেট করে) — এতে MongoDB-তে
   কালেকশন/ইনডেক্স তৈরি হবে।

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
    prisma.ts             PrismaClient (MongoDB — কোনো ড্রাইভার অ্যাডাপ্টার লাগে না)
    familycard.ts         সরকারি API ক্লায়েন্ট + NID/মোবাইল মাস্কিং
    session.ts            সার্ভার-সাইড লগইন গার্ড
prisma/
  schema.prisma           User/Session/Account/Verification + SavedApplication (MongoDB)
```

## গোপনীয়তা

- NID / ভেরিফিকেশন নম্বর ও মোবাইল নম্বর UI-তে, লগে, ডেটাবেসে, টেস্টে বা
  README-তে কোথাও রাখা হয় না। Raw JSON দেখালেও সেগুলো `***` দিয়ে ঢাকা
  থাকে।
- OTP / PIN কখনো চাওয়া হয় না, কারো সাথে শেয়ার করবেন না।
