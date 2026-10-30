import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardText, Crosshair, SealCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { methods, type MethodKey } from "@/content/methods";
import { methodsApplied } from "@/content/deck";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const tone: Record<MethodKey, { tile: string; text: string; dot: string; glow: string }> = {
  vt: { tile: "bg-vt text-[#0b1533]", text: "text-[#c47a00] dark:text-vt", dot: "bg-vt", glow: "shadow-[0_18px_40px_-16px_rgb(245_165_36/0.7)]" },
  mt: { tile: "bg-mt text-[#0b1533]", text: "text-lime-deep dark:text-mt", dot: "bg-mt", glow: "shadow-[0_18px_40px_-16px_rgb(122_214_42/0.7)]" },
  pt: { tile: "bg-pt text-white", text: "text-pt", dot: "bg-pt", glow: "shadow-[0_18px_40px_-16px_rgb(239_62_87/0.6)]" },
  ut: { tile: "bg-ut text-[#0b1533]", text: "text-[#0784b8] dark:text-ut", dot: "bg-ut", glow: "shadow-[0_18px_40px_-16px_rgb(31_179_238/0.7)]" },
};
const corners = ["rounded-tr-[4.5rem]", "rounded-bl-[4.5rem]", "rounded-tr-[4.5rem]", "rounded-bl-[4.5rem]"];

/** Slide 6: the four methods, what each detects, and how they combine into one decision. */
export function MethodsApplied({ lang, dict, index = "04", values = true }: { lang: Locale; dict: Dictionary; index?: string; values?: boolean }) {
  return (
    <section className="relative bg-surface py-24 sm:py-32">
      <Container>
        <SectionHeading index={index} eyebrow={dict.methodsSection.eyebrow} title={methodsApplied.title[lang]} lead={methodsApplied.lead[lang]} />

        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {methods.map((m, i) => {
            const t = tone[m.key];
            return (
              <RevealItem key={m.key} className={cn(i % 2 === 1 && "lg:mt-12")}>
                <Link href={`/${lang}/metodos/${m.slug}`} className={cn("group flex h-full flex-col overflow-hidden rounded-[2rem] bg-surface shadow-card ring-1 ring-line transition duration-500 hover:-translate-y-2 hover:shadow-float", corners[i])}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image src={m.cover} alt={m.name[lang]} fill sizes="(min-width:1024px) 22vw, (min-width:640px) 45vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                    <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-sm font-bold text-ink">{m.code}</span>
                  </div>
                  <div className="relative flex flex-1 flex-col px-6 pb-6 pt-12">
                    <span className={cn("absolute -top-9 left-6 grid size-[4.5rem] place-items-center rounded-2xl ring-4 ring-surface", t.tile, t.glow)}>
                      <MethodGlyph name={m.key} className="size-10" />
                    </span>
                    <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-ink">{m.name[lang]}</h3>
                    <p className={cn("mt-5 font-mono text-xs font-medium uppercase tracking-[0.16em]", t.text)}>{methodsApplied.detects[lang]}</p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.detects[lang].map((d) => (
                        <li key={d} className="rounded-full bg-surface-2 px-3 py-1 text-[0.92rem] font-semibold text-ink-soft ring-1 ring-line">
                          {d}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-bold text-accent">
                      {dict.cta.details}
                      <ArrowUpRight weight="bold" className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* Flow: each method adds evidence, the evaluation correlates it, a decision follows */}
        <Reveal className="mt-10 grid gap-8 rounded-[2.5rem] bg-surface p-7 shadow-card ring-1 ring-line sm:p-10 lg:grid-cols-12 lg:items-center">
          <ol className="flex flex-wrap items-center gap-2.5 lg:col-span-6">
            {methods.map((m) => (
              <li key={m.key} className="flex items-center gap-2.5">
                <span className={cn("grid size-14 place-items-center rounded-full text-base font-extrabold", tone[m.key].tile, tone[m.key].glow)}>{m.code}</span>
                <ArrowRight weight="bold" className="size-4 text-mute" />
              </li>
            ))}
            <li className="flex items-center gap-2.5">
              <span className="inline-flex h-14 items-center gap-2 rounded-full bg-tint px-5 font-bold text-accent ring-1 ring-neon/30">
                <ClipboardText weight="duotone" className="size-7" />
                {methodsApplied.integral[lang]}
              </span>
              <ArrowRight weight="bold" className="size-4 text-mute" />
            </li>
            <li>
              <span className="inline-flex h-14 items-center gap-2 rounded-full bg-brand-600 px-5 font-bold text-white shadow-[0_14px_30px_-12px_rgb(31_55_214/0.75)] dark:bg-neon dark:text-[#0b1533]">
                <SealCheck weight="fill" className="size-7" />
                {methodsApplied.decision[lang]}
              </span>
            </li>
          </ol>
          <blockquote className="flex gap-5 lg:col-span-6 lg:border-l lg:border-line lg:pl-10">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-tint text-accent-ink ring-1 ring-neon/30">
              <Crosshair weight="duotone" className="size-9" />
            </span>
            <p className="text-pretty leading-relaxed">
              <span className="block text-lg font-semibold text-mute">{methodsApplied.quoteA[lang]}</span>
              <span className="mt-1 block text-xl font-bold text-ink">{methodsApplied.quoteB[lang]}</span>
            </p>
          </blockquote>
        </Reveal>

        {values && (
          <RevealGroup className="mt-8 flex flex-wrap justify-center gap-3">
            {methodsApplied.values.map((v) => (
              <RevealItem key={v.t.es} className="rounded-full bg-surface px-5 py-3 shadow-soft ring-1 ring-line">
                <span className="font-extrabold text-ink">{v.t[lang]}</span> <span className="text-ink-soft">{v.d[lang]}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </Container>
    </section>
  );
}
