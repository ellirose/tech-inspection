import Image from "next/image";
import type { Photo } from "@/lib/media";
import { cn } from "@/lib/cn";

/**
 * Two counter-scrolling rows of photos at their natural aspect ratio, tilted in opposite directions
 * so they cross like ribbons. Pure CSS, pauses on hover, still for reduced-motion visitors.
 */
export function PhotoRibbon({ rows, className }: { rows: [Photo[], Photo[]]; className?: string }) {
  return (
    <div className={cn("relative space-y-6 overflow-hidden py-10", className)} aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className={cn("mask-fade-x", r ? "rotate-[1.5deg]" : "-rotate-2")}>
          <div
            className={cn(
              "flex w-max gap-5 [--h:11rem] hover:[animation-play-state:paused] motion-reduce:animate-none sm:[--h:15rem]",
              r ? "animate-marquee [animation-direction:reverse] [animation-duration:80s]" : "animate-marquee [animation-duration:70s]",
            )}
          >
            {[...row, ...row].map((p, i) => (
              <div
                key={i}
                className={cn("relative h-[var(--h)] shrink-0 overflow-hidden bg-surface-2 shadow-card ring-4 ring-surface", i % 3 === 1 ? "rounded-[2rem] rounded-tr-[4rem]" : "rounded-[2rem]")}
                style={{ width: `calc(var(--h) * ${Math.min(Math.max(p.w / p.h, 0.75), 1.9).toFixed(3)})` }}
              >
                <Image src={p.src} alt="" fill sizes="26rem" loading="eager" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
