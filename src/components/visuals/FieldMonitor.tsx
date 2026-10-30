"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Field footage framed as an inspection monitor (REC badge, timecode, scanlines),
 * which suits the low-resolution source clips. Plays only while visible.
 */
export function FieldMonitor({ src, poster, label, className, tone = "#6fd11c" }: { src: string; poster: string; label: string; className?: string; tone?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <figure className={cn("relative overflow-hidden rounded-[2rem] bg-surface p-2.5 shadow-float ring-1 ring-line", className)}>
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem]">
        <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" className="absolute inset-0 size-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0_2px,rgb(0_0_0/0.08)_2px_3px)]" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 font-mono text-xs font-bold tracking-widest text-white backdrop-blur">
          <span className="size-2 animate-pulse rounded-full bg-pt" /> REC
        </div>
        <span className="absolute right-3 top-3 rounded-full px-3 py-1 font-mono text-xs font-bold tracking-widest text-[#071a2e]" style={{ backgroundColor: tone }}>
          {label}
        </span>
        <div className="absolute inset-3 rounded-2xl border border-white/25" />
      </div>
    </figure>
  );
}
