import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12", className)}>{children}</div>;
}

export function Eyebrow({ children, className, tone = "brand" }: { children: React.ReactNode; className?: string; tone?: "brand" | "light" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:text-[0.8rem] sm:tracking-[0.16em]",
        tone === "brand" ? "bg-brand-50 text-brand-700 ring-1 ring-brand-100" : "bg-white/15 text-white ring-1 ring-white/30",
        className,
      )}
    >
      <span className="relative flex size-2">
        <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mt" />
        <span className="relative size-2 rounded-full bg-mt" />
      </span>
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance font-display text-[clamp(2.3rem,4.6vw,4.25rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ink">
        {title}
      </h2>
      {lead && <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{lead}</p>}
    </Reveal>
  );
}
