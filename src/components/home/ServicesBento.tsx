import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { services, type Service } from "@/content/services";
import { methodByKey, methodTone } from "@/content/methods";
import { ServiceGlyph } from "@/components/ui/Icons";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

function MethodDots({ s, light }: { s: Service; light?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      {s.methods.map((k) => (
        <span
          key={k}
          title={methodByKey(k).code}
          className={cn("rounded-full px-2 py-0.5 font-mono text-[0.68rem] font-bold tracking-wider", light ? "bg-white/20 text-white ring-1 ring-white/30" : "bg-white ring-1 ring-line")}
          style={light ? undefined : { color: methodTone[k].hex }}
        >
          {methodByKey(k).code}
        </span>
      ))}
    </span>
  );
}

function Arrow({ light }: { light?: boolean }) {
  return (
    <span className={cn("grid size-12 shrink-0 place-items-center rounded-full transition duration-500 group-hover:rotate-45", light ? "bg-white text-brand-700" : "bg-brand-700 text-white")}>
      <ArrowUpRight weight="bold" className="size-5" />
    </span>
  );
}

export function ServicesBento({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const by = Object.fromEntries(services.map((s) => [s.slug, s])) as Record<string, Service>;
  const href = (s: Service) => `/${lang}/servicios/${s.slug}`;
  const sv = dict.servicesSection;

  const pipe = by["tuberia"];
  const bha = by["componentes-bha"];
  const lines = by["lineas-de-presion"];
  const fishing = by["fishing-wireline"];
  const cement = by["equipos-de-cementacion"];
  const lifting = by["levante-e-izaje"];
  const tanks = by["tanques"];
  const structural = by["estructural"];

  return (
    <section id="servicios" className="relative overflow-hidden bg-canvas py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38rem] bg-blueprint mask-fade-y opacity-80" />
      <Container className="relative">
        <SectionHeading eyebrow={sv.eyebrow} title={sv.title} lead={sv.lead} />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-6 lg:grid-cols-12" stagger={0.06}>
          {/* 1. Pipe: hero photo card with machined corner */}
          <RevealItem className="md:col-span-6 lg:col-span-6 lg:row-span-2">
            <Link href={href(pipe)} className="group relative flex h-full min-h-[30rem] flex-col justify-end overflow-hidden p-8 text-white shape-cut sm:p-10">
              <Image src={pipe.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/25 to-transparent" />
              <div className="relative">
                <span className="grid size-20 place-items-center bg-white text-brand-700 shape-hex">
                  <ServiceGlyph name={pipe.icon} className="size-10" />
                </span>
                <h3 className="mt-6 font-display text-[clamp(2.2rem,3.6vw,3.25rem)] font-extrabold leading-none tracking-tight">{pipe.name[lang]}</h3>
                <p className="mt-3 max-w-md text-lg text-white/85">{pipe.short[lang]}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {pipe.scope[lang].map((x) => (
                    <li key={x} className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur-md">{x}</li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <MethodDots s={pipe} light />
                  <Arrow light />
                </div>
              </div>
            </Link>
          </RevealItem>

          {/* 2. BHA: circular photo on white */}
          <RevealItem className="md:col-span-3 lg:col-span-3">
            <Link href={href(bha)} className="group flex h-full flex-col rounded-[2rem] bg-white p-7 shadow-soft ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
              <div className="relative mx-auto size-36 overflow-hidden rounded-full ring-8 ring-mist">
                <Image src={bha.image} alt="" fill sizes="144px" className="object-cover transition duration-700 group-hover:scale-110" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">{bha.name[lang]}</h3>
              <p className="mt-2 text-ink-soft">{bha.short[lang]}</p>
              <div className="mt-auto flex items-center justify-between pt-6">
                <MethodDots s={bha} />
                <Arrow />
              </div>
            </Link>
          </RevealItem>

          {/* 3. Pressure lines: ticket with notches */}
          <RevealItem className="md:col-span-3 lg:col-span-3">
            <Link href={href(lines)} className="group flex h-full flex-col bg-ut-soft p-7 shape-ticket transition hover:-translate-y-1">
              <span className="grid size-20 place-items-center rounded-[1.5rem] bg-white text-[#0784b8] shadow-soft">
                <ServiceGlyph name={lines.icon} className="size-11" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">{lines.name[lang]}</h3>
              <p className="mt-2 text-ink-soft">{lines.short[lang]}</p>
              <div className="my-5 border-t-2 border-dashed border-ut/30" />
              <div className="mt-auto flex items-center justify-between">
                <MethodDots s={lines} />
                <Arrow />
              </div>
            </Link>
          </RevealItem>

          {/* 4. Fishing & wireline: leaf with side photo */}
          <RevealItem className="md:col-span-6 lg:col-span-6">
            <Link href={href(fishing)} className="group grid h-full overflow-hidden bg-white shadow-soft ring-1 ring-line shape-leaf transition hover:shadow-lift sm:grid-cols-[0.9fr_1fr]">
              <div className="relative min-h-48">
                <Image src={fishing.image} alt="" fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <div className="flex flex-col p-7">
                <span className="grid size-16 place-items-center rounded-2xl bg-mt-soft text-[#3f8a07]">
                  <ServiceGlyph name={fishing.icon} className="size-9" />
                </span>
                <h3 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">{fishing.name[lang]}</h3>
                <p className="mt-2 text-ink-soft">{fishing.short[lang]}</p>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <MethodDots s={fishing} />
                  <Arrow />
                </div>
              </div>
            </Link>
          </RevealItem>

          {/* 5. Cementing: dashed outline card */}
          <RevealItem className="md:col-span-3 lg:col-span-4">
            <Link href={href(cement)} className="group flex h-full flex-col rounded-[2rem] border-2 border-dashed border-brand-300 bg-white/50 p-7 transition hover:border-solid hover:border-brand-700 hover:bg-white">
              <div className="flex items-start justify-between">
                <span className="grid size-20 place-items-center rounded-full bg-brand-700 text-white shadow-[0_14px_30px_-12px_rgb(3_10_140/0.7)]">
                  <ServiceGlyph name={cement.icon} className="size-10" />
                </span>
                <span className="font-mono text-6xl font-bold leading-none text-brand-100">05</span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-ink">{cement.name[lang]}</h3>
              <p className="mt-2 text-ink-soft">{cement.short[lang]}</p>
              <div className="mt-auto flex items-center justify-between pt-6">
                <MethodDots s={cement} />
                <Arrow />
              </div>
            </Link>
          </RevealItem>

          {/* 6. Structural: photo with bottom-left cut */}
          <RevealItem className="md:col-span-3 lg:col-span-4">
            <Link href={href(structural)} className="group relative flex h-full min-h-72 items-end overflow-hidden p-7 text-white shape-cut-bl sm:p-8">
              <Image src={structural.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/30 to-transparent" />
              <div className="relative flex w-full items-end justify-between gap-6">
                <div>
                  <span className="grid size-16 place-items-center rounded-2xl bg-white text-brand-700">
                    <ServiceGlyph name={structural.icon} className="size-9" />
                  </span>
                  <h3 className="mt-5 font-display text-3xl font-extrabold tracking-tight">{structural.name[lang]}</h3>
                  <p className="mt-1 max-w-md text-white/85">{structural.short[lang]}</p>
                </div>
                <Arrow light />
              </div>
            </Link>
          </RevealItem>
          {/* 7. Lifting: arch photo */}
          <RevealItem className="md:col-span-3 lg:col-span-4 lg:row-span-2">
            <Link href={href(lifting)} className="group relative flex h-full min-h-[28rem] flex-col justify-end overflow-hidden p-7 text-white shape-arch">
              <Image src={lifting.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/20 to-transparent" />
              <div className="relative">
                <span className="grid size-16 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-md">
                  <ServiceGlyph name={lifting.icon} className="size-9" />
                </span>
                <h3 className="mt-5 font-display text-3xl font-extrabold tracking-tight">{lifting.name[lang]}</h3>
                <p className="mt-2 text-white/85">{lifting.short[lang]}</p>
                <div className="mt-6 flex items-center justify-between">
                  <MethodDots s={lifting} light />
                  <Arrow light />
                </div>
              </div>
            </Link>
          </RevealItem>

          {/* 8. Tanks: wide pill with hex icon */}
          <RevealItem className="md:col-span-6 lg:col-span-8">
            <Link href={href(tanks)} className="group flex h-full items-center gap-6 rounded-full bg-white py-4 pl-4 pr-6 sm:pr-8 shadow-soft ring-1 ring-line transition hover:shadow-lift">
              <span className="grid size-24 shrink-0 place-items-center bg-vt-soft text-[#b46f00] shape-hex">
                <ServiceGlyph name={tanks.icon} className="size-11" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">{tanks.name[lang]}</h3>
                <p className="mt-1 text-[1.02rem] leading-snug text-ink-soft">{tanks.short[lang]}</p>
              </div>
              <span className="ml-auto"><Arrow /></span>
            </Link>
          </RevealItem>

        </RevealGroup>
      </Container>
    </section>
  );
}
