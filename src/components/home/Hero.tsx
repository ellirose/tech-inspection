"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, ArrowDown, WhatsappLogo, Certificate, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { FOUNDED, YEARS_FALLBACK, whatsappLink } from "@/content/site";
import { Counter } from "@/components/ui/Counter";
import { Eyebrow } from "@/components/ui/Section";
import { Waveform } from "@/components/visuals/Waveform";
import { Seal } from "@/components/visuals/Seal";
import { cn } from "@/lib/cn";

const ease = [0.16, 1, 0.3, 1] as const;

function useLayer(x: MotionValue<number>, y: MotionValue<number>, depth: number) {
  return { x: useTransform(x, [-1, 1], [-depth, depth]), y: useTransform(y, [-1, 1], [-depth, depth]) };
}

export function Hero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const { hero, stats, cta } = dict;

  // Mouse parallax for the 3D composition
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });
  const rotY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotX = useTransform(sy, [-1, 1], [6, -6]);
  const layerA = useLayer(sx, sy, 22);
  const layerB = useLayer(sx, sy, 34);
  const layerC = useLayer(sx, sy, 14);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const statItems = [
    { value: YEARS_FALLBACK, label: stats.years, since: FOUNDED, prefix: "+" },
    { value: 4, label: stats.methods },
    { value: 8, label: stats.services },
    { value: 4, label: stats.systems },
  ];

  return (
    <section
      onMouseMove={onMove}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className="relative isolate flex min-h-svh flex-col overflow-hidden pt-24 lg:h-svh lg:min-h-[640px]"
    >
      {/* Background: blueprint grid, restrained colour fields, contour lines */}
      <div className="absolute inset-0 -z-10 bg-canvas" />
      <div className="absolute inset-0 -z-10 bg-blueprint mask-radial" />
      <div className="absolute -right-40 -top-40 -z-10 size-[46rem] rounded-full bg-brand-200/45 blur-3xl" />
      <div className="absolute -bottom-56 -left-40 -z-10 size-[34rem] rounded-full bg-mt/12 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-contours opacity-70 mask-fade-x" />

      <div className="mx-auto grid w-full max-w-[90rem] flex-1 grid-cols-1 items-center gap-8 px-5 py-6 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12 lg:py-[3vh]">
        {/* Copy */}
        <div className="flex flex-col justify-center lg:col-span-6 xl:col-span-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </motion.div>

          <h1 className="mt-[2.4vh] font-display font-extrabold leading-[0.94] tracking-[-0.045em] text-ink [font-size:clamp(2.75rem,min(7.4vw,10vh),7.25rem)]">
            {[hero.titleA, hero.titleB].map((line, i) => (
              <motion.span key={line} className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 + i * 0.1, ease }}>
                {line}
              </motion.span>
            ))}
            <motion.span className="block text-brand-700" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease }}>
              <motion.span
                className="uv-mark"
                initial={{ backgroundSize: "0% 100%" }}
                animate={{ backgroundSize: "100% 100%" }}
                transition={{ duration: 0.9, delay: 1, ease }}
              >
                {hero.titleMark}
              </motion.span>
            </motion.span>
          </h1>

          <motion.p
            className="mt-[2.4vh] max-w-xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl [@media(max-height:680px)]:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease }}
          >
            {hero.lead}
          </motion.p>

          <motion.div className="mt-[3.2vh] flex gap-3 sm:flex-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55, ease }}>
            <Link
              href={`/${lang}/contacto#cotizar`}
              className="group inline-flex flex-1 items-center justify-center gap-3 rounded-full bg-brand-700 py-3.5 pl-6 pr-4 font-display text-base font-bold sm:flex-none sm:py-4 sm:pl-7 sm:pr-5 sm:text-lg text-white shadow-[0_18px_40px_-14px_rgb(3_10_140/0.75)] transition hover:-translate-y-0.5 hover:bg-brand-600"
            >
              {cta.quote}
              <span className="grid size-9 place-items-center rounded-full bg-white/15 transition group-hover:bg-mt group-hover:text-brand-900">
                <ArrowRight weight="bold" className="size-5" />
              </span>
            </Link>
            <a
              aria-label="WhatsApp"
              href={whatsappLink(dict.quote.waIntro)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-white p-2 font-display text-lg font-bold sm:py-4 sm:pl-5 sm:pr-7 text-ink shadow-soft ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-whatsapp"
            >
              <span className="grid size-9 place-items-center rounded-full bg-whatsapp text-white">
                <WhatsappLogo weight="fill" className="size-5" />
              </span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </motion.div>

          {/* Experience in numbers, right where the eye lands */}
          <motion.dl
            className="mt-[3.6vh] grid grid-cols-4 gap-1.5 sm:gap-2.5"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.7 } } }}
          >
            {statItems.map((s, i) => (
              <motion.div
                key={s.label}
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } } }}
                className={cn(
                  "relative overflow-hidden rounded-2xl px-2.5 py-2.5 sm:rounded-[1.4rem] sm:px-4 sm:py-3.5",
                  i === 0 ? "bg-brand-700 text-white shadow-[0_16px_36px_-16px_rgb(3_10_140/0.8)]" : "glass shadow-soft",
                )}
              >
                {i === 0 && <span className="absolute -right-6 -top-6 size-20 rounded-full bg-mt/30 blur-xl" />}
                <dd className={cn("relative font-display text-[clamp(1.5rem,4.4vh,2.9rem)] font-extrabold leading-none tracking-tight", i !== 0 && "text-brand-700")}>
                  <Counter value={s.value} since={s.since} prefix={s.prefix} />
                </dd>
                <dt className={cn("relative mt-1 text-[0.68rem] font-semibold leading-tight sm:mt-1.5 sm:text-[0.88rem]", i === 0 ? "text-white/80" : "text-ink-soft")}>{s.label}</dt>
              </motion.div>
            ))}
          </motion.dl>
        </div>

        {/* 3D composition */}
        <div className="relative hidden h-full max-h-[min(78vh,760px)] min-h-0 lg:col-span-6 lg:block xl:col-span-6">
          <div className="absolute inset-0 perspective-1600">
            <motion.div
              style={{ rotateX: rotX, rotateY: rotY }}
              initial={{ opacity: 0, scale: 0.94, rotateY: -14 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease }}
              className="absolute inset-y-[4%] left-[14%] right-[4%] preserve-3d"
            >
              <div className="absolute inset-0 overflow-hidden rounded-[2.75rem] shadow-float ring-1 ring-white/60">
                {/* Framed on the inspector at right so the floating cards only cover wall and equipment. */}
                <Image src="/media/photos/crew-yard.jpg" alt="" fill preload sizes="(min-width:1024px) 45vw, 0px" className="object-cover object-[92%_50%]" quality={80} />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/45 via-transparent to-transparent" />
                {/* UV scan line */}
                <div className="absolute inset-x-0 top-0 h-1/3 animate-scan">
                  <div className="h-full bg-gradient-to-b from-transparent via-mt/10 to-mt/30" />
                  <div className="h-[2px] bg-mt shadow-[0_0_18px_4px_rgb(111_209_28/0.7)]" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <span className="rounded-full bg-white/15 px-3.5 py-1.5 font-mono text-xs font-bold tracking-[0.2em] backdrop-blur-md ring-1 ring-white/30">VÍA SIBERIA · CO</span>
                  <span className="flex items-center gap-2 font-mono text-xs font-bold tracking-[0.2em]">
                    <span className="size-2 animate-pulse rounded-full bg-pt" /> {hero.live.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* UT readout */}
          <motion.div
            style={layerB}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.8, ease }}
            className="absolute left-0 top-[14%] w-[min(19rem,48%)] rounded-[1.75rem] bg-white/88 p-4 shadow-float ring-1 ring-white backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-ut-soft px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-widest text-[#0784b8]">UT · 5 MHz</span>
              <span className="flex items-center gap-1.5 font-mono text-[0.7rem] font-bold text-mute">
                <span className="size-1.5 animate-pulse rounded-full bg-ut" />
                {hero.live}
              </span>
            </div>
            <Waveform className="mt-3 h-16 w-full text-ink" />
            <div className="mt-2 flex items-end justify-between">
              <span className="text-sm font-semibold text-ink-soft">{hero.readout}</span>
              <span className="font-display text-3xl font-extrabold tracking-tight text-ink">
                12.7<span className="ml-1 text-base font-bold text-mute">mm</span>
              </span>
            </div>
          </motion.div>

          {/* MT indication */}
          <motion.div
            style={layerA}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease }}
            className="absolute bottom-[8%] left-[4%] flex w-[min(20rem,52%)] items-center gap-3.5 rounded-[1.75rem] bg-white p-3 pr-5 shadow-float ring-1 ring-line"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl shadow-glow-mt">
              <Image src="/media/methods/mt-4.jpg" alt="" fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <span className="rounded-full bg-mt-soft px-2.5 py-1 font-mono text-[0.7rem] font-bold tracking-widest text-[#3f8a07]">MT · UV</span>
              <p className="mt-2 font-display text-lg font-bold leading-tight text-ink">{hero.indication}</p>
            </div>
          </motion.div>

          {/* Rotating credential seal */}
          <motion.div
            style={layerC}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.15, ease }}
            className="absolute right-[-1%] top-[2%] w-36 rounded-full bg-white/80 p-1.5 shadow-float backdrop-blur-md xl:w-40"
          >
            <Seal ring={`ASNT-TC-1A · ${hero.personnel.toUpperCase()} · `} code="ASNT" spin tone="mt" />
          </motion.div>

          {/* ISO badges */}
          <motion.div
            style={layerB}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 1.25, ease }}
            className="glass-brand absolute bottom-[22%] right-[-2%] flex flex-col gap-2 rounded-[1.5rem] p-3 shadow-float"
          >
            {[
              { icon: Certificate, label: "ISO 9001:2015" },
              { icon: ShieldCheck, label: "ISO 45001:2018" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2.5 rounded-xl bg-white/85 px-3 py-2 font-mono text-[0.8rem] font-bold text-brand-800">
                <Icon weight="duotone" className="size-6 text-brand-600" />
                {label}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <a href="#experiencia" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.25em] text-mute lg:flex [@media(max-height:980px)]:!hidden">
        {hero.scroll}
        <span className="grid size-9 place-items-center rounded-full bg-white shadow-soft ring-1 ring-line">
          <ArrowDown weight="bold" className="size-4 animate-bounce" />
        </span>
      </a>
    </section>
  );
}
