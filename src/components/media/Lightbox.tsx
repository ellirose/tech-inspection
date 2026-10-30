"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";

const noop = () => () => {};

/** Index state + keyboard handling shared by every gallery that opens the lightbox. */
export function useLightbox(count: number) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d: number) => setIndex((i) => (i === null ? i : (i + d + count) % count)), [count]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [index, close, step]);

  return { index, open: setIndex, close, step };
}

/** Full-screen viewer: the whole photo, uncropped, over a blurred copy of itself. */
export function Lightbox({ items, alt, index, close, step }: { items: Photo[]; alt: string } & Omit<ReturnType<typeof useLightbox>, "open">) {
  // The portal needs document.body, so it only mounts after hydration.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  const item = index === null ? null : items[index];

  return createPortal(
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-[80] flex flex-col bg-[#0b1533]/90 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            key={item.src}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative m-4 flex-1 sm:mx-24 sm:my-10"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={item.src} alt={item.caption ?? `${alt} ${index + 1}`} fill sizes="100vw" quality={90} className="object-contain" />
          </motion.div>
          <div className="flex items-center justify-center gap-3 px-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <span className="rounded-full bg-white px-4 py-1.5 font-mono text-sm font-bold text-[#0b1533]">
              {index + 1} / {items.length}
            </span>
            {item.caption && <span className="rounded-full bg-white/15 px-4 py-1.5 font-semibold text-white ring-1 ring-white/25">{item.caption}</span>}
          </div>
          <button type="button" onClick={close} className="absolute right-4 top-4 grid size-12 place-items-center rounded-full bg-white text-[#0b1533]" aria-label="Close">
            <X weight="bold" className="size-6" />
          </button>
          {items.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(-1); }} className="absolute left-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0b1533] sm:left-6 sm:size-14" aria-label="Previous">
                <ArrowLeft weight="bold" className="size-6" />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); step(1); }} className="absolute right-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white text-[#0b1533] sm:right-6 sm:size-14" aria-label="Next">
                <ArrowRight weight="bold" className="size-6" />
              </button>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
