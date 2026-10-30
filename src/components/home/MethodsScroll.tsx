"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { MethodKey } from "@/content/methods";
import { MethodGlyph } from "@/components/ui/Icons";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { Eyebrow, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

export type MethodCard = { key: MethodKey; slug: string; code: string; name: string; tagline: string; cover: string; detects: string[]; steps: string[] };

const tone: Record<MethodKey, { hex: string; chip: string }> = {
  vt: { hex: "#f5a524", chip: "bg-vt/15 text-[#b46f00] dark:text-vt" },
  mt: { hex: "#7ad62a", chip: "bg-mt/15 text-[#3f8a07] dark:text-mt" },
  pt: { hex: "#ef3e57", chip: "bg-pt/12 text-pt" },
  ut: { hex: "#1fb3ee", chip: "bg-ut/15 text-[#0784b8] dark:text-ut" },
};

type Text = { eyebrow: string; title: string; lead: string; step: string; detects: string; details: string };

/**
 * Scroll-driven showcase (desktop): as the visitor scrolls, the stage swaps method, photo and
 * animated overlay, and the method's four steps light up in turn. Phones get stacked cards.
 */
export function MethodsScroll({ items, t, base }: { items: MethodCard[]; t: Text; base: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const scaled = Math.min(0.9999, Math.max(0, v)) * items.length;
    setActive(Math.floor(scaled));
    setStep(Math.min(3, Math.floor((scaled % 1) * 4)));
  });

  const m = items[active];

  return (
    <>
      {/* Desktop: scrollytelling */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${items.length * 75 + 30}vh` }}>
        <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-24">
          <div className="mx-auto grid w-full max-w-[90rem] grid-cols-12 gap-10 px-12">
            <div className="col-span-5 flex flex-col justify-center">
              <Eyebrow className="self-start">{t.eyebrow}</Eyebrow>
              <h2 className="mt-5 text-balance text-[clamp(2.3rem,min(4vw,6.4vh),3.9rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink">{t.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft [@media(max-height:860px)]:hidden">{t.lead}</p>
              <ol className="mt-[3.5vh] space-y-2">
                {items.map((it, i) => {
                  const on = i === active;
                  return (
                    <li key={it.key}>
                      <div className={cn("relative overflow-hidden rounded-[1.75rem] px-5 py-[1.3vh] transition-all duration-500", on ? "bg-surface shadow-card ring-1 ring-line" : "opacity-55")}>
                        <div className="flex items-center gap-4">
                          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl transition", on ? tone[it.key].chip : "bg-mist text-mute")}>
                            <MethodGlyph name={it.key} className="size-8" />
                          </span>
                          <span className="text-[1.5rem] font-extrabold leading-tight tracking-tight text-ink">{it.name}</span>
                          <span className="ml-auto font-mono text-sm font-bold text-mute">{it.code}</span>
                        </div>
                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                              <p className="pt-3 text-[1.05rem] leading-relaxed text-ink-soft">{it.tagline}</p>
                              <Link href={`${base}/${it.slug}`} className="mt-3 inline-flex items-center gap-2 font-bold text-accent transition-all hover:gap-3">
                                {t.details} <ArrowRight weight="bold" className="size-4" />
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {on && <motion.span layoutId="method-bar" className="absolute inset-y-4 left-0 w-1.5 rounded-r-full" style={{ backgroundColor: tone[it.key].hex }} />}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="col-span-7 flex items-center">
              <div className="relative mx-auto aspect-[1.08] max-h-[68vh] w-full max-w-[calc(68vh*1.08)]">
                <div className="absolute inset-0 overflow-hidden rounded-[3rem] rounded-tr-[8rem] bg-brand-900 shadow-float">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={m.key} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                      <Image src={m.cover} alt={m.name} fill sizes="55vw" className="object-cover" quality={80} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-950/55 via-brand-950/10 to-transparent" />
                      <MethodOverlay method={m.key} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute left-7 top-7 flex items-center gap-3">
                    <span className="rounded-full bg-white/90 px-4 py-2 font-mono text-sm font-bold tracking-widest text-[#071a2e] backdrop-blur">
                      {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    <span className="rounded-full px-4 py-2 font-mono text-sm font-bold tracking-widest text-[#071a2e]" style={{ backgroundColor: tone[m.key].hex }}>
                      {m.code}
                    </span>
                  </div>
                  {/* What it finds */}
                  <AnimatePresence mode="wait">
                    <motion.div key={m.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="glass absolute right-7 top-7 max-w-[15rem] rounded-2xl p-3.5 shadow-float ring-1 ring-white/40">
                      <p className="flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest text-mute">
                        <MagnifyingGlass weight="bold" className="size-3.5" /> {t.detects}
                      </p>
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {m.detects.map((d) => (
                          <li key={d} className="rounded-full bg-surface px-2.5 py-1 text-[0.82rem] font-bold text-ink">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Steps of the active method */}
                <div className="absolute -bottom-8 -left-8 right-20 grid grid-cols-4 gap-2.5">
                  {m.steps.map((st, i) => (
                    <motion.div
                      key={`${m.key}-${i}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn("rounded-[1.4rem] p-3.5 transition-all duration-500", i <= step ? "bg-surface shadow-card ring-1 ring-line" : "glass opacity-80")}
                    >
                      <span className="font-mono text-[0.7rem] font-bold uppercase tracking-widest text-mute">
                        {t.step} {i + 1}
                      </span>
                      <p className="mt-1 text-lg font-extrabold leading-tight text-ink">{st}</p>
                      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-mist">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: tone[m.key].hex }} animate={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }} transition={{ duration: 0.5 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phones and tablets: stacked cards */}
      <div className="relative px-5 py-24 sm:px-8 lg:hidden">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <div className="mt-12 space-y-8">
          {items.map((it, i) => (
            <article key={it.key} className={cn("overflow-hidden bg-surface shadow-card ring-1 ring-line", i % 2 ? "rounded-[2rem] rounded-tl-[4rem]" : "rounded-[2rem] rounded-tr-[4rem]")}>
              <div className="relative aspect-[4/3] bg-brand-900">
                <Image src={it.cover} alt={it.name} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent" />
                <MethodOverlay method={it.key} />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-14 place-items-center rounded-2xl", tone[it.key].chip)}>
                    <MethodGlyph name={it.key} className="size-8" />
                  </span>
                  <h3 className="text-2xl font-extrabold tracking-tight text-ink">{it.name}</h3>
                </div>
                <p className="mt-3 text-ink-soft">{it.tagline}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {it.detects.map((d) => (
                    <li key={d} className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-ink">
                      {d}
                    </li>
                  ))}
                </ul>
                <Link href={`${base}/${it.slug}`} className="mt-5 inline-flex items-center gap-2 font-bold text-accent">
                  {t.details} <ArrowRight weight="bold" className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
