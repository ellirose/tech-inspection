"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowsOut, DownloadSimple, ShareNetwork } from "@phosphor-icons/react/ssr";
import type { Photo } from "@/lib/media";
import { Lightbox, useLightbox } from "./Lightbox";
import { cn } from "@/lib/cn";

export type ScrollBrochure = {
  key: string;
  name: string;
  tagline: string;
  pdf: string;
  pdfMb: number;
  /** Page size of the renders, [width, height]. */
  size: [number, number];
  pages: { title: string; summary: string; src: string; thumb: string }[];
};

type Text = { pages: string; page: string; download: string; share: string; copied: string; contents: string; fullscreen: string };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Brochures as one continuous scroll: every page of the chosen document stacked, with a sticky toolbar
 * (documents, progress, PDF, share) and, on wide screens, a sticky contents list that follows the
 * reading position. Pages load as they come near. The position lives in the hash (#portafolio-5), so a
 * shared link opens on the same page; a page opens full screen on click.
 */
export function BrochureScroll({ brochures, t }: { brochures: ScrollBrochure[]; t: Text }) {
  const [b, setB] = useState(0);
  const [current, setCurrent] = useState(0);
  const [copied, setCopied] = useState(false);
  const list = useRef<HTMLOListElement>(null);
  const contents = useRef<HTMLOListElement>(null);
  const brochure = brochures[b];
  const count = brochure.pages.length;
  const [w, h] = brochure.size;
  const portrait = h > w;
  const items: Photo[] = brochure.pages.map((pg) => ({ src: pg.src, w, h, caption: pg.title }));
  const lb = useLightbox(count);

  const scrollToPage = (i: number, smooth = true) =>
    list.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  // A page to jump to once its document has rendered (set from the hash on load).
  const pending = useRef<{ b: number; page: number } | null>(null);

  // Open on the document and page named in the hash.
  useEffect(() => {
    const m = location.hash.match(/^#([a-z]+)-(\d+)$/);
    if (!m) return;
    const bi = brochures.findIndex((x) => x.key === m[1]);
    if (bi < 0) return;
    pending.current = { b: bi, page: Math.min(brochures[bi].pages.length - 1, Math.max(0, Number(m[2]) - 1)) };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL once after hydration
    setB(bi);
  }, [brochures]);

  useEffect(() => {
    // Only once the hash's document is the one on screen.
    if (pending.current?.b !== b) return;
    const target = pending.current.page;
    pending.current = null;
    requestAnimationFrame(() => scrollToPage(target, false));
  }, [b, brochures]);

  // The page crossing the middle of the screen is the one being read.
  useEffect(() => {
    const pages = list.current?.querySelectorAll<HTMLElement>("[data-i]");
    if (!pages?.length) return;
    const seen = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    pages.forEach((p) => seen.observe(p));
    return () => seen.disconnect();
  }, [b]);

  // Keep the hash and the contents list in step with the reading position.
  useEffect(() => {
    history.replaceState(null, "", `#${brochure.key}-${current + 1}`);
    contents.current?.querySelector<HTMLElement>(`[data-c="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [brochure.key, current]);

  const pick = (i: number) => {
    setB(i);
    setCurrent(0);
    document.getElementById("brochure")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const share = async () => {
    const url = location.href;
    const text = `${brochure.name} · ${brochure.pages[current].title}`;
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
      {/* Toolbar: sticks under the site header. Its solid band (in the page colour, full width) also
          fills the space behind the header, so pages scroll out of sight instead of showing through. */}
      <div className="sticky top-0 z-30 bg-canvas pb-3 pt-[5.75rem] [box-shadow:0_0_0_100vmax_var(--canvas)] [clip-path:inset(0_-100vmax)]">
        <div className="rounded-[1.75rem] bg-surface p-3 shadow-card ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div role="tablist" aria-label={t.contents} className="-m-1 flex w-full gap-2 overflow-x-auto p-1 [mask-image:linear-gradient(to_right,black_82%,transparent)] sm:w-auto sm:flex-wrap sm:overflow-visible sm:[mask-image:none]">
              {brochures.map((x, i) => (
                <button
                  key={x.key}
                  type="button"
                  role="tab"
                  aria-selected={i === b}
                  onClick={() => pick(i)}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-bold transition",
                    i === b ? "bg-corp-blue text-white shadow-float ring-1 ring-white/20" : "bg-surface-2 text-ink-soft ring-1 ring-line hover:text-ink",
                  )}
                >
                  {x.name}
                </button>
              ))}
            </div>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <span className="whitespace-nowrap font-mono text-sm font-bold text-ink" aria-live="polite">
                {t.page} {pad(current + 1)} / {pad(count)}
              </span>
              <div className="flex gap-2">
                <a href={brochure.pdf} download className="inline-flex h-11 items-center gap-2 rounded-full bg-corp-blue px-4 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-corp-steel">
                  <DownloadSimple weight="bold" className="size-5" />
                  <span className="hidden sm:inline">{t.download}</span>
                  <span className="font-mono text-xs opacity-75">{brochure.pdfMb.toLocaleString()} MB</span>
                </a>
                <button type="button" onClick={share} aria-label={t.share} className="inline-flex h-11 items-center gap-2 rounded-full bg-surface-2 px-4 text-sm font-bold text-ink ring-1 ring-line transition hover:ring-neon/40">
                  <ShareNetwork weight="bold" className="size-5 text-neon" />
                  <span className="hidden md:inline">{copied ? t.copied : t.share}</span>
                </button>
              </div>
            </div>
          </div>
          {/* Reading progress */}
          <div className="mx-2 mt-3 h-1 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-neon transition-[width] duration-300" style={{ width: `${((current + 1) / count) * 100}%` }} />
          </div>
        </div>
      </div>

      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-soft">{brochure.tagline}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Contents, following the reading position */}
        <nav aria-label={t.contents} className="sticky top-[13rem] hidden max-h-[calc(100svh-14rem)] self-start overflow-y-auto rounded-[1.75rem] bg-surface p-3 ring-1 ring-line lg:block">
          <p className="px-2 pb-2 pt-1 font-mono text-xs font-bold uppercase tracking-[0.16em] text-mute">{t.contents}</p>
          <ol ref={contents} className="space-y-1">
            {brochure.pages.map((pg, i) => (
              <li key={pg.src}>
                <button
                  type="button"
                  data-c={i}
                  onClick={() => scrollToPage(i)}
                  aria-current={i === current ? "true" : undefined}
                  className={cn("flex w-full items-center gap-3 rounded-2xl p-2 text-left transition", i === current ? "bg-tint text-ink ring-1 ring-neon/30" : "text-ink-soft hover:bg-tint/60 hover:text-ink")}
                >
                  <span className={cn("relative shrink-0 overflow-hidden rounded-lg ring-1 ring-line", portrait ? "h-14 w-10" : "h-10 w-16")}>
                    <Image src={pg.thumb} alt="" fill sizes="4rem" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block font-mono text-[0.7rem] font-bold", i === current ? "text-neon" : "text-mute")}>{pad(i + 1)}</span>
                    <span className="line-clamp-2 text-[0.9rem] font-semibold leading-snug">{pg.title}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        {/* Every page, one after another */}
        <ol ref={list} key={brochure.key} className="min-w-0 space-y-10">
          {brochure.pages.map((pg, i) => (
            <li key={pg.src} id={`${brochure.key}-${i + 1}`} data-i={i} className="scroll-mt-60 sm:scroll-mt-52">
              <figure className={cn("mx-auto", portrait && "max-w-[44rem]")}>
                <button
                  type="button"
                  onClick={() => lb.open(i)}
                  aria-label={`${t.fullscreen}: ${t.page} ${i + 1}, ${pg.title}`}
                  className="group relative block w-full overflow-hidden rounded-[1.5rem] bg-white shadow-float ring-1 ring-line transition hover:ring-neon/50"
                >
                  <Image
                    src={pg.src}
                    alt={`${pg.title}. ${pg.summary}`}
                    width={w}
                    height={h}
                    priority={i === 0}
                    sizes={portrait ? "(min-width:1024px) 44rem, 100vw" : "(min-width:1024px) 60vw, 100vw"}
                    quality={90}
                    className="h-auto w-full"
                  />
                  <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-[#071a2e]/80 text-white opacity-0 ring-1 ring-white/20 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                    <ArrowsOut weight="bold" className="size-5" />
                  </span>
                </button>
                <figcaption className="mt-3 flex items-baseline gap-3 px-1">
                  <span className="font-mono text-sm font-bold text-neon">{pad(i + 1)}</span>
                  <span className="min-w-0">
                    <span className="block font-bold text-ink">{pg.title}</span>
                    <span className="block text-[0.95rem] leading-snug text-mute">{pg.summary}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ol>
      </div>

      <Lightbox items={items} alt={brochure.name} index={lb.index} close={lb.close} step={lb.step} />
    </div>
  );
}
