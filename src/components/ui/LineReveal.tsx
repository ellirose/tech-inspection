import { cn } from "@/lib/cn";

/** One line of a headline that slides up out of a mask on load (CSS, so it never waits for JavaScript). */
export function LineReveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <span className={cn("block animate-line-up", className)} style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

/** Highlighter stroke that sweeps in under a word after the headline lands. */
export function Underline({ delay = 0.9, className }: { delay?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute -bottom-[0.02em] left-0 -z-10 h-[0.26em] w-full origin-left animate-sweep rounded-full bg-lime/75", className)}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}
