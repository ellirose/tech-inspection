"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Muted looping backdrop video. Loads and plays only while on screen, and stays on its poster when
 * the visitor prefers reduced motion. The poster is an optimized, lazily loaded image under the video
 * (not the video's own poster attribute, which the browser downloads at full size right away);
 * `preload` for a poster at the top of the page. Place it in a positioned container.
 */
export function BackgroundVideo({ src, poster, className, sizes = "(min-width:1024px) 45vw, 100vw", preload = false }: { src: string; poster: string; className?: string; sizes?: string; preload?: boolean }) {
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

  return (
    <>
      <Image src={poster} alt="" fill sizes={sizes} preload={preload} aria-hidden className={cn("pointer-events-none object-cover", className)} />
      <video ref={ref} src={src} muted loop playsInline preload="none" aria-hidden className={cn("pointer-events-none object-cover", className)} />
    </>
  );
}
