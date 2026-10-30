"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Certificate, ShieldCheck, Ruler } from "@phosphor-icons/react/ssr";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { Waveform } from "@/components/visuals/Waveform";
import { Seal } from "@/components/visuals/Seal";

const ease = [0.16, 1, 0.3, 1] as const;

/** Offset that follows the pointer; larger depth moves further, so layers separate. */
function useParallax(sx: MotionValue<number>, sy: MotionValue<number>, depth: number) {
  return { x: useTransform(sx, [-0.5, 0.5], [-depth, depth]), y: useTransform(sy, [-0.5, 0.5], [-depth, depth]) };
}

export type HeroVisualText = { wall: string; indication: string; live: string; personnel: string; bitAlt: string };

/**
 * An arch-shaped rig video with an "inspection lens" over a PDC bit: the lens draws a glowing
 * MT indication while ultrasonic rings pulse out from it. Readouts float at different depths.
 */
export function HeroVisual({ t }: { t: HeroVisualText }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 18 });
  const sy = useSpring(my, { stiffness: 110, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-6, 6]);
  const rotX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const near = useParallax(sx, sy, 34);
  const mid = useParallax(sx, sy, 20);
  const far = useParallax(sx, sy, 10);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <div className="perspective relative size-full" onPointerMove={onMove} onPointerLeave={() => (mx.set(0), my.set(0))}>
      {/* Ultrasonic rings pulsing out from the lens */}
      <div aria-hidden className="pointer-events-none absolute left-[30%] top-[64%] -z-10">
        {[0, 1.6, 3.2].map((d) => (
          <span key={d} className="absolute -left-[22rem] -top-[22rem] size-[44rem] animate-sonar rounded-full border-2 border-neon/50 motion-reduce:hidden" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>

      {/* Arch video */}
      <motion.div
        style={{ rotateY: rotY, rotateX: rotX, ...far }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease }}
        className="preserve-3d absolute bottom-[4%] right-0 top-0 w-[66%]"
      >
        <div className="relative size-full overflow-hidden rounded-b-[3rem] rounded-t-[999px] bg-brand-900 shadow-float ring-[6px] ring-surface">
          <BackgroundVideo src="/media/video/rig-hero.mp4" poster="/media/video/rig-hero.jpg" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-brand-950/10" />
          <div className="absolute inset-x-0 top-0 h-1/3 animate-scan motion-reduce:hidden">
            <div className="h-full bg-gradient-to-b from-transparent via-neon/10 to-neon/25" />
            <div className="h-0.5 bg-neon shadow-[0_0_16px_3px_rgb(31_200_245/0.7)]" />
          </div>
          <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-mono text-xs font-bold tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur-md">
            <span className="size-2 animate-pulse rounded-full bg-lime" /> OIL &amp; GAS · CO
          </div>
        </div>
      </motion.div>

      {/* Inspection lens over the PDC bit */}
      <motion.div
        style={near}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.35, ease }}
        className="absolute left-[4%] top-[38%] aspect-square w-[50%]"
      >
        <div className="absolute -inset-[7%] animate-orbit rounded-full border-2 border-dashed border-neon/60 motion-reduce:animate-none" />
        <div className="relative size-full overflow-hidden rounded-full bg-brand-900 shadow-float ring-8 ring-surface">
          <Image src="/media/deck/pdc-bit.jpg" alt={t.bitAlt} fill preload sizes="(min-width:1024px) 24vw, 0px" className="scale-[1.35] object-cover object-[40%_45%]" quality={90} />
          <div className="absolute inset-0 bg-brand-950/25" />
          <MethodOverlay method="mt" />
          {/* Crosshair ticks */}
          <span className="absolute left-1/2 top-3 h-4 w-0.5 -translate-x-1/2 bg-white/80" />
          <span className="absolute bottom-3 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-white/80" />
          <span className="absolute left-3 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/80" />
          <span className="absolute right-3 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-white/80" />
        </div>
        <div className="glass absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full py-1.5 pl-1.5 pr-4 shadow-float ring-1 ring-line/70">
          <span className="rounded-full bg-mt px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-widest text-[#071a2e]">MT · UV</span>
          <span className="text-sm font-bold text-ink">{t.indication}</span>
        </div>
      </motion.div>

      {/* UT readout */}
      <motion.div
        style={mid}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease }}
        className="glass absolute left-0 top-[6%] w-[min(17rem,42%)] rounded-[1.75rem] p-4 shadow-float ring-1 ring-line/70"
      >
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-ut/15 px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-widest text-[#0784b8] dark:text-ut">UT · 5 MHz</span>
          <span className="flex items-center gap-1.5 font-mono text-[0.7rem] font-bold uppercase text-mute">
            <span className="size-1.5 animate-pulse rounded-full bg-ut" />
            {t.live}
          </span>
        </div>
        <Waveform className="mt-2 h-14 w-full" color="#0aa6e6" />
        <div className="mt-1.5 flex items-end justify-between gap-3">
          <span className="text-sm font-semibold leading-tight text-ink-soft">{t.wall}</span>
          <span className="text-3xl font-extrabold tracking-tight text-ink">
            12.7<span className="ml-1 text-base font-bold text-mute">mm</span>
          </span>
        </div>
      </motion.div>

      {/* Credential seal, straddling the arch */}
      <motion.div
        style={near}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className="absolute -right-3 -top-2 hidden w-32 rounded-full bg-surface/85 p-1 shadow-float backdrop-blur-md xl:block 2xl:w-36"
        aria-hidden
      >
        <Seal ring={`ASNT · ${t.personnel.toUpperCase()} · `} code="ASNT" spin />
      </motion.div>

      {/* Management system and calibration badges */}
      <motion.ul
        style={mid}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease }}
        className="glass absolute -right-2 top-[44%] flex flex-col gap-1.5 rounded-[1.5rem] p-2.5 shadow-float ring-1 ring-line/70"
      >
        {[
          { icon: Certificate, label: "ISO 9001" },
          { icon: ShieldCheck, label: "ISO 45001" },
          { icon: Ruler, label: "ISO/IEC 17025" },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2 font-mono text-[0.8rem] font-bold text-ink">
            <Icon weight="duotone" className="size-6 text-accent" />
            {label}
          </li>
        ))}
      </motion.ul>
    </div>
  );
}
