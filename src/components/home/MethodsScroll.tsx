"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowRight, Check } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { methodTone, type MethodKey } from "@/content/methods";
import { MethodGlyph } from "@/components/ui/Icons";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { Eyebrow, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

export type MethodCard = {
  key: MethodKey;
  slug: string;
  code: string;
  name: string;
  tagline: string;
  cover: string;
  steps: { title: string; text: string }[];
  advantages: string[];
};

const chip: Record<MethodKey, string> = {
  mt: "bg-mt-soft text-[#3f8a07]",
  pt: "bg-pt-soft text-pt",
  ut: "bg-ut-soft text-[#0784b8]",
  vt: "bg-vt-soft text-[#b46f00]",
};

/**
 * Sticky scroll-driven showcase (desktop): the stage swaps method, photo and animated
 * overlay as the visitor scrolls; each method's four steps light up in sequence.
 * On small screens it falls back to stacked cards.
 */
export function MethodsScroll({ lang, dict, items }: { lang: Locale; dict: Dictionary; items: MethodCard[] }) {
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
  const s = dict.methodsSection;

  return (
    <section id="metodos" className="relative bg-white">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-60 mask-fade-y" />

      {/* Desktop: scrollytelling */}
      <div ref={ref} className="relative hidden lg:block" style={{ height: `${items.length * 100 + 40}vh` }}>
        <div className="sticky top-0 flex h-svh items-center overflow-hidden pt-20">
          <div className="mx-auto grid w-full max-w-[90rem] grid-cols-12 gap-10 px-12">
            <div className="col-span-5 flex flex-col justify-center">
              <Eyebrow className="self-start">{s.eyebrow}</Eyebrow>
              <h2 className="mt-4 text-balance font-display text-[clamp(2.2rem,min(3.8vw,6vh),3.75rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ink">{s.title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-ink-soft [@media(max-height:860px)]:hidden">{s.lead}</p>
              <ol className="mt-[3.5vh] space-y-2">
                {items.map((it, i) => {
                  const on = i === active;
                  return (
                    <li key={it.key}>
                      <div
                        className={cn(
                          "relative overflow-hidden rounded-[1.75rem] px-5 py-[1.4vh] transition-all duration-500",
                          on ? "bg-canvas shadow-lift ring-1 ring-line" : "opacity-55",
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl transition", on ? chip[it.key] : "bg-mist text-mute")}>
                            <MethodGlyph name={it.key} className="size-8" />
                          </span>
                          <span className="font-display text-[1.6rem] font-bold leading-tight tracking-tight text-ink">{it.name}</span>
                          <span className="ml-auto font-mono text-sm font-bold text-mute">{it.code}</span>
                        </div>
                        <AnimatePresence initial={false}>
                          {on && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                              <p className="pt-3 text-[1.05rem] leading-relaxed text-ink-soft">{it.tagline}</p>
                              <Link href={`/${lang}/metodos/${it.slug}`} className="mt-3 inline-flex items-center gap-2 font-display font-bold text-brand-700 hover:gap-3 transition-all">
                                {dict.cta.details} <ArrowRight weight="bold" className="size-4" />
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {on && (
                          <motion.span
                            layoutId="method-bar"
                            className="absolute inset-y-4 left-0 w-1.5 rounded-r-full"
                            style={{ backgroundColor: methodTone[it.key].hex }}
                          />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="col-span-7 flex items-center">
              <div className="relative mx-auto aspect-[1.08] max-h-[70vh] w-full max-w-[calc(70vh*1.08)]">
                {/* Stage */}
                <div className="absolute inset-0 overflow-hidden rounded-[3rem] rounded-tr-[7rem] bg-brand-900 shadow-float">
                  <AnimatePresence mode="popLayout">
                    <motion.div key={m.key} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                      <Image src={m.cover} alt={m.name} fill sizes="55vw" className="object-cover" quality={80} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/55 via-brand-900/10 to-transparent" />
                      <MethodOverlay method={m.key} />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute left-7 top-7 flex items-center gap-3">
                    <span className="rounded-full bg-white/90 px-4 py-2 font-mono text-sm font-bold tracking-widest text-ink backdrop-blur">
                      {String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                    </span>
                    <span className="rounded-full px-4 py-2 font-mono text-sm font-bold tracking-widest text-white" style={{ backgroundColor: methodTone[m.key].hex }}>
                      {m.code}
                    </span>
                  </div>
                </div>

                {/* Process steps for the active method */}
                <div className="absolute -bottom-8 -left-8 right-24 grid grid-cols-4 gap-2.5">
                  {m.steps.map((st, i) => (
                    <motion.div
                      key={`${m.key}-${i}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={cn(
                        "rounded-[1.4rem] p-3.5 transition-all duration-500",
                        i <= step ? "bg-white shadow-lift ring-1 ring-line" : "glass opacity-80",
                      )}
                    >
                      <span className="font-mono text-[0.7rem] font-bold tracking-widest text-mute">
                        {s.step} {i + 1}
                      </span>
                      <p className="mt-1 font-display text-lg font-bold leading-tight text-ink">{st.title}</p>
                      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-mist">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: methodTone[m.key].hex }} animate={{ width: i < step ? "100%" : i === step ? "60%" : "0%" }} transition={{ duration: 0.5 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="relative px-5 py-24 sm:px-8 lg:hidden">
        <SectionHeading eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
        <div className="mt-12 space-y-8">
          {items.map((it) => (
            <article key={it.key} className="overflow-hidden rounded-[2rem] bg-canvas shadow-lift ring-1 ring-line">
              <div className="relative aspect-[4/3] bg-brand-900">
                <Image src={it.cover} alt={it.name} fill sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
                <MethodOverlay method={it.key} />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-12 place-items-center rounded-2xl", chip[it.key])}>
                    <MethodGlyph name={it.key} className="size-7" />
                  </span>
                  <h3 className="font-display text-2xl font-bold text-ink">{it.name}</h3>
                </div>
                <p className="mt-3 text-ink-soft">{it.tagline}</p>
                <ul className="mt-4 space-y-2">
                  {it.advantages.slice(0, 3).map((a) => (
                    <li key={a} className="flex gap-2 text-[0.98rem] text-ink">
                      <Check weight="bold" className={cn("mt-1 size-4 shrink-0", methodTone[it.key].text)} /> {a}
                    </li>
                  ))}
                </ul>
                <Link href={`/${lang}/metodos/${it.slug}`} className="mt-5 inline-flex items-center gap-2 font-display font-bold text-brand-700">
                  {dict.cta.details} <ArrowRight weight="bold" className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
