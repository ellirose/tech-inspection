"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { locales, type Locale } from "@/i18n/config";
import { flagFor, localeLabel } from "@/components/ui/Flags";
import { cn } from "@/lib/cn";

/** Segmented toggle with circular flags; the white thumb slides to the active language. */
export function LangToggle({
  lang,
  label,
  className,
  compact = false,
}: {
  lang: Locale;
  label: string;
  className?: string;
  /** Hide the ES/PT/EN codes until the 2xl breakpoint (flags stay visible). */
  compact?: boolean;
}) {
  const pathname = usePathname();
  const rest = pathname.replace(/^\/(es|pt|en)(?=\/|$)/, "");

  return (
    <nav
      aria-label={label}
      className={cn("relative flex items-center gap-1 rounded-full bg-mist/90 p-1 ring-1 ring-line shadow-inner", className)}
    >
      {locales.map((l) => {
        const Flag = flagFor[l];
        const active = l === lang;
        return (
          <Link
            key={l}
            href={`/${l}${rest}`}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            title={localeLabel[l].name}
            scroll={false}
            className={cn(
              "relative z-0 flex h-10 items-center gap-1.5 rounded-full px-1 font-mono text-[0.82rem] font-bold tracking-wider transition-colors",
              compact ? "2xl:pr-3" : "pr-3",
              active ? "text-brand-800" : "text-mute hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId="lang-thumb"
                className="absolute inset-0 -z-10 rounded-full bg-white shadow-soft ring-1 ring-brand-100"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <Flag className={cn("size-8 transition-transform duration-300", active ? "scale-100" : "scale-90 opacity-80 grayscale-[35%]")} />
            <span className={cn(compact && "sr-only 2xl:not-sr-only")}>{localeLabel[l].short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
