"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import { Certificate, HardHat, Factory } from "@phosphor-icons/react/ssr";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";

type Chip = { label: string; value: string };

/** Offset that follows the pointer; larger depth moves further, so layers separate. */
function useParallax(sx: MotionValue<number>, sy: MotionValue<number>, depth: number) {
  return { x: useTransform(sx, [-0.5, 0.5], [-depth, depth]), y: useTransform(sy, [-0.5, 0.5], [-depth, depth]) };
}

/**
 * Hero composition: the PDC bit on a tilted card that follows the pointer, orbit rings behind it,
 * a rig clip and glass chips floating at different depths.
 */
export function HeroVisual({ alt, chips, ds1, videoLabel }: { alt: string; chips: [Chip, Chip, Chip]; ds1: string; videoLabel: string }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotY = useTransform(sx, [-0.5, 0.5], [-14, 6]);
  const rotX = useTransform(sy, [-0.5, 0.5], [8, -6]);
  const p1 = useParallax(sx, sy, 18);
  const p2 = useParallax(sx, sy, 30);
  const p3 = useParallax(sx, sy, 12);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const icons = [HardHat, Factory, Certificate];

  return (
    <div className="perspective relative mx-auto aspect-square h-[min(37rem,64svh)] max-w-full" onPointerMove={onMove} onPointerLeave={() => (mx.set(0), my.set(0))}>
      {/* Orbit rings */}
      <div className="absolute inset-[2%] animate-orbit rounded-full border-2 border-dashed border-neon/35" />
      <div className="absolute inset-[13%] animate-orbit-rev rounded-full border border-brand-400/30" />
      <span className="absolute left-[8%] top-[18%] size-3 rounded-full bg-lime shadow-[0_0_18px_4px_rgb(134_227_58/0.6)]" />
      <span className="absolute bottom-[14%] right-[6%] size-2.5 rounded-full bg-neon shadow-[0_0_16px_4px_rgb(31_200_245/0.6)]" />

      {/* Main tilted card */}
      <motion.div style={{ rotateY: rotY, rotateX: rotX }} className="preserve-3d absolute inset-[16%_14%_14%_18%]">
        <div className="relative size-full overflow-hidden rounded-[2.5rem] bg-brand-900 shadow-float ring-1 ring-white/50">
          <Image src="/media/deck/pdc-bit.jpg" alt={alt} fill preload sizes="(min-width:1024px) 34vw, 80vw" className="object-cover object-[42%_50%]" quality={90} />
          <div className="absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-neon/20 to-transparent">
            <div className="absolute inset-x-0 bottom-1/2 h-0.5 bg-neon shadow-[0_0_14px_3px_rgb(31_200_245/0.7)]" />
          </div>
        </div>
        {/* DS-1 hexagon pinned to the card */}
        <div className="shape-hex absolute -right-7 -top-7 grid size-24 place-items-center bg-lime text-[#0b1533]" style={{ transform: "translateZ(40px)" }}>
          <span className="text-center font-mono text-sm font-bold leading-tight">
            {ds1}
          </span>
        </div>
      </motion.div>

      {/* Floating chips at different depths */}
      {chips.map((c, i) => {
        const Icon = icons[i];
        const pos = ["left-0 top-[24%]", "right-0 top-[46%]", "left-[6%] bottom-[2%]"][i];
        const par = [p1, p2, p3][i];
        return (
          <motion.div key={c.label} style={par} className={`absolute ${pos} z-10`}>
            <div className="glass flex animate-float items-center gap-3 rounded-2xl py-3 pl-3 pr-5 shadow-card ring-1 ring-line/70" style={{ animationDelay: `${i * 1.3}s` }}>
              <span className="grid size-12 place-items-center rounded-xl bg-brand-600 text-white dark:bg-neon dark:text-[#0b1533]">
                <Icon weight="duotone" className="size-7" />
              </span>
              <span className="leading-tight">
                <span className="block text-xl font-extrabold tracking-tight text-ink">{c.value}</span>
                <span className="block text-sm font-medium text-ink-soft">{c.label}</span>
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Rig clip */}
      <motion.div style={p2} className="absolute bottom-[8%] right-[2%] z-10 w-[38%]">
        <div className="overflow-hidden rounded-3xl bg-surface p-1.5 shadow-float ring-1 ring-line">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.15rem]">
            <BackgroundVideo src="/media/video/rig-hero.mp4" poster="/media/video/rig-hero.jpg" className="absolute inset-0 size-full" />
            <span className="glass absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-ink">
              <span className="size-1.5 animate-pulse rounded-full bg-pt" /> {videoLabel}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
