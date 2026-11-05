import { cn } from "@/lib/cn";

/**
 * Fade-and-lift entrance for content that is on screen when the page opens (heroes). Plain CSS: it plays
 * from the first paint, while <Reveal> waits for JavaScript and suits content further down the page.
 */
export function Rise({ delay = 0, y = 16, className, children }: { delay?: number; y?: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("animate-rise", className)} style={{ animationDelay: `${delay}s`, ["--rise-y" as string]: `${y}px` }}>
      {children}
    </div>
  );
}
