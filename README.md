# ফ্যামিলি কার্ড সার্চ — Family Card Search

Next.js (App Router, TypeScript) + **Better Auth** অ্যাপ — সরকারি ফ্যামিলি
কার্ড সিস্টেম থেকে লাইভ আবেদন খোঁজার জন্য। ডেটাবেস: **MongoDB** (নেটিভ
ড্রাইভার) — কোনো ORM নেই।

> ⚠️ **এটি সরকারি ওয়েবসাইট নয়।** এই অ্যাপটি সরকারি সিস্টেম থেকে সরাসরি
> তথ্য দেখায়। NID / মোবাইল নম্বর কোথাও দেখানো বা সংরক্ষণ করা হয় না।

## যা যা আছে

- **Better Auth লগইন** — ইমেইল + পাসওয়ার্ডে সাইন আপ / সাইন ইন, সঙ্গে
  **Google ও Facebook সোশ্যাল লগইন** (সেটআপ করলে — নিচে দেখুন)। সার্চ ও
  সেভ করা তালিকা লগইন ছাড়া খোলে না।
- **লাইভ সার্চ (২ ভাবে)** — (১) ট্র্যাকিং নম্বর (১০ ডিজিটের আবেদন আইডি),
  (২) আইডি কার্ড NID (১০/১৭ ডিজিট) বা BRN (১৭ ডিজিট) + জন্ম তারিখ।
  প্রতিটা সার্চে সরকারি সিস্টেমের আসল অঙ্কের ক্যাপচা সমাধান করতে হয়।
- **পুরো ফলাফল** — নাম, স্ট্যাটাস, PMT স্কোর, ভাতা, ঠিকানা, অফিস,
  আবেদনকারী/বাড়ি/স্বাক্ষরের ছবি, পেমেন্ট তথ্য ফাঁকা থাকলে লাল সতর্কবার্তা।
- **অফিসিয়াল PDF** — আবেদনপত্রের সরকারি ৫ পেজের PDF ডাউনলোড। আবেদন আইডি
  (১০ ডিজিট) বা ভেতরের আইডি (৭ ডিজিট) — দুটোই চলে।
- **সেভ করা আবেদন** — সফল প্রতিটা সার্চ লগইন করা ইউজারের অ্যাকাউন্টে
  ডেটাবেসে সেভ হয় (NID/মোবাইল ছাড়া)। ড্যাশবোর্ডে স্ট্যাটাস, PMT স্কোর,
  পেমেন্ট-ফাঁকা ব্যাজ, খোঁজা/ফিল্টার, বিস্তারিত দেখা ও মুছে ফেলা যায়।
  **CSV / JSON এক্সপোর্ট** — পুরো সেভ করা তালিকা ডাউনলোড করা যায়।
- **সার্চের ইতিহাস** — আপনার সাম্প্রতিক সার্চগুলো (মাস্ক করা লেবেলসহ)
  সার্চ পেজেই দেখা যায়; পাওয়া আবেদন **এক ক্লিকে আবার খোঁজা** যায়।
  ইতিহাস থেকে একটা বা সব মুছে ফেলা যায়।
- **সারাংশ কপি + প্রিন্ট** — ফলাফলের পরিষ্কার বাংলা সারাংশ কপি করার
  বোতাম (NID/মোবাইল ছাড়া), আর প্রিন্ট-বান্ধব রেজাল্ট ভিউ (প্রিন্টে
  শুধু রেজাল্ট কার্ডই ছাপা হয়)।
- **ডার্ক / লাইট মোড** — হেডারের টগল থেকে বদলানো যায়, পছন্দ ব্রাউজারে
  সেভ থাকে। ডিফল্ট লাইট।

## ডেটাবেস — MongoDB Atlas (ফ্রি)

অ্যাপটি MongoDB-র নেটিভ ড্রাইভার (`mongodb` প্যাকেজ) ব্যবহার করে।
ডেটাবেসের নাম `familycard`। কালেকশন: `users`, `sessions`, `accounts`,
`verifications` (Better Auth), `saved_applications`, `search_history`
(এই অ্যাপের নিজের ডেটা)। কালেকশনগুলো প্রথম ব্যবহারের সময় নিজে নিজে
তৈরি হয় — আলাদা করে স্কিমা চালাতে হয় না।

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

লোকাল ডেভেও একই Atlas স্ট্রিং ব্যবহার করা যায়, অথবা লোকাল `mongod`
চালিয়ে `DATABASE_URL="mongodb://localhost:27017/familycard"` দিন।
লোকাল `mongod`-এর ক্ষেত্রে একটা জরুরি কথা: Better Auth ইউজার বানানোর
সময় ট্রানজাকশন ব্যবহার করে, আর MongoDB-তে ট্রানজাকশন চলে শুধু
replica set-এ। তাই লোকাল `mongod` চালাতে হবে single-node replica set
হিসেবে: `mongod --replSet rs0` দিয়ে চালিয়ে `rs.initiate()` করুন, আর
`DATABASE_URL`-এ `?replicaSet=rs0` যোগ করুন। Atlas-এ এটা আগে থেকেই
replica set, তাই সেখানে কিছু করতে হয় না।

## লোকাল সেটআপ

```bash
npm install
cp .env.example .env
# .env-এ BETTER_AUTH_SECRET-এ লম্বা র‍্যান্ডম সিক্রেট দিন, যেমন:
# openssl rand -base64 32
# .env-এ DATABASE_URL-এ Atlas কানেকশন স্ট্রিং দিন (উপরে দেখুন)
npm run dev
# http://localhost:3000
```

## সোশ্যাল লগইন (Google / Facebook) — আপনার করতে হবে

ইমেইল + পাসওয়ার্ড লগইন সবসময় চলে। Google / Facebook লগইন চালু করতে
নিচের ধাপগুলো করুন, তারপর Vercel-এ ৪টি env var বসান। Client ID /
Secret কখনো কোডে বা README-তে বসাবেন না — শুধু `.env` / Vercel-এ।

### ১) Google OAuth client বানান

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   -এ যান → প্রজেক্ট বানান (বা আগেরটা নিন)।
2. **Create Credentials → OAuth client ID** → Application type:
   **Web application**।
3. **Authorized redirect URIs**-এ যোগ করুন:
   `https://<আপনার-ডোমেইন>/api/auth/callback/google`
   (লোকাল টেস্টের জন্য `http://localhost:3000/api/auth/callback/google`ও
   যোগ করতে পারেন।)
4. তৈরি হলে **Client ID** আর **Client Secret** কপি করুন →
   `GOOGLE_CLIENT_ID` ও `GOOGLE_CLIENT_SECRET`।

### ২) Facebook app বানান

1. [Meta for Developers](https://developers.facebook.com/apps)-এ যান →
   **Create App** → **Authenticate and request data from users with
   Facebook Login** (বা "Other" → Facebook Login)।
2. App-এর **Settings → Basic** থেকে **App ID** আর **App Secret** কপি
   করুন → `FACEBOOK_CLIENT_ID` ও `FACEBOOK_CLIENT_SECRET`।
3. **Facebook Login → Settings**-এ **Valid OAuth Redirect URIs**-এ যোগ
   করুন: `https://<আপনার-ডোমেইন>/api/auth/callback/facebook`
   (লোকাল টেস্টের জন্য `http://localhost:3000/api/auth/callback/facebook`ও
   যোগ করতে পারেন।)
4. App **Live** না হলে শুধু App-এ যোগ করা টেস্ট ইউজাররাই লগইন করতে
   পারবে — সবার জন্য খুলতে App Review-এ **public** করতে হয়।

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
   - সোশ্যাল লগইন চালু করতে চাইলে: `GOOGLE_CLIENT_ID`,
     `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`,
     `FACEBOOK_CLIENT_SECRET` (উপরে দেখুন)।
4. Deploy করুন। নতুন পুশ হলেই Vercel নিজে নিজে আবার ডিপ্লয় করবে।

## সার্চের নিয়ম (যাচাই করা, নভেম্বর ২০২৬)

- ট্র্যাকিং নম্বরই আবেদন আইডি (ঠিক ১০ ডিজিট, ১–৯ দিয়ে শুরু)।
- NID (১০/১৭ ডিজিট) বা BRN (১৭ ডিজিট) + জন্ম তারিখ দিয়েও সার্চ হয়।
- রেকর্ড না মিললে ফলাফল খালি আসে।
- ভেতরের ৭ ডিজিটের আইডি দিয়ে ট্র্যাকিং সার্চ হয় না — শুধু PDF নামে।
- প্রতিটা সার্চে নতুন ক্যাপচা লাগে, তাই bulk অটো-সংগ্রহ সম্ভব নয়।
- সার্ভার রুটগুলো সরকারি সিস্টেমে প্রক্সি করে — এন্ডপয়েন্টের বিস্তারিত
  UI বা README-তে রাখা হয় না।

## প্রজেক্ট কাঠামো

```
src/
  app/
    page.tsx              হোম / হিরো
    signin/ signup/       Better Auth পাতা (ইমেইল + Google/Facebook)
    search/               সার্চ পাতা (লগইন আবশ্যক) + ইতিহাস
    saved/                সেভ করা তালিকা + [id] বিস্তারিত
    account/              অ্যাকাউন্ট পাতা
    api/
      auth/[...all]/      Better Auth হ্যান্ডলার
      captcha/            ক্যাপচা প্রক্সি
      search/             ট্র্যাকিং সার্চ + অটো-সেভ + ইতিহাস
      history/            সার্চের ইতিহাস (দেখা/মোছা)
      image/              ছবি প্রক্সি
      pdf/                অফিসিয়াল PDF প্রক্সি
      providers/          কোন সোশ্যাল লগইন চালু আছে
      saved/              সেভ করা তালিকার API
      saved/export/       CSV / JSON এক্সপোর্ট
  components/             Header, ThemeToggle, SearchForm, ResultView,
                          SavedList, SocialLoginButtons, SignOutButton
  lib/
    auth.ts               Better Auth কনফিগ (MongoDB অ্যাডাপ্টার + সোশ্যাল)
    auth-client.ts        Better Auth React ক্লায়েন্ট
    db.ts                 নেটিভ MongoDB ক্লায়েন্ট (DATABASE_URL)
    familycard.ts         সরকারি API ক্লায়েন্ট + NID/মোবাইল মাস্কিং
    session.ts            সার্ভার-সাইড লগইন গার্ড
```

## গোপনীয়তা

- NID / ভেরিফিকেশন নম্বর ও মোবাইল নম্বর UI-তে, লগে, ডেটাবেসে, টেস্টে বা
  README-তে কোথাও রাখা হয় না। Raw JSON দেখালেও সেগুলো `***` দিয়ে ঢাকা
  থাকে।
- OTP / PIN কখনো চাওয়া হয় না, কারো সাথে শেয়ার করবেন না।
