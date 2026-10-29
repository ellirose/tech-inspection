"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

/**
 * Horizontal, swipeable strip at a fixed height. Each frame takes its width from the photo's
 * aspect ratio, so wide group shots and tall portraits both show in full.
 */
export function Filmstrip({ items, alt, className, prev = "Previous", next = "Next" }: { items: Photo[]; alt: string; className?: string; prev?: string; next?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const lb = useLightbox(items.length);
  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className={cn("relative [--strip-h:15rem] sm:[--strip-h:20rem] lg:[--strip-h:24rem]", className)}>
      <div ref={track} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:thin]">
        {items.map((p, i) => (
          <figure key={p.src} className="shrink-0 snap-start" style={{ width: `calc(var(--strip-h) * ${(p.w / p.h).toFixed(3)})` }}>
            <button
              type="button"
              onClick={() => lb.open(i)}
              className="group relative block h-[var(--strip-h)] w-full overflow-hidden rounded-[1.75rem] bg-mist shadow-soft ring-1 ring-line"
              aria-label={p.caption ?? `${alt} ${i + 1}`}
            >
              <Image src={p.src} alt={p.caption ?? `${alt} ${i + 1}`} fill sizes="(min-width:768px) 40vw, 80vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            </button>
            {p.caption && <figcaption className="mt-3 px-1 font-display font-bold text-ink">{p.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => scroll(-1)} className="grid size-12 place-items-center rounded-full bg-white text-ink shadow-soft ring-1 ring-line transition hover:bg-brand-700 hover:text-white" aria-label={prev}>
          <ArrowLeft weight="bold" className="size-5" />
        </button>
        <button type="button" onClick={() => scroll(1)} className="grid size-12 place-items-center rounded-full bg-white text-ink shadow-soft ring-1 ring-line transition hover:bg-brand-700 hover:text-white" aria-label={next}>
          <ArrowRight weight="bold" className="size-5" />
        </button>
      </div>
      <Lightbox items={items} alt={alt} {...lb} />
    </div>
  );
}
