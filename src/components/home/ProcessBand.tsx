"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import { Broom, ClipboardText, MagnifyingGlass, Scales, SealCheck } from "@phosphor-icons/react/ssr";
import { Eyebrow } from "@/components/ui/Section";
import { FieldMonitor } from "@/components/visuals/FieldMonitor";
import { ScrollSequence, useSequence } from "@/components/sequence/ScrollSequence";
import type { PageBlocks } from "@/db/seed/blocks";
import type { Locale } from "@/i18n/config";
import { sequences } from "@/lib/sequences";
import { cn } from "@/lib/cn";

const icons = [ClipboardText, Broom, MagnifyingGlass, Scales, SealCheck];
const ease = [0.16, 1, 0.3, 1] as const;

type Text = { eyebrow: string; title: string; lead: string; recMt: string; recPt: string; steps: { t: string; d: string }[] };

// Real field footage shown beside the scenes it proves (inspection: MT, evaluation: PT)
const monitors: Record<number, { src: string; poster: string; label: keyof Pick<Text, "recMt" | "recPt">; tone?: string }> = {
  2: { src: "/media/video/mt-field.mp4", poster: "/media/methods/mt-6.jpg", label: "recMt" },
  3: { src: "/media/video/pt-field.mp4", poster: "/media/methods/pt-1.jpg", label: "recPt", tone: "#ff8796" },
};

/** The inspection route over the process video: one step per scene, the route track filling as the part moves on. */
export function ProcessBand({ lang, process: p }: { lang: Locale; process: PageBlocks["home"]["process"] }) {
  const t: Text = { eyebrow: p.eyebrow[lang], title: p.title[lang], lead: p.lead[lang], recMt: p.recMt[lang], recPt: p.recPt[lang], steps: p.steps.map((s) => ({ t: s.t[lang], d: s.d[lang] })) };
  return (
    <ScrollSequence spec={sequences.process} id="proceso">
      <Stage t={t} />
      <Stacked t={t} />
    </ScrollSequence>
  );
}

function Stage({ t }: { t: Text }) {
  const { stage, stages, progress, goTo } = useSequence();
  const track = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(progress, "change", (v) => {
    // The track reaches each node at the middle of its scene
    const p = Math.min(1, Math.max(0, (Math.min(0.9999, Math.max(0, v)) * stages - 0.5) / (stages - 1)));
    if (track.current) track.current.style.transform = `scaleX(${p})`;
  });
  const step = t.steps[Math.min(stage, t.steps.length - 1)];
  const monitor = monitors[stage];

  return (
    <div className="relative mx-auto hidden h-full w-full max-w-[90rem] flex-col justify-between px-12 pb-[6vh] pt-[16vh] lg:flex">
      <div className="max-w-xl">
        <Eyebrow tone="onImage">{t.eyebrow}</Eyebrow>
        <h2 className="mt-5 text-balance text-[clamp(2.3rem,min(4vw,6.4vh),3.9rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">{t.title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-white/75 [@media(max-height:820px)]:hidden">{t.lead}</p>
      </div>

      <div>
        <div className="grid grid-cols-12 items-end gap-10">
          <div className="col-span-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={stage} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.5, ease }}>
                <span className={cn("font-mono text-sm font-bold tracking-[0.22em]", stage === stages - 1 ? "text-lime" : "text-neon")}>
                  {String(stage + 1).padStart(2, "0")} / {String(stages).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-[clamp(2rem,min(3.4vw,6vh),3.1rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">{step.t}</h3>
                <p className="mt-3 max-w-[42ch] text-[1.1rem] leading-relaxed text-white/75">{step.d}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="col-span-4 col-start-9 min-h-px">
            <AnimatePresence mode="wait">
              {monitor && (
                <motion.div key={monitor.src} initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.55, ease }}>
                  <FieldMonitor src={monitor.src} poster={monitor.poster} label={t[monitor.label]} tone={monitor.tone} className="bg-black/40 backdrop-blur-md" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Route: the original five-step track, now a progress rail */}
        <div className="relative mt-[5vh]">
          <span aria-hidden className="absolute left-[10%] right-[10%] top-8 h-0.5 bg-white/15" />
          <span aria-hidden ref={track} className="absolute left-[10%] right-[10%] top-8 h-0.5 origin-left bg-gradient-to-r from-neon via-neon to-lime" style={{ transform: "scaleX(0)" }} />
          <ol className="relative grid grid-cols-5 gap-4">
            {t.steps.map((s, i) => {
              const Icon = icons[i];
              const last = i === t.steps.length - 1;
              const on = i === stage;
              const done = i < stage;
              return (
                <li key={s.t}>
                  <button type="button" onClick={() => goTo(i)} aria-current={on ? "step" : undefined} className="group flex w-full flex-col items-center text-center">
                    <span
                      className={cn(
                        "relative grid size-16 place-items-center rounded-full ring-1 backdrop-blur-md transition-all duration-500",
                        on && (last ? "bg-lime text-[#071a2e] ring-lime shadow-[0_0_32px_-4px_var(--color-lime)]" : "bg-neon text-[#071a2e] ring-neon shadow-[0_0_32px_-4px_var(--color-neon)]"),
                        done && "bg-neon/15 text-neon ring-neon/50",
                        !on && !done && "bg-white/5 text-white/55 ring-white/20 group-hover:text-white",
                      )}
                    >
                      <Icon weight="duotone" className="size-8" />
                      <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-white font-mono text-[0.68rem] font-bold text-[#071a2e]">{i + 1}</span>
                    </span>
                    <span className={cn("mt-3 text-[0.95rem] font-extrabold leading-tight tracking-tight transition-colors", on ? "text-white" : "text-white/50 group-hover:text-white/80")}>{s.t}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Stacked({ t }: { t: Text }) {
  return (
    <div className="relative px-5 py-24 sm:px-8 lg:hidden">
      <Eyebrow tone="onImage">{t.eyebrow}</Eyebrow>
      <h2 className="mt-6 text-balance text-[clamp(2.3rem,7vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">{t.title}</h2>
      <p className="mt-5 text-lg leading-relaxed text-white/80">{t.lead}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <FieldMonitor src={monitors[2].src} poster={monitors[2].poster} label={t.recMt} />
        <FieldMonitor src={monitors[3].src} poster={monitors[3].poster} label={t.recPt} tone={monitors[3].tone} />
      </div>
      <ol className="relative mt-12 space-y-7">
        <span aria-hidden className="absolute bottom-6 left-8 top-6 w-0.5 bg-gradient-to-b from-neon via-neon to-lime" />
        {t.steps.map((s, i) => {
          const Icon = icons[i];
          const last = i === t.steps.length - 1;
          return (
            <li key={s.t} className="relative flex gap-4">
              <span className={cn("relative grid size-16 shrink-0 place-items-center rounded-full ring-1 backdrop-blur-md", last ? "bg-lime text-[#071a2e] ring-lime" : "bg-[#071a2e] text-neon ring-white/30")}>
                <Icon weight="duotone" className="size-8" />
                <span className="absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-white font-mono text-[0.68rem] font-bold text-[#071a2e]">{i + 1}</span>
              </span>
              <span className="pt-2">
                <span className="block text-xl font-extrabold leading-tight tracking-tight text-white">{s.t}</span>
                <span className="mt-1.5 block leading-relaxed text-white/75">{s.d}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
