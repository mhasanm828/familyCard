"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "fc-theme";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  // The bootstrap script in layout.tsx already applied the saved class
  // before React hydrates, so the DOM is the source of truth here.
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

/** Dark / light toggle. Persists in localStorage; defaults to light. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "লাইট মোড করুন" : "ডার্ক মোড করুন"}
      title={theme === "dark" ? "লাইট মোড" : "ডার্ক মোড"}
      suppressHydrationWarning
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-amber-300 dark:hover:bg-stone-700"
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5" />
      ) : (
        <Moon className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
