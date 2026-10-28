import Image from "next/image";
import { Certificate, Factory, MapPin, Path } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { FOUNDED, YEARS_FALLBACK, personnelCredentials } from "@/content/site";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Counter } from "@/components/ui/Counter";

/** Bento of mixed shapes that puts experience front and centre. */
export function Experience({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const e = dict.experience;
  return (
    <section id="experiencia" className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-noise opacity-60" />
      <Container className="relative">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <SectionHeading eyebrow={e.eyebrow} title={e.title} className="lg:col-span-8" />
          <p className="text-lg leading-relaxed text-ink-soft lg:col-span-4 lg:pb-2">{e.lead}</p>
        </div>

        <RevealGroup className="mt-14 grid auto-rows-[minmax(13rem,auto)] gap-4 md:grid-cols-6 lg:grid-cols-12">
          {/* Since 2017: machined-plate corner cut */}
          <RevealItem className="relative overflow-hidden bg-brand-700 p-8 text-white shape-cut md:col-span-3 lg:col-span-5 lg:row-span-2 sm:p-10">
            <div className="absolute inset-0 bg-blueprint opacity-25 [filter:invert(1)]" />
            <div className="absolute -bottom-24 -right-24 size-72 rounded-full bg-mt/25 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-white/70">{e.since}</span>
              <span className="mt-2 font-display text-[clamp(5rem,11vw,9.5rem)] font-extrabold leading-[0.85] tracking-[-0.06em] text-transparent [-webkit-text-stroke:2px_rgb(255_255_255/0.85)]">
                {FOUNDED}
              </span>
              <div className="mt-auto pt-10">
                <p className="font-display text-[clamp(3.5rem,6vw,5.5rem)] font-extrabold leading-none tracking-tight text-mt">
                  <Counter value={YEARS_FALLBACK} since={FOUNDED} prefix="+" />
                </p>
                <p className="mt-1 text-xl font-semibold">{dict.stats.years}</p>
                <p className="mt-4 max-w-sm text-white/75">{e.founded}</p>
              </div>
            </div>
          </RevealItem>

          {/* Field photo in an arch */}
          <RevealItem className="relative min-h-[26rem] overflow-hidden shape-arch shadow-lift md:col-span-3 lg:col-span-4 lg:row-span-2">
            <Image src="/media/photos/thread-closeup.jpg" alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-900/70 via-brand-900/5 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 font-mono text-xs font-bold tracking-widest ring-1 ring-white/30 backdrop-blur-md">
                <MapPin weight="fill" className="size-4 text-mt" /> VÍA SIBERIA
              </span>
              <p className="mt-3 font-display text-2xl font-bold">{e.base}</p>
              <p className="mt-1 text-white/80">{e.baseText}</p>
            </div>
          </RevealItem>

          {/* Personnel credentials as inspection tickets */}
          {personnelCredentials.map((c, i) => (
            <RevealItem key={c.code} className="relative bg-white p-7 shadow-soft shape-ticket md:col-span-3 lg:col-span-3">
              <div className="flex items-start justify-between">
                <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  {i === 0 ? <Certificate weight="duotone" className="size-9" /> : <Path weight="duotone" className="size-9" />}
                </span>
                <span className="font-mono text-xs font-bold tracking-widest text-mute">0{i + 1}</span>
              </div>
              <p className="mt-6 font-display text-[1.9rem] font-extrabold leading-none tracking-tight text-brand-700">{c.code}</p>
              <div className="my-4 border-t-2 border-dashed border-line" />
              <p className="font-display text-lg font-bold text-ink">{c.title[lang]}</p>
              <p className="mt-1 text-[0.98rem] leading-snug text-ink-soft">{c.body[lang]}</p>
            </RevealItem>
          ))}

          {/* Milestones on a dashed track */}
          <RevealItem className="rounded-[2rem] border-2 border-dashed border-brand-200 bg-white/60 p-7 md:col-span-6 lg:col-span-8 sm:p-9">
            <ol className="relative grid gap-6 sm:grid-cols-4">
              <span className="absolute left-0 right-0 top-[1.4rem] hidden h-0.5 bg-gradient-to-r from-brand-700 via-brand-300 to-mt sm:block" />
              {e.milestones.map((m, i) => (
                <li key={m.k} className="relative">
                  <span className="relative grid size-11 place-items-center rounded-full bg-white font-mono text-xs font-bold text-brand-700 shadow-soft ring-2 ring-brand-200">
                    {i + 1}
                  </span>
                  <p className="mt-4 font-display text-2xl font-extrabold tracking-tight text-ink">{m.k}</p>
                  <p className="mt-1 text-[0.98rem] leading-snug text-ink-soft">{m.v}</p>
                </li>
              ))}
            </ol>
          </RevealItem>

          {/* Sectors on a leaf-shaped card */}
          <RevealItem className="bg-mt-soft p-7 shape-leaf md:col-span-6 lg:col-span-4 sm:p-9">
            <span className="grid size-16 place-items-center rounded-2xl bg-white text-[#3f8a07] shadow-soft">
              <Factory weight="duotone" className="size-9" />
            </span>
            <p className="mt-5 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#3f8a07]">{e.sectors}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.sectorList.map((s) => (
                <li key={s} className="rounded-full bg-white px-4 py-2 font-display text-[1.05rem] font-bold text-ink shadow-soft">
                  {s}
                </li>
              ))}
            </ul>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
