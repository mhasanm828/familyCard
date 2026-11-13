import type { Metadata } from "next";
import { Hind_Siliguri, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bangla-alt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ফ্যামিলি কার্ড সার্চ — Family Card Search",
  description:
    "সরকারি ফ্যামিলি কার্ড API থেকে লাইভ আবেদন খুঁজুন — ট্র্যাকিং নম্বর বা NID/BRN + জন্ম তারিখ দিয়ে।",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn">
      <body
        className={`${hindSiliguri.variable} ${notoSansBengali.variable} min-h-screen antialiased`}
      >
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-emerald-900/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-stone-500 sm:px-6">
            <p className="font-semibold text-stone-700">
              ফ্যামিলি কার্ড সার্চ — এটি সরকারি ওয়েবসাইট নয়।
            </p>
            <p className="mt-1">
              এই অ্যাপটি সরকারি fc.bhata.gov.bd API থেকে সরাসরি তথ্য দেখায়।
              NID / মোবাইল নম্বর কোথাও দেখানো বা সংরক্ষণ করা হয় না।
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
