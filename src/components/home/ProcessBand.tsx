"use client";

import { motion } from "motion/react";
import { Broom, ClipboardText, MagnifyingGlass, Scales, SealCheck } from "@phosphor-icons/react/ssr";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { FieldMonitor } from "@/components/visuals/FieldMonitor";
import { home } from "@/content/home";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

const icons = [ClipboardText, Broom, MagnifyingGlass, Scales, SealCheck];
const ease = [0.16, 1, 0.3, 1] as const;

/** Workshop video panel: the inspection route drawn as a track, with real MT and PT field footage. */
export function ProcessBand({ lang }: { lang: Locale }) {
  const p = home.process;
  const t = { eyebrow: p.eyebrow[lang], title: p.title[lang], lead: p.lead[lang], recMt: p.recMt[lang], recPt: p.recPt[lang], steps: p.steps.map((s) => ({ t: s.t[lang], d: s.d[lang] })) };
  return (
    <section className="relative bg-canvas pb-24 pt-10 sm:pb-32 sm:pt-16">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[3rem] rounded-bl-[8rem] px-6 py-16 text-white sm:px-12 sm:py-20 lg:px-16">
          <BackgroundVideo src="/media/video/welding-loop.mp4" poster="/media/photos/workshop-team.jpg" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/90 via-brand-900/75 to-brand-700/40" />
          <div className="absolute inset-0 -z-10 bg-network opacity-40" />

          <div className="grid items-center gap-12 lg:grid-cols-12">
            <Reveal className="lg:col-span-5">
              <Eyebrow tone="onImage">{t.eyebrow}</Eyebrow>
              <h2 className="mt-6 text-balance text-[clamp(2.3rem,4.2vw,3.9rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{t.title}</h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80 sm:text-xl">{t.lead}</p>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
              <Reveal delay={0.1} className="sm:translate-y-8">
                <FieldMonitor src="/media/video/mt-field.mp4" poster="/media/methods/mt-6.jpg" label={t.recMt} />
              </Reveal>
              <Reveal delay={0.2} className="sm:-translate-y-6">
                <FieldMonitor src="/media/video/pt-field.mp4" poster="/media/methods/pt-1.jpg" label={t.recPt} tone="#ff8796" />
              </Reveal>
            </div>
          </div>

          {/* Route */}
          <div className="relative mt-20">
            <motion.span
              aria-hidden
              className="absolute left-[10%] right-[10%] top-10 hidden h-0.5 origin-left bg-gradient-to-r from-neon via-neon to-lime lg:block"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "0px 0px -20% 0px" }}
              transition={{ duration: 1.6, ease }}
            />
            <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
              {t.steps.map((s, i) => {
                const Icon = icons[i];
                const last = i === t.steps.length - 1;
                return (
                  <motion.li
                    key={s.t}
                    className="flex gap-4 lg:flex-col lg:items-center lg:text-center"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                    transition={{ duration: 0.7, delay: 0.25 + i * 0.18, ease }}
                  >
                    <span className={cn("relative grid size-20 shrink-0 place-items-center rounded-full ring-1 backdrop-blur-md", last ? "bg-lime text-[#071a2e] ring-lime" : "bg-white/10 text-neon ring-white/30")}>
                      <Icon weight="duotone" className="size-10" />
                      <span className="absolute -right-1 -top-1 grid size-7 place-items-center rounded-full bg-white font-mono text-xs font-bold text-[#071a2e]">{i + 1}</span>
                    </span>
                    <span>
                      <span className="block text-xl font-extrabold leading-tight tracking-tight lg:mt-5">{s.t}</span>
                      <span className="mt-1.5 block leading-relaxed text-white/75">{s.d}</span>
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
