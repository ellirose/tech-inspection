import Image from "next/image";
import { Crosshair } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { home } from "@/content/home";
import { clients } from "@/content/site";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Counter } from "@/components/ui/Counter";
import { LineReveal, Underline } from "@/components/ui/LineReveal";
import { RotatingWord } from "@/components/ui/RotatingWord";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";
import { cn } from "@/lib/cn";
import { HeroVisual } from "./HeroVisual";

/** One-screen hero: the promise, what we inspect right now, proof in numbers, and who trusts us. */
export function HomeHero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const h = home.hero;
  const lastSpace = h.titleB[lang].lastIndexOf(" ");
  const tail = h.titleB[lang].slice(lastSpace + 1).replace(/[.]$/, "");

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-28 lg:h-[100svh] lg:min-h-[44rem]">
      {/* Background: ultrasonic rings centred on the visual, contour lines, one soft glow */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-rings [--rx:72%] [--ry:58%] mask-radial" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-[55%] mask-fade-y">
        <div className="absolute inset-0 bg-contours opacity-70" />
      </div>
      <div className="pointer-events-none absolute -right-48 -top-48 -z-20 size-[44rem] rounded-full bg-neon/15 blur-[130px]" />

      <Container className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-6 xl:col-span-6">
          <Reveal y={14}>
            <Eyebrow>{h.eyebrow[lang]}</Eyebrow>
          </Reveal>

          <h1 className="mt-[3vh] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink [font-size:clamp(2.6rem,min(4.75vw,8.6vh),5.4rem)]">
            <LineReveal delay={0.05}>{h.titleA[lang]}</LineReveal>
            <LineReveal delay={0.15} className="text-balance text-accent">
              {h.titleB[lang].slice(0, lastSpace)}{" "}
              <span className="relative z-0 whitespace-nowrap">
                {tail}.
                <Underline className="right-[0.32em] w-auto" />
              </span>
            </LineReveal>
          </h1>

          <Reveal delay={0.35} y={16} className="mt-[3vh] flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-neon dark:bg-neon dark:text-[#071a2e]">
              <Crosshair weight="duotone" className="size-6 animate-spin-slow motion-reduce:animate-none" />
            </span>
            <span className="text-[clamp(1.1rem,1.6vw,1.45rem)] font-bold text-ink-soft">
              {h.inspecting[lang]}: <RotatingWord words={h.words[lang]} className="font-extrabold text-ink" />
            </span>
          </Reveal>

          <Reveal delay={0.45} y={16}>
            <p className="mt-[2.4vh] max-w-xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl [@media(max-height:820px)]:hidden">{h.lead[lang]}</p>
          </Reveal>

          <Reveal delay={0.55} y={16} className="mt-[3.4vh] flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/${lang}/contacto#cotizar`}>{dict.cta.quote}</ButtonLink>
            <ButtonLink href="#servicios" variant="ghost">
              {h.services[lang]}
            </ButtonLink>
          </Reveal>

          <Reveal delay={0.65} y={16}>
            <dl className="mt-[4vh] flex max-w-xl divide-x divide-line">
              {h.stats.map((s) => (
                <div key={s.label.es} className="flex-1 px-4 first:pl-0 sm:px-6">
                  <dd className="text-[clamp(2rem,min(3.6vw,6vh),3.4rem)] font-extrabold leading-none tracking-tight text-ink">
                    <Counter value={s.value} prefix={s.prefix} />
                  </dd>
                  <dt className="mt-1.5 text-sm font-bold leading-tight text-mute sm:text-[0.95rem]">{s.label[lang]}</dt>
                </div>
              ))}
            </dl>
          </Reveal>

          {/* Phones: the rig clip in a compact arch */}
          <Reveal delay={0.3} className="relative mt-10 h-52 overflow-hidden rounded-[2rem] rounded-tr-[6rem] shadow-float ring-4 ring-surface sm:h-64 lg:hidden [@media(max-height:700px)]:hidden">
            <BackgroundVideo src="/media/video/rig-hero.mp4" poster="/media/video/rig-hero.jpg" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-x-0 top-0 h-1/2 animate-scan motion-reduce:hidden">
              <div className="h-full bg-gradient-to-b from-transparent to-neon/25" />
              <div className="h-0.5 bg-neon" />
            </div>
          </Reveal>
        </div>

        <div className="relative hidden h-[min(70svh,42rem)] lg:col-span-6 lg:block">
          <HeroVisual t={{ wall: h.wall[lang], indication: h.indication[lang], live: h.live[lang], personnel: h.personnel[lang], bitAlt: dict.ui.bitService }} />
        </div>
      </Container>

      {/* Who trusts us, still inside the first screen */}
      <div className="relative mt-10 border-t border-line/80 bg-surface/60 backdrop-blur-sm lg:mt-4">
        <Container className="flex items-center gap-6 py-3.5">
          <p className="hidden shrink-0 font-mono text-xs font-medium uppercase tracking-[0.16em] text-mute sm:block">{h.clients[lang]}</p>
          <div className="min-w-0 flex-1 overflow-hidden mask-fade-x">
            <div className="flex w-max animate-marquee items-center gap-8 [animation-duration:40s] motion-reduce:animate-none">
              {[...clients, ...clients, ...clients].map((c, i) => (
                <span key={i} className="flex h-12 shrink-0 items-center rounded-xl px-3 dark:bg-white/95">
                  <Image
                    src={c.logo}
                    alt={i < clients.length ? c.name : ""}
                    width={200}
                    height={100}
                    loading="eager"
                    className={cn("w-auto object-contain opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0", c.square ? "h-10" : "h-8")}
                  />
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
