"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

// Editorial bento: wide/tall tiles alternate; on phones the half-width tiles pair up.
const tiles = [
  "col-span-12 sm:col-span-7 row-span-2 rounded-[2rem] rounded-tl-[5rem]",
  "col-span-6 sm:col-span-5 row-span-2 rounded-[2rem]",
  "col-span-6 sm:col-span-4 row-span-2 rounded-[2rem] rounded-br-[5rem]",
  "col-span-12 sm:col-span-8 row-span-2 rounded-[2rem]",
  "col-span-6 sm:col-span-4 row-span-2 rounded-[2rem] rounded-tr-[5rem]",
  "col-span-6 sm:col-span-4 row-span-2 rounded-[2rem]",
  "col-span-12 sm:col-span-4 row-span-2 rounded-[2rem] rounded-bl-[5rem]",
];

/** Bento collage of group photos; `pos` keeps faces inside each tile's crop. */
export function Mosaic({ items, alt, className }: { items: (Photo & { pos?: string })[]; alt: string; className?: string }) {
  const lb = useLightbox(items.length);
  return (
    <>
      <div className={cn("grid auto-rows-[7.5rem] grid-cols-12 gap-3 sm:auto-rows-[10rem] sm:gap-4 lg:auto-rows-[12.5rem]", className)}>
        {items.map((p, i) => (
          <motion.button
            key={p.src}
            type="button"
            onClick={() => lb.open(i)}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.7, delay: (i % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
            className={cn("group relative overflow-hidden bg-mist shadow-lift", tiles[i % tiles.length])}
            aria-label={p.caption ?? `${alt} ${i + 1}`}
          >
            <Image src={p.src} alt={p.caption ?? `${alt} ${i + 1}`} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.04]" style={{ objectPosition: p.pos }} />
          </motion.button>
        ))}
      </div>
      <Lightbox items={items} alt={alt} {...lb} />
    </>
  );
}
