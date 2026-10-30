"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

type Theme = "light" | "dark";

// The theme lives on <html data-theme>; this store mirrors it so the icon stays in sync.
const listeners = new Set<() => void>();
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};
const apply = (t: Theme) => {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem("theme", t);
  } catch {}
  listeners.forEach((l) => l());
};

/** Light/dark switch. Before hydration it renders the light icon. */
export function ThemeToggle({ labels, className }: { labels: { light: string; dark: string }; className?: string }) {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={labels[next]}
      title={labels[next]}
      className={cn("grid size-12 shrink-0 place-items-center rounded-2xl bg-surface text-ink shadow-soft ring-1 ring-line transition hover:text-accent", className)}
    >
      {theme === "dark" ? <Sun weight="bold" className="size-6" /> : <Moon weight="bold" className="size-6" />}
    </button>
  );
}
