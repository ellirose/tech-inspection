import type { Icon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

/** Pill label with a neon status dot and an optional index: "● 01 / LABEL". */
export function Eyebrow({ children, index, className, tone = "default" }: { children: React.ReactNode; index?: string; className?: string; tone?: "default" | "onImage" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-4 font-mono text-[0.74rem] font-medium uppercase tracking-[0.14em] sm:text-[0.8rem]",
        tone === "default" ? "bg-surface text-ink-soft shadow-soft ring-1 ring-line" : "glass text-ink ring-1 ring-white/40",
        className,
      )}
    >
      <span className="relative flex size-2.5">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-neon" />
        <span className="relative size-2.5 rounded-full bg-neon" />
      </span>
      {index && <span className="text-accent-ink">{index}</span>}
      {index && <span aria-hidden className="text-line">/</span>}
      {children}
    </span>
  );
}

/** Section heading: large, heavy title; the lead sits beside it on wide screens or under it. */
export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  align = "split",
  className,
  children,
}: {
  eyebrow: string;
  index?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "split" | "stack" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        align === "split" && "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-14",
        align === "center" && "mx-auto max-w-4xl text-center",
        align === "stack" && "max-w-3xl",
        className,
      )}
    >
      <div className={cn(align === "split" && "lg:col-span-7")}>
        <Eyebrow index={index}>{eyebrow}</Eyebrow>
        <h2 className="mt-6 text-balance text-[clamp(2.3rem,4.4vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink">{title}</h2>
      </div>
      {(lead || children) && (
        <div className={cn(align === "split" ? "lg:col-span-5 lg:pb-2" : "mt-6", align === "center" && "mx-auto max-w-2xl")}>
          {lead && <p className="text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{lead}</p>}
          {children}
        </div>
      )}
    </Reveal>
  );
}

const badgeSize = { md: "size-14 [&>svg]:size-7", lg: "size-16 [&>svg]:size-9", xl: "size-20 [&>svg]:size-11" };
const badgeTone = {
  brand: "bg-brand-50 text-brand-600 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-400/25",
  neon: "bg-[#e2f8fe] text-neon-deep ring-neon/30 dark:bg-neon/10 dark:text-neon dark:ring-neon/30",
  lime: "bg-[#eefbe0] text-lime-deep ring-lime/40 dark:bg-lime/10 dark:text-lime dark:ring-lime/30",
  red: "bg-[#feebee] text-pt ring-pt/25 dark:bg-pt/10 dark:ring-pt/30",
  solid: "bg-brand-600 text-white ring-brand-500 shadow-[0_12px_28px_-10px_rgb(31_55_214/0.7)] dark:bg-neon dark:text-[#0b1533] dark:ring-neon",
} as const;

/** Large, prominent icon tile: duotone glyph in a tinted square, circle or hexagon. */
export function IconBadge({
  icon: I,
  size = "lg",
  tone = "brand",
  shape = "square",
  className,
}: {
  icon: Icon;
  size?: keyof typeof badgeSize;
  tone?: keyof typeof badgeTone;
  shape?: "square" | "circle" | "hex";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center ring-1",
        badgeSize[size],
        badgeTone[tone],
        shape === "square" && "rounded-2xl",
        shape === "circle" && "rounded-full",
        shape === "hex" && "shape-hex ring-0",
        className,
      )}
    >
      <I weight="duotone" />
    </span>
  );
}

/** Four corner brackets that frame a media block like a viewfinder. */
export function Ticks({ className, size = "size-5" }: { className?: string; size?: string }) {
  const base = cn("pointer-events-none absolute border-current", size);
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 z-10 text-neon", className)}>
      <span className={cn(base, "left-0 top-0 rounded-tl-lg border-l-2 border-t-2")} />
      <span className={cn(base, "right-0 top-0 rounded-tr-lg border-r-2 border-t-2")} />
      <span className={cn(base, "bottom-0 left-0 rounded-bl-lg border-b-2 border-l-2")} />
      <span className={cn(base, "bottom-0 right-0 rounded-br-lg border-b-2 border-r-2")} />
    </span>
  );
}

/** Decorative swoosh lines, like the curved strokes in the deck's corners. */
export function Swoosh({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 300" fill="none" aria-hidden className={cn("pointer-events-none", className)}>
      {[0, 14, 28, 42].map((o, i) => (
        <path key={o} d={`M0 ${240 - o} C 180 ${240 - o}, 260 ${70 - o}, 600 ${40 - o}`} stroke="currentColor" strokeOpacity={0.5 - i * 0.1} strokeWidth="1.4" />
      ))}
    </svg>
  );
}
