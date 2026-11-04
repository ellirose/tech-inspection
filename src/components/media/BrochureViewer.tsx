"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowsOut, DownloadSimple, ShareNetwork } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

export type ViewerBrochure = {
  key: string;
  name: string;
  tagline: string;
  pdf: string;
  pdfMb: number;
  pages: { title: string; summary: string; src: string; thumb: string }[];
};

type Text = { pages: string; download: string; share: string; copied: string; contents: string; prev: string; next: string; fullscreen: string; page: string };

const W = 1920;
const H = 1080;

/**
 * Brochures as a slide viewer: tabs per brochure, a 16:9 stage with arrows, swipe and keyboard, a
 * contents list naming every page, a thumbnail rail, full screen, and the PDF download. The position
 * lives in the hash (#ndt-3), so a shared link opens on the same page.
 */
export function BrochureViewer({ brochures, t }: { brochures: ViewerBrochure[]; t: Text }) {
  const [b, setB] = useState(0);
  const [p, setP] = useState(0);
  const [copied, setCopied] = useState(false);
  const rail = useRef<HTMLDivElement>(null);
  const swipe = useRef<number | null>(null);
  const brochure = brochures[b];
  const page = brochure.pages[p];
  const count = brochure.pages.length;
  const items: Photo[] = brochure.pages.map((pg) => ({ src: pg.src, w: W, h: H, caption: pg.title }));
  const lb = useLightbox(count);
  // The lightbox steps on its own (arrows, keys); the stage follows it
  if (lb.index !== null && lb.index !== p) setP(lb.index);

  // Open on the page named in the hash
  useEffect(() => {
    const m = location.hash.match(/^#([a-z]+)-(\d+)$/);
    if (!m) return;
    const bi = brochures.findIndex((x) => x.key === m[1]);
    if (bi < 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
    setB(bi);
    setP(Math.min(brochures[bi].pages.length - 1, Math.max(0, Number(m[2]) - 1)));
  }, [brochures]);

  useEffect(() => {
    history.replaceState(null, "", `#${brochure.key}-${p + 1}`);
    rail.current?.querySelector<HTMLElement>(`[data-i="${p}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [brochure.key, p]);

  const go = (i: number) => setP((i + count) % count);
  const pick = (i: number) => {
    setB(i);
    setP(0);
  };

  const share = async () => {
    const url = location.href;
    const text = `${brochure.name} · ${page.title}`;
    if (navigator.share) {
      await navigator.share({ title: text, url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Brochure tabs */}
      <div role="tablist" className="flex flex-wrap gap-2">
        {brochures.map((x, i) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={i === b}
            onClick={() => pick(i)}
            className={cn(
              "flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-left font-bold transition",
              i === b ? "bg-brand-600 text-white shadow-float dark:bg-corp-blue" : "bg-surface text-ink-soft ring-1 ring-line hover:text-ink",
            )}
          >
            {x.name}
            <span className={cn("whitespace-nowrap rounded-full px-3 py-1 font-mono text-xs", i === b ? "bg-white/15" : "bg-tint text-mute")}>
              {x.pages.length} {t.pages}
            </span>
          </button>
        ))}
      </div>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-soft">{brochure.tagline}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {/* Stage */}
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label={brochure.name}
            tabIndex={0}
            onKeyDown={(e) => {
              if (lb.index !== null) return;
              if (e.key === "ArrowRight") go(p + 1);
              if (e.key === "ArrowLeft") go(p - 1);
            }}
            onPointerDown={(e) => (swipe.current = e.clientX)}
            onPointerUp={(e) => {
              if (swipe.current === null) return;
              const dx = e.clientX - swipe.current;
              swipe.current = null;
              if (Math.abs(dx) > 50) go(p + (dx < 0 ? 1 : -1));
            }}
            className="group relative aspect-video touch-pan-y overflow-hidden rounded-[2rem] bg-[#02070d] shadow-float ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-neon sm:rounded-[2.5rem]"
          >
            <AnimatePresence initial={false}>
              <motion.div key={page.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                <Image src={page.src} alt={`${page.title}. ${page.summary}`} fill priority={p === 0} sizes="(min-width:1024px) 70vw, 100vw" quality={90} className="object-contain" draggable={false} />
              </motion.div>
            </AnimatePresence>
            {/* Next page warms up in the background */}
            <Image src={brochure.pages[(p + 1) % count].src} alt="" fill sizes="(min-width:1024px) 70vw, 100vw" quality={90} loading="eager" className="invisible" aria-hidden />

            <button type="button" onClick={() => go(p - 1)} aria-label={t.prev} className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 sm:grid place-items-center rounded-full bg-white/90 text-[#071a2e] shadow-soft transition hover:scale-105 sm:left-5 sm:size-14">
              <ArrowLeft weight="bold" className="size-5" />
            </button>
            <button type="button" onClick={() => go(p + 1)} aria-label={t.next} className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 sm:grid place-items-center rounded-full bg-white/90 text-[#071a2e] shadow-soft transition hover:scale-105 sm:right-5 sm:size-14">
              <ArrowRight weight="bold" className="size-5" />
            </button>
            <span className="absolute bottom-5 left-5 hidden rounded-full bg-white/90 px-4 py-1.5 font-mono text-sm font-bold text-[#071a2e] sm:block">
              {String(p + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => lb.open(p)} aria-label={t.fullscreen} className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/90 text-[#071a2e] transition hover:scale-110 sm:bottom-5 sm:right-5 sm:size-12">
              <ArrowsOut weight="bold" className="size-5" />
            </button>
          </div>

          {/* Phones: pager under the stage */}
          <div className="mt-3 flex items-center justify-between sm:hidden">
            <button type="button" onClick={() => go(p - 1)} aria-label={t.prev} className="grid size-11 place-items-center rounded-full bg-surface text-ink ring-1 ring-line">
              <ArrowLeft weight="bold" className="size-5" />
            </button>
            <span className="font-mono text-sm font-bold text-ink">
              {String(p + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => go(p + 1)} aria-label={t.next} className="grid size-11 place-items-center rounded-full bg-surface text-ink ring-1 ring-line">
              <ArrowRight weight="bold" className="size-5" />
            </button>
          </div>

          {/* What this page says, as text */}
          <div aria-live="polite" className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">
                {t.page} {p + 1}
              </p>
              <h3 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">{page.title}</h3>
              <p className="mt-1.5 max-w-2xl leading-relaxed text-ink-soft">{page.summary}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <a href={brochure.pdf} download className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-5 font-bold text-white transition hover:bg-brand-500 dark:bg-corp-blue dark:hover:bg-corp-steel">
                <DownloadSimple weight="bold" className="size-5" />
                {t.download}
                <span className="font-mono text-xs opacity-75">{brochure.pdfMb.toLocaleString()} MB</span>
              </a>
              <button type="button" onClick={share} className="inline-flex h-12 items-center gap-2 rounded-full bg-surface px-5 font-bold text-ink ring-1 ring-line transition hover:ring-accent/40">
                <ShareNetwork weight="bold" className="size-5 text-accent" />
                {copied ? t.copied : t.share}
              </button>
            </div>
          </div>

          {/* Thumbnails */}
          <div ref={rail} className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {brochure.pages.map((pg, i) => (
              <button
                key={pg.thumb}
                type="button"
                data-i={i}
                onClick={() => setP(i)}
                aria-label={`${t.page} ${i + 1}: ${pg.title}`}
                aria-current={i === p ? "true" : undefined}
                className={cn("relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl ring-2 transition sm:w-44", i === p ? "ring-neon" : "opacity-60 ring-transparent hover:opacity-100")}
              >
                <Image src={pg.thumb} alt="" fill sizes="11rem" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Contents */}
        <nav aria-label={t.contents} className="hidden self-start rounded-[2rem] bg-surface p-5 shadow-card ring-1 ring-line lg:block">
          <p className="px-2 font-mono text-xs font-bold uppercase tracking-[0.16em] text-mute">{t.contents}</p>
          <ol className="mt-3 space-y-1">
            {brochure.pages.map((pg, i) => (
              <li key={pg.src}>
                <button
                  type="button"
                  onClick={() => setP(i)}
                  aria-current={i === p ? "true" : undefined}
                  className={cn("flex w-full items-start gap-3 rounded-2xl px-2 py-2 text-left transition", i === p ? "bg-tint text-ink" : "text-ink-soft hover:bg-tint/60 hover:text-ink")}
                >
                  <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full font-mono text-[0.68rem] font-bold", i === p ? "bg-neon text-[#071a2e]" : "bg-white/10 text-mute")}>{i + 1}</span>
                  <span className="text-[0.95rem] font-semibold leading-snug">{pg.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <Lightbox items={items} alt={brochure.name} index={lb.index} close={lb.close} step={lb.step} />
    </div>
  );
}
