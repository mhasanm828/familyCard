import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { Anek_Bangla, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { auth } from "@/lib/auth";

// Primary font — Anek Bangla for headings AND body.
// Hind Siliguri stays loaded as the fallback: some ASCII symbols
// ( ' • " " – — , + ) render as tofu boxes in Anek Bangla, so the
// font stack falls back to Hind Siliguri per-glyph for those.
const anekBangla = Anek_Bangla({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-anek",
  display: "swap",
});

// Fallback font — only used for glyphs Anek Bangla lacks.
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fallback",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ফ্যামিলি কার্ড সার্চ — Family Card Search",
  description:
    "ফ্যামিলি কার্ডের আবেদন খুঁজুন — ট্র্যাকিং নম্বর বা NID/BRN + জন্ম তারিখ দিয়ে।",
};

// Runs before first paint so the saved theme applies without a flash.
// It only toggles the `dark` class on <html> — it never writes text
// content, so it cannot cause a hydration mismatch. <html> also carries
// suppressHydrationWarning for that class-attribute difference.
const THEME_BOOTSTRAP = `(function(){try{var t=localStorage.getItem("fc-theme");if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Server session for the header: without it the client header would
  // SSR the logged-OUT nav (Profile replaced by "অ্যাকাউন্ট খুলুন") on
  // every first paint and only flip after hydration. The prop is just
  // the first paint — the client session takes over once loaded, and
  // access is enforced server-side anyway (see lib/access.ts).
  const serverSession = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null);
  const initialSession = serverSession
    ? {
        user: {
          id: serverSession.user.id,
          name: serverSession.user.name,
          email: serverSession.user.email,
          role: (
            serverSession.user as { role?: string }
          ).role,
          approved: (
            serverSession.user as { approved?: boolean }
          ).approved,
        },
      }
    : null;

  return (
    <html
      lang="bn"
      suppressHydrationWarning
      className={anekBangla.className}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body
        className={`${anekBangla.variable} ${hindSiliguri.variable} min-h-screen bg-[#f4f6f4] font-sans text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100`}
      >
        <Header initialSession={initialSession} />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-emerald-900/10 bg-white dark:border-stone-800 dark:bg-stone-950">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-stone-500 sm:px-6 dark:text-stone-400">
            <p className="font-display font-semibold text-stone-700 dark:text-stone-200">
              ফ্যামিলি কার্ড সার্চ — এটি সরকারি ওয়েবসাইট নয়।
            </p>
            <p className="mt-1">
              এই অ্যাপটি সরকারি সিস্টেম থেকে সরাসরি তথ্য দেখায়। NID /
              মোবাইল নম্বর কোথাও দেখানো বা সংরক্ষণ করা হয় না।
            </p>
            <p className="mt-3 flex items-center justify-center gap-3 font-medium">
              <Link
                href="/privacy"
                className="text-brand-700 hover:underline dark:text-emerald-400"
              >
                গোপনীয়তা নীতি
              </Link>
              <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">
                •
              </span>
              <Link
                href="/terms"
                className="text-brand-700 hover:underline dark:text-emerald-400"
              >
                ব্যবহারের শর্তাবলি
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
