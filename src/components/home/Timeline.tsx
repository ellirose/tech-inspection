import { ArrowsClockwise, Buildings, Certificate, ClipboardText, Desktop, Handshake, HardHat, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { timeline, timelineIntro, type Milestone } from "@/content/deck";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const icons: Record<Milestone["icon"], typeof Buildings> = {
  founding: Buildings,
  alliance: Handshake,
  rebrand: ArrowsClockwise,
  iso: Certificate,
  ruc: ShieldCheck,
  direction: HardHat,
  scope: ClipboardText,
  digital: Desktop,
};

// Rising curve: each milestone's dot sits higher than the last (px from the bottom of a 34rem stage).
const H = 544;
const lift = (i: number) => 36 + 230 * Math.pow(i / (timeline.length - 1), 1.45);

/** Slide 2: our track record, 2014 → 2026, as a rising curve with dashed stems. */
export function Timeline({ lang, dict, index }: { lang: Locale; dict: Dictionary; index?: string }) {
  const n = timeline.length;
  const pts = timeline.map((_, i) => [((i + 0.5) / n) * 1000, H - lift(i)] as const);
  const d = `M0 ${H - 20} ` + pts.map(([x, y], i) => (i === 0 ? `S ${x - 60} ${y + 8} ${x} ${y}` : `S ${x - 60} ${y + 12} ${x} ${y}`)).join(" ") + ` S 990 ${pts[n - 1][1] - 30} 1000 ${pts[n - 1][1] - 40}`;

  return (
    <section className="relative isolate overflow-hidden bg-surface py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-fade-y" />
      <Container>
        <SectionHeading index={index} eyebrow="2014 — 2026" title={dict.ui.trajectory} lead={timelineIntro[lang]} />

        {/* Wide screens: the curve */}
        <Reveal className="relative mt-10 hidden lg:block" style={{ height: H }}>
          <svg viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <path d={d} fill="none" stroke="var(--color-neon)" strokeWidth="10" strokeOpacity="0.15" vectorEffect="non-scaling-stroke" />
            <path d={d} fill="none" stroke="var(--color-neon)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
          {timeline.map((m, i) => {
            const Icon = icons[m.icon];
            const last = i === n - 1;
            return (
              <div key={m.year} className="absolute flex w-[11.5%] -translate-x-1/2 flex-col items-center text-center" style={{ left: `${((i + 0.5) / n) * 100}%`, bottom: lift(i) - 9 }}>
                <span className={cn("grid size-16 place-items-center rounded-full shadow-card ring-1", last ? "bg-lime text-[#0b1533] ring-lime" : "bg-surface text-accent ring-line")}>
                  <Icon weight="duotone" className="size-8" />
                </span>
                <span className={cn("mt-2 text-2xl font-extrabold tracking-tight", last ? "text-accent-ink" : "text-ink")}>{m.year}</span>
                <span className="mt-1 text-[0.92rem] font-semibold leading-snug text-ink-soft">{m.t[lang]}</span>
                <span aria-hidden className="mt-2 h-10 w-0.5 bg-[repeating-linear-gradient(to_bottom,var(--color-neon)_0_4px,transparent_4px_8px)]" />
                <span className={cn("size-[18px] rounded-full ring-4 ring-surface", last ? "bg-lime shadow-[0_0_16px_4px_rgb(134_227_58/0.6)]" : "bg-neon shadow-[0_0_14px_3px_rgb(31_200_245/0.5)]")} />
              </div>
            );
          })}
        </Reveal>

        {/* Narrow screens: a vertical rail */}
        <RevealGroup className="relative mt-12 space-y-4 lg:hidden">
          <span aria-hidden className="absolute bottom-6 left-8 top-6 w-0.5 bg-neon/50" />
          {timeline.map((m, i) => {
            const Icon = icons[m.icon];
            const last = i === n - 1;
            return (
              <RevealItem key={m.year} className="relative flex items-center gap-4">
                <span className={cn("grid size-16 shrink-0 place-items-center rounded-full shadow-card ring-1", last ? "bg-lime text-[#0b1533] ring-lime" : "bg-surface text-accent ring-line")}>
                  <Icon weight="duotone" className="size-8" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight text-ink">{m.year}</p>
                  <p className="font-semibold text-ink-soft">{m.t[lang]}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
