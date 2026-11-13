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
- **লাইভ সার্চ (৩ ভাবে)** — (১) ট্র্যাকিং নম্বর (১০ ডিজিটের আবেদন আইডি),
  (২) আইডি কার্ড NID (১০/১৭ ডিজিট) বা BRN (১৭ ডিজিট) + জন্ম তারিখ,
  (৩) **আইডি দিয়ে PDF** — ১০ ডিজিটের আবেদন আইডি বা ৭ ডিজিটের ভেতরের
  আইডি দিলে সরকারি আবেদনপত্রের PDF সরাসরি ডাউনলোড করা যায় (১০ ডিজিটে
  উপরে আবেদনের সংক্ষিপ্ত তথ্যও দেখায়; ৭ ডিজিটে শুধু PDF)।
  প্রতিটা সার্চে সরকারি সিস্টেমের আসল অঙ্কের ক্যাপচা সমাধান করতে হয়
  (৭ ডিজিটের PDF-এ ক্যাপচা লাগে না)।
- **প্রোফাইল পেজ (`/profile`)** — লাইভ হিসাব: মোট সার্চ, ধরন অনুযায়ী
  সার্চ (ট্র্যাকিং / NID / PDF), পাওয়া গেছে / পাওয়া যায়নি / সমস্যা,
  সেভ করা আবেদনের সংখ্যা, সদস্য যেদিন থেকে, সাম্প্রতিক ১৫টি সার্চ —
  সবই MongoDB থেকে লাইভ আসে।
- **সব সার্চ ডেটাবেসে লগ হয়** — ট্র্যাকিং, NID ও PDF — তিন ধরনের
  প্রতিটা সার্চ `search_history`-তে জমা হয় (মাস্ক করা লেবেল, ফলাফল:
  পাওয়া গেছে / পাওয়া যায়নি / PDF / সমস্যা)। NID-র পুরো নম্বর বা
  জন্ম তারিখ কখনো সংরক্ষণ করা হয় না।
- **পুরো ফলাফল** — নাম, স্ট্যাটাস, PMT স্কোর, ভাতা, ঠিকানা, অফিস,
  আবেদনকারী/বাড়ি/স্বাক্ষরের ছবি, পেমেন্ট তথ্য ফাঁকা থাকলে লাল সতর্কবার্তা।
- **অফিসিয়াল PDF** — আবেদনপত্রের সরকারি ৫ পেজের PDF ডাউনলোড। আবেদন আইডি
  (১০ ডিজিট) বা ভেতরের আইডি (৭ ডিজিট) — দুটোই চলে।
- **সেভ করা আবেদন** — সফল প্রতিটা সার্চ লগইন করা ইউজারের অ্যাকাউন্টে
  ডেটাবেসে অটো-সেভ হয় (NID/মোবাইল ছাড়া), আর ফলাফলে **"সেভ করুন"
  বোতাম** থাকে — চাপলেই "✓ সেভ হয়েছে" দেখায়। ড্যাশবোর্ডে স্ট্যাটাস,
  PMT স্কোর, পেমেন্ট-ফাঁকা ব্যাজ, খোঁজা/ফিল্টার, বিস্তারিত দেখা ও মুছে
  ফেলা যায়। **CSV / JSON এক্সপোর্ট** — পুরো সেভ করা তালিকা ডাউনলোড
  করা যায়।
- **সার্চের ইতিহাস** — আপনার সাম্প্রতিক সার্চগুলো (মাস্ক করা লেবেলসহ)
  সার্চ পেজেই দেখা যায়; পাওয়া আবেদন **এক ক্লিকে আবার খোঁজা** যায়।
  ইতিহাস থেকে একটা বা সব মুছে ফেলা যায়।
- **সারাংশ কপি + প্রিন্ট** — ফলাফলের পরিষ্কার বাংলা সারাংশ কপি করার
  বোতাম (NID/মোবাইল ছাড়া), আর প্রিন্ট-বান্ধব রেজাল্ট ভিউ (প্রিন্টে
  শুধু রেজাল্ট কার্ডই ছাপা হয়)।
- **ডার্ক / লাইট মোড** — হেডারের টগল থেকে বদলানো যায়, পছন্দ ব্রাউজারে
  সেভ থাকে। ডিফল্ট লাইট।
- **ফন্ট — Anek Bangla** — হেডিং ও বডি দুটোতেই Anek Bangla; Anek-এ
  নেই এমন চিহ্নগুলো (`' • " " – — , +`) Hind Siliguri দিয়ে দেখায়।
  ফন্ট সরাসরি `font-family`-তে লেখা আছে (CSS ভ্যারিয়েবলের উপর নির্ভর
  করে না), তাই ভ্যারিয়েবল ক্লাস না থাকলেও Anek Bangla-ই দেখাবে।
- **ফ্যাভিকন** — সবুজ-সোনালি কার্ড আইকন (`FC`) — `src/app/icon.svg`
  ও `src/app/favicon.ico`।
- **অ্যানিমেশন** — পেজ ও রেজাল্ট কার্ডে হালকা fade-up, সার্চের সময়
  স্কেলেটন লোডিং, বাটনে press এফেক্ট, থিম বদলে মসৃণ ট্রানজিশন
  (CSS-মাত্র; `prefers-reduced-motion` মানা হয়)।

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
cp .env.example .env.local
```

`.env.local`-এ এগুলো থাকতে হবে (লোকাল ডেভের মান — Vercel-এর মান আলাদা,
নিচে দেখুন):

```env
DATABASE_URL="mongodb://127.0.0.1:27017/familycard?replicaSet=rs0"
BETTER_AUTH_SECRET="<openssl rand -base64 32 দিয়ে বানানো লম্বা সিক্রেট>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

জরুরি: লোকালে চালালে `BETTER_AUTH_URL` আর `NEXT_PUBLIC_APP_URL` —
দুটোই `http://localhost:3000` হতে হবে। ডেপ্লয় করা URL (যেমন
`https://....vercel.app`) বসালে লোকাল অথ কল `localhost`-এ যাবে না,
আর ব্রাউজার `ERR_CONNECTION_REFUSED` দেখাবে। Atlas-এর স্ট্রিং
(`mongodb+srv://...`) লোকালেও চলবে — তখন লোকাল `mongod` লাগবে না।

লোকাল `mongod` (replica set — Better Auth ট্রানজাকশন ব্যবহার করে,
আর MongoDB-তে ট্রানজাকশন চলে শুধু replica set-এ):

```bash
mkdir -p /tmp/mongo-data
mongod --replSet rs0 --dbpath /tmp/mongo-data --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log
# প্রথমবার একবার: mongosh-এ rs.initiate() — না থাকলে node দিয়ে:
node -e "require('mongodb').MongoClient.connect('mongodb://127.0.0.1:27017/?replicaSet=rs0').then(c=>c.db('admin').command({replSetInitiate:{}})).then(()=>console.log('initiated')).catch(e=>console.log(e.message))"
```

তারপর অ্যাপ চালান:

```bash
npm run dev
# http://localhost:3000
```

⚠️ **ডেভ সার্ভার চালু না থাকলে রেজিস্ট্রেশন হবে না**: ব্রাউজার
কনসোলে `GET http://localhost:3000/api/auth/get-session
net::ERR_CONNECTION_REFUSED` আর `POST .../sign-up/email
net::ERR_CONNECTION_REFUSED` মানে সার্ভারই চলছে না — কোডের বাগ নয়।
`npm run dev` চালিয়ে টার্মিনালে `Ready` দেখে নিন, তারপর ফর্ম
সাবমিট করুন। সার্ভার বন্ধ থাকলে এখন ফর্মে পরিষ্কার বাংলা মেসেজ
দেখাবে ("সার্ভারের সাথে সংযোগ হয়নি..."), কনসোলে আনকট এরর নয়।

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
     `https://familycard.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` — উপরের একই URL
   - `DATABASE_URL` — Atlas MongoDB কানেকশন স্ট্রিং (উপরে দেখুন)।
   - সোশ্যাল লগইন চালু করতে চাইলে: `GOOGLE_CLIENT_ID`,
     `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_ID`,
     `FACEBOOK_CLIENT_SECRET` (উপরে দেখুন)।
4. Deploy করুন। নতুন পুশ হলেই Vercel নিজে নিজে আবার ডিপ্লয় করবে।

> ⚠️ **`BETTER_AUTH_URL` হুবহু মিলতে হবে।** Vercel প্রজেক্টের নাম
> ছোট হাতের অক্ষরে হয় — তাই আসল URL সবসময় ছোট হাতের, যেমন
> `https://familycard.vercel.app` (বড় হাতের `familyCard` নয়)।
> Vercel Dashboard → Project → **Domains** (বা Deployment-এর
> **Visit** বাটনে ক্লিক করে অ্যাড্রেস বারে যা দেখায়) — সেটাই
> `BETTER_AUTH_URL` আর `NEXT_PUBLIC_APP_URL` — শেষে `/` ছাড়া।
> ভুল/বড় হাতের URL দিলে রেজিস্ট্রেশন/লগইন **403** দিয়ে ব্যর্থ হয়।
> অ্যাপে `https://*.vercel.app` আগেই trusted হিসেবে আছে, তাই
> সঠিক URL দিলে আর 403 আসবে না।

## সমস্যা সমাধান (403)

- **"অ্যাকাউন্ট খুলতে ব্যর্থ হয়েছে" + কনসোলে 403** — প্রায় সবসময়
  `BETTER_AUTH_URL` ভুল। উপরের ধাপ অনুযায়ী আসল ডেপ্লয়মেন্ট URL
  (ছোট হাতের, `/` ছাড়া) দুইটা env var-এ বসিয়ে **Redeploy** দিন
  (Vercel → Deployments → ⋯ → Redeploy) — শুধু env বদলালে চলবে না,
  আবার ডিপ্লয় লাগে।
- **সার্ভার এরর দেখালে ফর্ম এখন আসল কারণ বাংলায় দেখায়** (যেমন
  ঠিকানা না মিললে 403-এর কথা লেখা থাকে)।

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
    search/               সার্চ পাতা (লগইন আবশ্যক) + ইতিহাস — ৩ মোড
    saved/                সেভ করা তালিকা + [id] বিস্তারিত
    account/              অ্যাকাউন্ট পাতা
    profile/              প্রোফাইল — লাইভ সার্চের হিসাব + সাম্প্রতিক সার্চ
    icon.svg / favicon.ico  ফ্যাভিকন (সবুজ-সোনালি FC কার্ড)
    api/
      auth/[...all]/      Better Auth হ্যান্ডলার
      captcha/            ক্যাপচা প্রক্সি
      search/             ট্র্যাকিং / NID সার্চ + অটো-সেভ + ইতিহাস
      pdf-search/         আইডি দিয়ে PDF — ৭/১০ ডিজিট + (১০ ডিজিটে) ট্র্যাকিং
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
    save-application.ts   সেভ/আপসার্ট হেল্পার (সার্চ + PDF + সেভ বোতাম)
    session.ts            সার্ভার-সাইড লগইন গার্ড
```

## গোপনীয়তা

- NID / ভেরিফিকেশন নম্বর ও মোবাইল নম্বর UI-তে, লগে, ডেটাবেসে, টেস্টে বা
  README-তে কোথাও রাখা হয় না। Raw JSON দেখালেও সেগুলো `***` দিয়ে ঢাকা
  থাকে।
- OTP / PIN কখনো চাওয়া হয় না, কারো সাথে শেয়ার করবেন না।
