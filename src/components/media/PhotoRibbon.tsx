import Image from "next/image";
import type { Photo } from "@/lib/media";
import { cn } from "@/lib/cn";

// Corner accents only (no pills/circles), so people near the edges are not clipped.
const corners = ["rounded-[1.75rem]", "rounded-[1.75rem] rounded-tr-[4.5rem]", "rounded-[1.75rem]", "rounded-[1.75rem] rounded-bl-[4.5rem]"];

/**
 * Two counter-scrolling rows of photos at their natural aspect ratio. Pure CSS, pauses on hover,
 * and stops entirely for visitors who prefer reduced motion.
 */
export function PhotoRibbon({ rows, className }: { rows: [Photo[], Photo[]]; className?: string }) {
  return (
    <div className={cn("space-y-4 overflow-hidden mask-fade-x", className)} aria-hidden="true">
      {rows.map((row, r) => (
        <div
          key={r}
          className={cn(
            "flex w-max gap-4 [--h:10rem] hover:[animation-play-state:paused] motion-reduce:animate-none sm:[--h:13rem]",
            r ? "animate-marquee [animation-direction:reverse] [animation-duration:70s]" : "animate-marquee [animation-duration:60s]",
          )}
        >
          {[...row, ...row].map((p, i) => (
            <div
              key={i}
              className={cn("relative h-[var(--h)] shrink-0 overflow-hidden bg-mist shadow-soft ring-1 ring-line", corners[i % corners.length])}
              style={{ width: `calc(var(--h) * ${Math.min(Math.max(p.w / p.h, 0.75), 1.9).toFixed(3)})` }}
            >
              <Image src={p.src} alt="" fill sizes="22rem" className="object-cover" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
