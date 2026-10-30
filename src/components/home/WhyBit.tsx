import Image from "next/image";
import { Certificate, ChartLineUp, CheckCircle, CurrencyDollar, FileText, Gear, HardHat, Ruler, ShieldCheck, TrendDown, Warning, Waveform, Wrench } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cover, whyBit } from "@/content/deck";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";

const riskIcons = [TrendDown, Warning, Wrench, CurrencyDollar];
const withIcons = [HardHat, Waveform, Ruler, FileText];
const valueIcons = [Gear, Certificate, ShieldCheck, ChartLineUp];

/** Slide 5: why inspect a drill bit. The bit photo sits in the background, behind glass cards. */
export function WhyBit({ lang, dict, index = "03", link = true }: { lang: Locale; dict: Dictionary; index?: string; link?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      {/* Background image, fading in from the right */}
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] mask-fade-l lg:block">
        <Image src="/media/deck/bit-rig.jpg" alt="" fill sizes="58vw" className="object-cover object-[60%_40%]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dots mask-fade-y opacity-70" />

      <Container>
        <SectionHeading align="stack" index={index} eyebrow="DS-1" title={whyBit.title[lang]} lead={cover.lead[lang]}>
          {link && (
            <ButtonLink href={`/${lang}/servicios/brocas`} variant="ghost" className="mt-7">
              {dict.ui.bitService}
            </ButtonLink>
          )}
        </SectionHeading>

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* Risks: red-accented card */}
          <Reveal className="relative overflow-hidden rounded-[2rem] bg-surface p-7 shadow-card ring-1 ring-line sm:p-9 lg:col-span-5">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-pt" />
            <p className="text-xl font-extrabold tracking-tight text-pt">{whyBit.risksTitle[lang]}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {whyBit.risks[lang].map((r, i) => (
                <li key={r} className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4 ring-1 ring-line">
                  <IconBadge icon={riskIcons[i]} size="md" tone="red" shape="circle" />
                  <span className="text-[1.05rem] font-bold leading-snug text-ink">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* What inspection allows: glass card over the photo */}
          <Reveal delay={0.1} className="glass rounded-[2rem] rounded-tr-[5rem] p-7 shadow-float ring-1 ring-line/70 sm:p-9 lg:col-span-5 lg:col-start-8">
            <p className="text-xl font-extrabold tracking-tight text-accent">{whyBit.allowsTitle[lang]}</p>
            <ul className="mt-6 space-y-3.5">
              {whyBit.allows[lang].map((a) => (
                <li key={a} className="flex items-start gap-3">
                  <CheckCircle weight="fill" className="mt-0.5 size-7 shrink-0 text-lime-deep dark:text-lime" />
                  <span className="text-[1.08rem] font-semibold text-ink">{a}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Inspecting with: hexagon icon tiles */}
        <Reveal className="mt-16">
          <p className="text-lg font-bold text-ink">{whyBit.withTitle[lang]}</p>
        </Reveal>
        <RevealGroup className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {whyBit.with.map((w, i) => (
            <RevealItem key={w.t.es} className="flex items-start gap-4 rounded-[1.75rem] bg-surface p-5 shadow-soft ring-1 ring-line">
              <IconBadge icon={withIcons[i]} size="lg" tone={i % 2 ? "neon" : "brand"} shape="hex" />
              <div>
                <p className="text-lg font-extrabold tracking-tight text-ink">{w.t[lang]}</p>
                <p className="mt-1 leading-snug text-ink-soft">{w.d[lang]}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Motto band */}
        <Reveal className="mt-5 flex flex-col gap-6 rounded-[2rem] bg-brand-600 p-6 text-white shadow-float sm:p-8 lg:flex-row lg:items-center lg:justify-between dark:bg-brand-700">
          <p className="max-w-md text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{whyBit.motto[lang]}</p>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
            {whyBit.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <li key={v.t.es} className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/12 text-lime ring-1 ring-white/25">
                    <Icon weight="duotone" className="size-7" />
                  </span>
                  <span className="leading-tight">
                    <span className="block font-extrabold">{v.t[lang]}</span>
                    <span className="text-sm text-white/75">{v.d[lang]}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
