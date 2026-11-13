import type { Metadata } from "next";
import { Anek_Bangla, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        <Header />
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
          </div>
        </footer>
      </body>
    </html>
  );
}
