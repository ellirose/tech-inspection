"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { MagnifyingGlassPlus } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

/** Column masonry: every photo keeps its own aspect ratio, so nothing in the frame is cropped. */
export function Masonry({ items, alt, className }: { items: Photo[]; alt: string; className?: string }) {
  const lb = useLightbox(items.length);

  return (
    <>
      <div className={cn("columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4", className)}>
        {items.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            onClick={() => lb.open(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.6, delay: (i % 4) * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-[1.6rem] bg-mist shadow-soft ring-1 ring-line sm:mb-4"
            aria-label={p.caption ?? `${alt} ${i + 1}`}
          >
            <Image
              src={p.src}
              alt={p.caption ?? `${alt} ${i + 1}`}
              width={p.w}
              height={p.h}
              sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw"
              className="h-auto w-full transition duration-700 group-hover:scale-[1.04]"
            />
            <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-soft transition group-hover:opacity-100">
              <MagnifyingGlassPlus weight="bold" className="size-5" />
            </span>
            {p.caption && (
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 font-display text-sm font-bold text-ink shadow-soft backdrop-blur">{p.caption}</span>
            )}
          </motion.button>
        ))}
      </div>
      <Lightbox items={items} alt={alt} {...lb} />
    </>
  );
}
