import { Certificate, ShieldCheck, Ruler } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { cover, credentials } from "@/content/deck";
import { Container, Eyebrow, Swoosh } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { HeroVisual } from "./HeroVisual";

/** Cover slide of the client deck, rebuilt as a one-screen hero. */
export function HomeHero({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const c = (k: string) => credentials.find((x) => x.key === k)!;
  const words = cover.title[lang].split(" ");
  const last = words.pop();
  const trust = [
    { icon: Certificate, label: "ISO 9001 · ISO 45001" },
    { icon: ShieldCheck, label: "RUC" },
    { icon: Ruler, label: "ISO/IEC 17025" },
  ];

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-10 pt-32 lg:pt-28">
      {/* Background: blueprint grid, network lines, two soft neon glows, swoosh strokes */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-radial" />
      <div className="pointer-events-none absolute -right-20 top-10 -z-10 h-[38rem] w-[46rem] bg-network opacity-70 mask-radial" />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[42rem] rounded-full bg-neon/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-40 -z-10 size-[30rem] rounded-full bg-lime/15 blur-[110px]" />
      <Swoosh className="absolute -left-10 bottom-0 -z-10 w-[42rem] text-neon" />

      <Container className="grid items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-6">
          <Eyebrow index="NDT">Tech-Inspection S.A.S.</Eyebrow>
          <h1 className="mt-7 text-balance text-[clamp(2.8rem,5.3vw,5.6rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink">
            {words.join(" ")}{" "}
            <span className="relative z-0 whitespace-nowrap text-accent">
              {last}
              <span aria-hidden className="absolute -bottom-1 left-0 -z-10 h-[0.32em] w-full rounded-full bg-lime/70" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{cover.lead[lang]}</p>
          <p className="mt-5 flex items-center gap-3 text-base font-bold text-accent-ink">
            <span aria-hidden className="h-0.5 w-10 shrink-0 rounded-full bg-neon" />
            {cover.motto[lang]}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/${lang}/contacto#cotizar`}>{dict.cta.quote}</ButtonLink>
            <ButtonLink href={`/${lang}/servicios/brocas`} variant="ghost">
              {dict.ui.bitService}
            </ButtonLink>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-sm font-bold text-ink shadow-soft ring-1 ring-line">
                <span className="grid size-8 place-items-center rounded-full bg-tint text-accent">
                  <Icon weight="duotone" className="size-5" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15} className="hidden lg:col-span-6 lg:block">
          <HeroVisual
            alt={dict.ui.bitService}
            ds1="DS-1"
            videoLabel="Oil & Gas"
            chips={[
              { value: c("people").value[lang], label: `${c("people").t[lang]} · ASNT` },
              { value: c("experience").value[lang], label: c("experience").t[lang] },
              { value: c("quality").value[lang], label: c("quality").t[lang] },
            ]}
          />
        </Reveal>
      </Container>
    </section>
  );
}
