"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, type MotionValue } from "motion/react";
import { useLenis } from "lenis/react";
import type { SequenceSpec } from "@/lib/sequences";
import { cue } from "@/lib/scene";
import { cn } from "@/lib/cn";
import { createFramePlayer, type FramePlayer } from "./frames";

type SequenceState = { stage: number; stages: number; progress: MotionValue<number>; goTo: (stage: number) => void };
const SequenceContext = createContext<SequenceState | null>(null);

/** Current stage and scroll progress of the enclosing ScrollSequence. */
export function useSequence() {
  const s = useContext(SequenceContext);
  if (!s) throw new Error("useSequence must be used inside a ScrollSequence");
  return s;
}

/**
 * Full-bleed video section. On desktop it pins for `spec.scroll` screens and the scroll scrubs the
 * frames, one scene per equal share; children overlay it and read the stage with useSequence().
 * On phones and tablets it does not pin: the frames loop dimmed behind content that flows normally.
 */
export function ScrollSequence({ spec, id, className, children }: { spec: SequenceSpec; id?: string; className?: string; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const player = useRef<FramePlayer | null>(null);
  const stages = spec.scenes.length;
  const [stage, setStage] = useState(0);
  const lenis = useLenis();
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  useEffect(() => {
    if (!canvas.current) return;
    const loop = matchMedia("(max-width: 1023px), (pointer: coarse)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    player.current = createFramePlayer(canvas.current, spec, { loop, reduced });
    player.current.scrub(scrollYProgress.get());
    return () => player.current?.dispose();
  }, [spec, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const p = Math.min(0.9999, Math.max(0, v));
    setStage(Math.floor(p * stages));
    player.current?.scrub(p);
  });

  // Jump to the middle of a stage (rail buttons)
  const goTo = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / stages);
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <section id={id} {...cue({ mode: "pause" })} className={cn("relative isolate", className)}>
      <div ref={wrap} className="relative lg:h-[calc(100svh_+_var(--seq-scroll))]" style={{ "--seq-scroll": `${spec.scroll * 100}svh` } as React.CSSProperties}>
        <div className="relative min-h-svh overflow-hidden lg:sticky lg:top-0 lg:h-svh">
          <canvas ref={canvas} aria-hidden className="absolute inset-0 -z-10 size-full bg-[#02070d] max-lg:brightness-[0.4] max-lg:saturate-[0.85]" />
          {/* Legibility: darker top for the heading, much darker foot for the stage text, a left wash for the text column */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(3_10_18/0.6)_0,rgb(3_10_18/0)_26%,rgb(3_10_18/0)_50%,rgb(3_10_18/0.88)_100%)]" />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden bg-gradient-to-r from-[#030a12]/75 via-[#030a12]/15 to-transparent lg:block" />
          {/* Soft edges so the section melts into the scene above and below */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#030a12] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-[#030a12] to-transparent" />
          <SequenceContext.Provider value={{ stage, stages, progress: scrollYProgress, goTo }}>{children}</SequenceContext.Provider>
        </div>
      </div>
    </section>
  );
}

/** Progress rail: one bar per stage, the active one filling with the scroll. */
export function SequenceRail({ labels, colors, className }: { labels: string[]; colors?: string[]; className?: string }) {
  const { stage, stages, progress, goTo } = useSequence();
  const fill = useRef<(HTMLSpanElement | null)[]>([]);
  useMotionValueEvent(progress, "change", (v) => {
    const p = Math.min(0.9999, Math.max(0, v)) * stages;
    fill.current.forEach((el, i) => el && (el.style.transform = `scaleX(${Math.min(1, Math.max(0, p - i))})`));
  });
  return (
    <ol className={cn("pointer-events-auto flex gap-2", className)}>
      {labels.map((label, i) => (
        <li key={label} className="min-w-0 flex-1">
          <button type="button" onClick={() => goTo(i)} className="group block w-full pt-2 text-left" aria-current={i === stage ? "step" : undefined}>
            <span className="relative block h-1 overflow-hidden rounded-full bg-white/15">
              <span
                ref={(el) => {
                  fill.current[i] = el;
                }}
                className="absolute inset-0 origin-left rounded-full"
                style={{ backgroundColor: colors?.[i] ?? "var(--color-neon)", transform: "scaleX(0)" }}
              />
            </span>
            <span className={cn("mt-2.5 block truncate font-mono text-[0.72rem] font-bold uppercase tracking-[0.16em] transition", i === stage ? "text-white" : "text-white/45 group-hover:text-white/75")}>{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
