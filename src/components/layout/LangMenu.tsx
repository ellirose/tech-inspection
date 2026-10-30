"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, Check } from "@phosphor-icons/react/ssr";
import { locales, type Locale } from "@/i18n/config";
import { flagFor, localeLabel } from "@/components/ui/Flags";
import { cn } from "@/lib/cn";

/** Language drop-down: circular flag + code on a fixed-width trigger, full names in the panel. */
export function LangMenu({
  lang,
  label,
  className,
  placement = "down",
}: {
  lang: Locale;
  label: string;
  className?: string;
  /** "up" opens the panel above the trigger (used at the bottom of the mobile drawer). */
  placement?: "down" | "up";
}) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(es|pt|en)(?=\/|$)/, "");
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const Flag = flagFor[lang];

  // Close when the route (and so the language) changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onPanelKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={root} className={cn("relative", className)} onBlur={(e) => !root.current?.contains(e.relatedTarget) && setOpen(false)}>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            setOpen(true);
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label}: ${localeLabel[lang].name}`}
        className={cn(
          "flex h-12 w-[5.5rem] shrink-0 items-center justify-between gap-2 rounded-2xl bg-surface pl-2 pr-2.5 text-[0.9rem] font-bold text-ink shadow-soft ring-1 ring-line transition hover:ring-accent/40",
          open && "ring-accent/40",
        )}
      >
        <Flag className="size-7 shrink-0" />
        <span>{localeLabel[lang].short}</span>
        <CaretDown weight="bold" className={cn("size-3.5 text-mute transition-transform duration-300", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            onKeyDown={onPanelKey}
            initial={{ opacity: 0, y: placement === "down" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "down" ? -6 : 6, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute z-10 w-60 rounded-3xl bg-surface p-2 shadow-float ring-1 ring-line",
              placement === "down" ? "right-0 top-full mt-2 origin-top-right" : "bottom-full left-0 mb-2 origin-bottom-left",
            )}
          >
            <p className="px-3 pb-1.5 pt-2 font-mono text-[0.7rem] uppercase tracking-[0.16em] text-mute">{label}</p>
            {locales.map((l) => {
              const ItemFlag = flagFor[l];
              const active = l === lang;
              return (
                <Link
                  key={l}
                  href={`/${l}${rest}`}
                  hrefLang={l}
                  lang={l}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-2.5 py-2.5 outline-none transition-colors focus-visible:bg-tint",
                    active ? "bg-tint text-accent" : "text-ink hover:bg-surface-2",
                  )}
                >
                  <ItemFlag className="size-8 shrink-0" />
                  <span className="flex-1 whitespace-nowrap text-[1.02rem] font-bold">{localeLabel[l].name}</span>
                  {active ? (
                    <Check weight="bold" className="size-4 text-accent-ink" />
                  ) : (
                    <span className="font-mono text-xs text-mute">{localeLabel[l].short}</span>
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
