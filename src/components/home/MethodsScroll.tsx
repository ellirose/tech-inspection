"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/ssr";
import type { MethodKey } from "@/content/methods";
import { MethodGlyph } from "@/components/ui/Icons";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { Eyebrow, SectionHeading } from "@/components/ui/Section";
import { ScrollSequence, SequenceRail, useSequence } from "@/components/sequence/ScrollSequence";
import { METHODS_SEQUENCE_ORDER, sequences } from "@/lib/sequences";
import { cn } from "@/lib/cn";

export type MethodCard = { key: MethodKey; slug: string; code: string; name: string; tagline: string; cover: string; detects: string[]; steps: string[] };

const tone: Record<MethodKey, { hex: string; chip: string }> = {
  vt: { hex: "#f5a524", chip: "bg-vt/15 text-vt" },
  mt: { hex: "#7ad62a", chip: "bg-mt/15 text-mt" },
  pt: { hex: "#ef3e57", chip: "bg-pt/15 text-pt" },
  ut: { hex: "#1fb3ee", chip: "bg-ut/15 text-ut" },
};

type Text = { eyebrow: string; title: string; lead: string; step: string; detects: string; details: string };

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The four NDT methods over the methods video: one method per scene (in the video's fixed order,
 * whatever the order in the admin), its steps lighting up as the scroll moves through the scene.
 * Phones get stacked cards over the looping video.
 */
export function MethodsScroll({ items, t, base, id }: { items: MethodCard[]; t: Text; base: string; id?: string }) {
  const ordered = METHODS_SEQUENCE_ORDER.map((k) => items.find((m) => m.key === k)).filter((m): m is MethodCard => Boolean(m));
  return (
    <ScrollSequence spec={sequences.methods} id={id}>
      <Stage items={ordered} t={t} base={base} />
      <Stacked items={ordered} t={t} base={base} />
    </ScrollSequence>
  );
}

function Stage({ items, t, base }: { items: MethodCard[]; t: Text; base: string }) {
  const { stage, stages, progress } = useSequence();
  const [sub, setSub] = useState(0);
  useMotionValueEvent(progress, "change", (v) => setSub(Math.min(3, Math.floor(((Math.min(0.9999, Math.max(0, v)) * stages) % 1) * 4))));
  const m = items[Math.min(stage, items.length - 1)];
  const hex = tone[m.key].hex;

  return (
    <div className="relative mx-auto hidden h-full w-full max-w-[90rem] flex-col justify-between px-12 pb-[7vh] pt-[16vh] lg:flex">
      <div className="max-w-xl">
        <Eyebrow tone="onImage">{t.eyebrow}</Eyebrow>
        <h2 className="mt-5 text-balance text-[clamp(2.3rem,min(4vw,6.4vh),3.9rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">{t.title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-white/75 [@media(max-height:820px)]:hidden">{t.lead}</p>
      </div>

      <div className="grid grid-cols-12 items-end gap-10">
        <div className="col-span-7 xl:col-span-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={m.key} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease }}>
              <div className="flex items-center gap-3">
                <span className={cn("grid size-14 place-items-center rounded-2xl ring-1 ring-white/10 backdrop-blur-md", tone[m.key].chip)}>
                  <MethodGlyph name={m.key} className="size-8" />
                </span>
                <span className="font-mono text-sm font-bold tracking-[0.22em]" style={{ color: hex }}>
                  {String(stage + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")} · {m.code}
                </span>
              </div>
              <h3 className="mt-4 text-[clamp(2rem,min(3.4vw,6vh),3.1rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">{m.name}</h3>
              <p className="mt-3 max-w-[46ch] text-[1.08rem] leading-relaxed text-white/75">{m.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5 [@media(max-height:760px)]:hidden">
                <span className="mr-1 flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest text-white/55">
                  <MagnifyingGlass weight="bold" className="size-3.5" /> {t.detects}
                </span>
                {m.detects.map((d) => (
                  <span key={d} className="rounded-full bg-white/10 px-2.5 py-1 text-[0.82rem] font-bold text-white ring-1 ring-white/10 backdrop-blur-md">
                    {d}
                  </span>
                ))}
              </div>
              <Link href={`${base}/${m.slug}`} className="mt-5 inline-flex items-center gap-2 font-bold transition-all hover:gap-3" style={{ color: hex }}>
                {t.details} <ArrowRight weight="bold" className="size-4" />
              </Link>
            </motion.div>
          </AnimatePresence>
          <SequenceRail className="mt-8 max-w-xl" labels={items.map((i) => i.code)} colors={items.map((i) => tone[i.key].hex)} />
        </div>

        {/* The active method's steps, lit in turn */}
        <div className="col-span-4 col-start-9">
          <div className="glass rounded-[1.75rem] p-5 ring-1 ring-white/10">
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/55">
              {m.code} · {t.step} {sub + 1}/{m.steps.length}
            </p>
            <ol className="mt-4 space-y-3">
              {m.steps.map((st, i) => {
                const on = i <= sub;
                return (
                  <li key={`${m.key}-${i}`} className="flex items-center gap-3">
                    <span
                      className={cn("grid size-8 shrink-0 place-items-center rounded-full font-mono text-xs font-bold transition-all duration-500", on ? "text-[#071a2e]" : "text-white/50 ring-1 ring-white/20")}
                      style={on ? { backgroundColor: hex, boxShadow: `0 0 18px -2px ${hex}` } : undefined}
                    >
                      {i + 1}
                    </span>
                    <span className={cn("text-[1.05rem] font-bold leading-tight transition-colors duration-500", on ? "text-white" : "text-white/45")}>{st}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stacked({ items, t, base }: { items: MethodCard[]; t: Text; base: string }) {
  return (
    <div className="relative px-5 py-24 sm:px-8 lg:hidden">
      <SectionHeading eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
      <div className="mt-12 space-y-8">
        {items.map((it, i) => (
          <article key={it.key} className={cn("overflow-hidden bg-surface shadow-card ring-1 ring-line", i % 2 ? "rounded-[2rem] rounded-tl-[4rem]" : "rounded-[2rem] rounded-tr-[4rem]")}>
            <div className="relative aspect-[4/3] bg-brand-900">
              <Image src={it.cover} alt={it.name} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
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
  );
}
