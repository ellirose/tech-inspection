"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, MagnifyingGlassPlus, X } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/cn";

const shapes = ["rounded-[2rem]", "rounded-[2rem] rounded-tr-[5rem]", "rounded-full", "shape-leaf", "rounded-[2rem] rounded-bl-[5rem]", "shape-arch"];

/** Mixed-shape photo grid with an accessible lightbox. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <motion.button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 4) * 0.06, duration: 0.6 }}
            className={cn("group relative aspect-square overflow-hidden bg-mist shadow-soft", shapes[i % shapes.length])}
            aria-label={`${alt} ${i + 1}`}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 grid place-items-center bg-brand-900/0 opacity-0 transition group-hover:bg-brand-900/30 group-hover:opacity-100">
              <MagnifyingGlassPlus weight="bold" className="size-10 text-white" />
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <motion.div key={open} initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image src={images[open]} alt={`${alt} ${open + 1}`} fill sizes="100vw" className="rounded-3xl object-contain" quality={90} />
            </motion.div>
            <button type="button" onClick={close} className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white text-ink" aria-label="Close">
              <X weight="bold" className="size-6" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-4 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white text-ink" aria-label="Previous">
              <ArrowLeft weight="bold" className="size-6" />
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-4 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white text-ink" aria-label="Next">
              <ArrowRight weight="bold" className="size-6" />
            </button>
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 font-mono text-sm font-bold text-ink">
              {open + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
