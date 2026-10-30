"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Muted looping backdrop video. Loads and plays only while on screen, and stays on its
 * poster when the visitor prefers reduced motion.
 */
export function BackgroundVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => (visible && !mq.matches ? v.play().catch(() => {}) : v.pause());
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(v);
    mq.addEventListener("change", sync);
    return () => {
      io.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, []);

  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden className={cn("pointer-events-none object-cover", className)} />;
}
