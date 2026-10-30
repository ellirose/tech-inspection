import Image from "next/image";
import { Certificate, Handshake, Ruler, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { home } from "@/content/home";
import { credentials, standards } from "@/content/deck";
import { FOUNDED, keyPartner } from "@/content/site";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Seal } from "@/components/visuals/Seal";
import { cn } from "@/lib/cn";

const hex = { "DS-1": "bg-pt text-white", API: "bg-lime text-[#071a2e]", ASTM: "bg-brand-600 text-white dark:bg-brand-400" } as const;

/** Credentials as a bento of distinct shapes: each card carries one auditable fact. */
export function WhyUs({ lang, dict, className }: { lang: Locale; dict: Dictionary; className?: string }) {
  const t = home.why;
  const c = Object.fromEntries(credentials.map((x) => [x.key, x])) as Record<(typeof credentials)[number]["key"], (typeof credentials)[number]>;
  const triad = [
    { code: "DS-1" as const, sub: standards.triad.ds1[lang] },
    { code: "API" as const, sub: standards.triad.api[lang] },
    { code: "ASTM" as const, sub: standards.triad.astm[lang] },
  ];

  return (
    <section className={cn("relative isolate overflow-hidden bg-tint py-24 sm:py-32", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-network opacity-50 mask-fade-y" />
      <Container>
        <SectionHeading eyebrow={t.eyebrow[lang]} title={t.title[lang]} lead={t.lead[lang]} />

        <RevealGroup className="mt-14 grid gap-4 md:grid-cols-6 lg:grid-cols-12" stagger={0.07}>
          {/* Founding year, outlined, with what we have done since */}
          <RevealItem className="relative overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] bg-brand-600 p-8 text-white shadow-float md:col-span-6 lg:col-span-5 lg:row-span-2 sm:p-10 dark:bg-brand-800">
            <div className="absolute inset-0 bg-blueprint opacity-30 [--grid:rgb(255_255_255/0.12)]" />
            <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-neon/30 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <span className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-white/70">
                {t.founded[lang]} {FOUNDED}
              </span>
              <span className="text-stroke mt-2 text-[clamp(5rem,10vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.06em] text-white/85">{FOUNDED}</span>
              <div className="mt-auto pt-12">
                <span className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-sm font-extrabold text-[#071a2e]">{c.experience.d[lang]}</span>
                <p className="mt-5 max-w-md text-xl font-semibold leading-relaxed text-white/90">{dict.experience.lead}</p>
              </div>
            </div>
          </RevealItem>

          {/* Personnel: photo in an arch with the ASNT seal */}
          <RevealItem className="relative min-h-[28rem] md:col-span-3 lg:col-span-4 lg:row-span-2">
            <div className="absolute inset-0 overflow-hidden rounded-b-[2.5rem] rounded-t-[999px] shadow-card">
              <Image src="/media/photos/uv-inspector.jpg" alt="" fill sizes="(min-width:1024px) 30vw, 50vw" className="object-cover object-[45%_50%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/10 to-transparent" />
            </div>
            <div className="absolute -right-3 top-[14%] w-28 rounded-full bg-surface/90 p-1 shadow-float backdrop-blur-md">
              <Seal ring={`ASNT · ${c.people.value[lang].toUpperCase()} · `} code="ASNT" spin />
            </div>
            <div className="absolute inset-x-7 bottom-7 text-white">
              <p className="text-[2.4rem] font-extrabold leading-none tracking-tight">{c.people.value[lang]}</p>
              <p className="mt-2 text-xl font-bold">{c.people.t[lang]}</p>
              <p className="mt-1 text-white/80">{c.people.d[lang]}</p>
            </div>
          </RevealItem>

          {/* Calibrated equipment: notched ticket */}
          <RevealItem className="drop md:col-span-3 lg:col-span-3">
            <div className="shape-ticket flex h-full flex-col bg-surface p-7">
              <IconBadge icon={Ruler} size="xl" tone="neon" shape="circle" />
              <p className="mt-6 text-[1.6rem] font-extrabold leading-none tracking-tight text-accent">{c.equipment.value[lang]}</p>
              <div className="my-4 border-t-2 border-dashed border-line" />
              <p className="text-lg font-bold text-ink">{c.equipment.t[lang]}</p>
              <p className="mt-1 text-ink-soft">{c.equipment.d[lang]}</p>
            </div>
          </RevealItem>

          {/* Quality: dashed outline */}
          <RevealItem className="rounded-[2rem] border-2 border-dashed border-neon/50 bg-surface/70 p-7 md:col-span-3 lg:col-span-3">
            <div className="flex items-start justify-between">
              <IconBadge icon={Certificate} size="xl" tone="solid" />
              <span className="text-5xl font-extrabold leading-none tracking-tight text-accent">{c.quality.value[lang]}</span>
            </div>
            <p className="mt-6 text-lg font-bold text-ink">{c.quality.t[lang]}</p>
            <p className="mt-1 text-ink-soft">{c.quality.d[lang]}</p>
          </RevealItem>

          {/* Safety: chamfered plate */}
          <RevealItem className="drop md:col-span-3 lg:col-span-4">
            <div className="shape-chamfer flex h-full items-center gap-5 bg-surface p-7">
              <IconBadge icon={ShieldCheck} size="xl" tone="lime" shape="hex" />
              <div>
                <p className="text-[1.6rem] font-extrabold leading-none tracking-tight text-accent">{c.safety.value[lang]}</p>
                <p className="mt-2 text-lg font-bold text-ink">{c.safety.t[lang]}</p>
                <p className="mt-1 text-ink-soft">{c.safety.d[lang]}</p>
              </div>
            </div>
          </RevealItem>

          {/* Standards: three hexagons on a wide pill */}
          <RevealItem className="flex flex-col gap-6 rounded-[2.5rem] bg-surface p-7 shadow-soft ring-1 ring-line md:col-span-6 lg:col-span-8 lg:flex-row lg:items-center lg:rounded-full lg:py-6 lg:pl-10 lg:pr-6">
            <p className="text-xl font-extrabold leading-tight tracking-tight text-ink lg:max-w-[12rem]">{t.standards[lang]}</p>
            <ul className="grid flex-1 grid-cols-3 gap-3">
              {triad.map((x) => (
                <li key={x.code} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
                  <span className={cn("shape-hex grid size-20 shrink-0 place-items-center text-lg font-extrabold", hex[x.code])}>{x.code}</span>
                  <span className="text-[0.95rem] font-bold leading-snug text-ink-soft">{x.sub}</span>
                </li>
              ))}
            </ul>
          </RevealItem>

          {/* Partner: photo strip */}
          <RevealItem className="relative overflow-hidden rounded-[2.5rem] rounded-bl-[6rem] md:col-span-6 lg:col-span-12">
            <Image src="/media/stock/pipe-yard.jpg" alt="" fill sizes="100vw" className="object-cover object-[50%_60%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-900/65 to-transparent" />
            <div className="relative flex flex-col gap-6 p-8 text-white sm:flex-row sm:items-center sm:p-10">
              <IconBadge icon={Handshake} size="xl" tone="lime" shape="circle" className="ring-0" />
              <div>
                <p className="font-mono text-sm font-medium uppercase tracking-[0.18em] text-lime">{t.partner[lang]}</p>
                <p className="mt-1 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight tracking-tight">{keyPartner.name}</p>
              </div>
            </div>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
