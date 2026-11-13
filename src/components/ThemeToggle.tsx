"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "fc-theme";

type Theme = "light" | "dark";

/**
 * Dark / light toggle. Persists in localStorage; defaults to light.
 *
 * Hydration fix (React error #418): the first client render MUST match
 * the server HTML exactly. The old code called `useState(initialTheme)`,
 * where the initializer read `document.documentElement.classList` during
 * render — so when a dark theme was saved, the client rendered the Sun
 * icon + different aria-label while the server had rendered the Moon
 * icon, and React threw a hydration error. A `useEffect` + `setState`
 * version has the same problem in reverse (and trips the
 * react-hooks/set-state-in-effect lint rule).
 *
 * `useSyncExternalStore` is the correct tool: during hydration React
 * uses the server snapshot ("light", matching the server HTML), and
 * only after hydration does it read the real client snapshot (the
 * `dark` class the pre-paint bootstrap script in layout.tsx already
 * applied) and re-render. That post-hydration update is a normal
 * render, not a hydration mismatch. The toggle only flips the class
 * attribute + localStorage; the MutationObserver picks the change up
 * and re-renders the icon.
 */

function getClientTheme(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

function subscribeTheme(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getClientTheme,
    () => "light", // server snapshot — must match the server HTML
  );

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private mode — the toggle still works for this visit.
    }
  }

  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "লাইট মোড করুন" : "ডার্ক মোড করুন"}
      title={dark ? "লাইট মোড" : "ডার্ক মোড"}
      className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition hover:bg-stone-200 dark:bg-stone-800 dark:text-amber-300 dark:hover:bg-stone-700"
    >
      {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
    </button>
  );
}
