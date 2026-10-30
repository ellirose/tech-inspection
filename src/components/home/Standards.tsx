import { Check, GraduationCap, Headset, ListChecks, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import { standards } from "@/content/deck";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const look = {
  "DS-1": { hex: "bg-pt text-white", check: "text-pt", card: "rounded-[2rem] rounded-tl-[5rem]" },
  ASTM: { hex: "bg-brand-600 text-white dark:bg-brand-400", check: "text-brand-500 dark:text-brand-300", card: "rounded-[2rem]" },
  API: { hex: "bg-lime text-[#0b1533]", check: "text-lime-deep dark:text-lime", card: "rounded-[2rem] rounded-br-[5rem]" },
} as const;

const moreIcons = [ListChecks, GraduationCap, Headset];

/** Slide 8: the international standards behind each decision. */
export function Standards({ lang, index = "06" }: { lang: Locale; index?: string }) {
  const t = standards.triad;
  return (
    <section className="relative isolate overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-fade-y" />
      <Container>
        <SectionHeading align="center" index={index} eyebrow="DS-1 · ASTM · API" title={standards.title[lang]} lead={standards.lead[lang]} />

        <RevealGroup className="mt-16 grid gap-6 pt-10 lg:grid-cols-3">
          {standards.items.map((s) => {
            const l = look[s.code];
            return (
              <RevealItem key={s.code} className={cn("relative flex flex-col bg-surface px-7 pb-8 pt-16 shadow-card ring-1 ring-line sm:px-9", l.card)}>
                <span className={cn("shape-hex absolute -top-10 left-1/2 grid size-24 -translate-x-1/2 place-items-center text-xl font-extrabold tracking-tight", l.hex)}>{s.code}</span>
                <p className="text-center text-xl font-extrabold tracking-tight text-ink">{s.t[lang]}</p>
                <ul className="mb-6 mt-6 space-y-2.5">
                  {s.points[lang].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-[1.05rem] font-semibold text-ink-soft">
                      <Check weight="bold" className={cn("mt-1 size-5 shrink-0", l.check)} />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-auto flex gap-3 rounded-2xl bg-surface-2 p-4 text-[0.95rem] leading-relaxed text-ink-soft ring-1 ring-line">
                  <ShieldCheck weight="duotone" className={cn("size-6 shrink-0", l.check)} />
                  {s.note[lang]}
                </p>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <Reveal className="rounded-[2rem] bg-surface p-7 shadow-soft ring-1 ring-line sm:p-9 lg:col-span-7">
            <p className="text-xl font-extrabold tracking-tight text-ink">{standards.moreTitle[lang]}</p>
            <div className="mt-7 grid gap-7 sm:grid-cols-3">
              {standards.more.map((m, i) => (
                <div key={m.t.es}>
                  <IconBadge icon={moreIcons[i]} size="lg" tone={["brand", "neon", "lime"][i] as "brand"} />
                  <p className="mt-4 text-lg font-extrabold tracking-tight text-ink">{m.t[lang]}</p>
                  <p className="mt-1.5 leading-relaxed text-ink-soft">{m.d[lang]}</p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Triad: design (API), inspection (DS-1) and methods (ASTM) converge on the component */}
          <Reveal delay={0.1} className="grid gap-6 rounded-[2rem] rounded-tr-[5rem] bg-tint p-7 ring-1 ring-neon/25 sm:grid-cols-2 sm:items-center sm:p-9 lg:col-span-5">
            <div className="relative mx-auto aspect-square w-full max-w-64">
              <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden>
                <polygon points="100,26 26,158 174,158" fill="none" stroke="var(--color-neon)" strokeWidth="1.5" strokeDasharray="5 5" className="animate-dash" />
                <circle cx="100" cy="114" r="32" fill="var(--surface)" stroke="var(--color-neon)" strokeWidth="2" />
              </svg>
              {[
                { code: "API", sub: t.api[lang], cls: "left-1/2 top-0 -translate-x-1/2", hex: look.API.hex },
                { code: "DS-1", sub: t.ds1[lang], cls: "bottom-0 left-0", hex: look["DS-1"].hex },
                { code: "ASTM", sub: t.astm[lang], cls: "bottom-0 right-0", hex: look.ASTM.hex },
              ].map((n) => (
                <span key={n.code} className={cn("absolute flex w-[4.6rem] flex-col items-center text-center", n.cls)}>
                  <span className={cn("shape-hex grid size-14 place-items-center text-xs font-extrabold", n.hex)}>{n.code}</span>
                  <span className="mt-1 text-[0.62rem] font-semibold leading-tight text-ink-soft">{n.sub}</span>
                </span>
              ))}
              <span className="absolute left-1/2 top-[57%] w-16 -translate-x-1/2 -translate-y-1/2 text-center text-[0.6rem] font-bold leading-tight text-accent">{t.center[lang]}</span>
            </div>
            <p className="text-pretty text-lg font-semibold leading-relaxed text-ink">{standards.value[lang]}</p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
