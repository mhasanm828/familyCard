"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Landmark, LogOut, Search, User } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/", label: "হোম", icon: Landmark },
  { href: "/search", label: "সার্চ", icon: Search },
  { href: "/saved", label: "সেভ করা", icon: Bookmark },
  { href: "/profile", label: "প্রোফাইল", icon: User },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 shadow-sm backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow">
            <Landmark className="h-6 w-6" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg font-bold text-brand-800 dark:text-emerald-300">
              ফ্যামিলি কার্ড সার্চ
            </span>
            <span className="block text-xs text-stone-500 dark:text-stone-400">
              Family Card Search • লাইভ তথ্য
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === href
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <span className="h-9 w-24 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
          ) : session ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200 sm:flex dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              >
                <User className="h-4 w-4" />
                {session.user.name}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">লগআউট</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-emerald-300 dark:hover:bg-stone-800"
              >
                লগইন
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                অ্যাকাউন্ট খুলুন
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden dark:border-stone-800">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
              pathname === href
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300"
                : "text-stone-600 dark:text-stone-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
