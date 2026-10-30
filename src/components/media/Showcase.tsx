"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowsOut } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

/**
 * Stage + thumbnail rail. The stage shows the whole photo (object-contain) over a blurred,
 * enlarged copy of itself, so portrait and landscape shots both fill the frame without cropping.
 */
export function Showcase({ items, alt, className }: { items: Photo[]; alt: string; className?: string }) {
  const [active, setActive] = useState(0);
  const lb = useLightbox(items.length);
  const p = items[active];

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_8.5rem]", className)}>
      <button
        type="button"
        onClick={() => lb.open(active)}
        className="group relative aspect-[16/10] overflow-hidden rounded-[2.5rem] rounded-tr-[5rem] bg-brand-900 shadow-float"
        aria-label={p.caption ?? `${alt} ${active + 1}`}
      >
        <AnimatePresence initial={false}>
          <motion.div key={p.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <Image src={p.src} alt="" fill sizes="10vw" className="scale-125 object-cover opacity-60 blur-2xl" />
            <Image src={p.src} alt={p.caption ?? `${alt} ${active + 1}`} fill sizes="(min-width:1024px) 60vw, 100vw" quality={90} className="object-contain" />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-5 left-5 rounded-full bg-white/90 px-4 py-1.5 font-mono text-sm font-bold text-[#071a2e]">
          {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <span className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-white/90 text-[#071a2e] transition group-hover:scale-110">
          <ArrowsOut weight="bold" className="size-5" />
        </span>
      </button>

      {/* At lg the rail is pinned to the stage height and scrolls on its own. */}
      <div className="relative min-w-0">
        <div className="flex gap-3 overflow-x-auto p-1 lg:absolute lg:inset-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
          {items.map((t, i) => (
            <button
              key={t.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === active ? "true" : undefined}
              className={cn(
                "relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl ring-2 transition lg:w-full",
                i === active ? "ring-neon" : "opacity-70 ring-transparent hover:opacity-100",
              )}
            >
              <Image src={t.src} alt="" fill sizes="9rem" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
      <Lightbox items={items} alt={alt} {...lb} />
    </div>
  );
}
