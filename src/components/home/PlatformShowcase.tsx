import Image from "next/image";
import { Certificate, ChatsCircle, ClipboardText, Clock, FileText, Handshake, IdentificationCard, LinkSimple, ListChecks, MagnifyingGlass, SealCheck, ShieldCheck } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getBlock, getSite } from "@/lib/data/content";
import { Container, Eyebrow, IconBadge } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { cue } from "@/lib/scene";

const featureIcons = {
  requests: ClipboardText,
  tracking: ListChecks,
  reports: FileText,
  evidence: Certificate,
  contracts: Handshake,
  payroll: IdentificationCard,
  pqr: ChatsCircle,
  policies: ShieldCheck,
} as const;
const benefitIcons = [Clock, LinkSimple, SealCheck, MagnifyingGlass];
const tones = ["solid", "neon", "brand", "lime", "brand", "lime", "solid", "neon"] as const;
// Two rows of four: the outer corners of the grid are cut deeper
const shapes = [
  "rounded-[2rem] rounded-tl-[3.5rem]",
  "rounded-[2rem]",
  "rounded-[2rem]",
  "rounded-[2rem] rounded-tr-[3.5rem]",
  "rounded-[2rem] rounded-bl-[3.5rem]",
  "rounded-[2rem]",
  "rounded-[2rem]",
  "rounded-[2rem] rounded-br-[3.5rem]",
];
// The block is stored in the database, so a key without its own icon falls back to the first one
const iconFor = (key: string) => featureIcons[key as keyof typeof featureIcons] ?? ClipboardText;
// Floating off the tablet: what a client checks most
const floating = ["evidence", "tracking"];

/** Slide 10: TI-QMS, the digital traceability platform. */
export async function PlatformShowcase({
  lang,
  dict,
  index,
  benefits = false,
  link = true,
  compact = false,
  title,
  className,
}: {
  lang: Locale;
  dict: Dictionary;
  index?: string;
  benefits?: boolean;
  link?: boolean;
  /** Feature list beside the tablet instead of a card grid (landing page). */
  compact?: boolean;
  title?: string;
  className?: string;
}) {
  const [tiqms, { platformUrl: PLATFORM_URL }] = await Promise.all([getBlock("tiqms"), getSite()]);
  const f = tiqms.features;
  return (
    // Lime pulses: the inspection becoming a digital record
    <section {...cue({ mode: "rigs", intensity: 0.65, veil: 0.4, accent: "#86e33a" })} className={cn("relative isolate overflow-hidden py-24 sm:py-32", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-network opacity-40 mask-fade-y" />
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <Eyebrow index={index}>TI-QMS · {tiqms.kicker[lang]}</Eyebrow>
            <h2 className="mt-6 text-balance text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink">{title ?? tiqms.title[lang]}</h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft sm:text-xl">{dict.platform.lead}</p>
            {compact && (
              <ul className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {f.map((x, i) => {
                  const Icon = iconFor(x.key);
                  return (
                    <li key={x.key} className="flex items-center gap-3.5">
                      <IconBadge icon={Icon} size="md" tone={tones[i]} shape={i % 2 ? "circle" : "square"} />
                      <span className="text-[1.05rem] font-bold leading-tight text-ink">{x.t[lang]}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {link && <ButtonLink href={`/${lang}/plataforma`}>{dict.ui.seePlatform}</ButtonLink>}
              <ButtonLink href={PLATFORM_URL} variant="ghost">
                {dict.ui.platformAccess}
              </ButtonLink>
            </div>
          </Reveal>

          {/* Tablet in perspective, with two features floating off it */}
          <Reveal delay={0.1} className="perspective relative lg:col-span-7">
            <div className="preserve-3d transition duration-700 [transform:rotateY(-12deg)_rotateX(5deg)] hover:[transform:rotateY(-4deg)_rotateX(2deg)]">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[2.5rem] shadow-float ring-8 ring-surface">
                <Image src="/media/deck/tiqms-tablet.jpg" alt="TI-QMS" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" quality={90} />
              </div>
            </div>
            {f.filter((x) => floating.includes(x.key)).map((x, i) => {
              const Icon = iconFor(x.key);
              return (
                <div key={x.key} className={cn("glass absolute hidden animate-float items-center gap-3 rounded-2xl py-3 pl-3 pr-5 shadow-float ring-1 ring-line/70 sm:flex", i ? "-bottom-6 right-6" : "-left-4 top-8")} style={{ animationDelay: `${i * 1.5}s` }}>
                  <IconBadge icon={Icon} size="md" tone={i ? "lime" : "solid"} />
                  <span className="text-[1.05rem] font-extrabold text-ink">{x.t[lang]}</span>
                </div>
              );
            })}
          </Reveal>
        </div>

        {!compact && (
        <RevealGroup className="mt-20 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {f.map((x, i) => {
            const Icon = iconFor(x.key);
            return (
              <RevealItem key={x.key} className={cn("flex flex-col gap-5 bg-surface p-6 shadow-soft ring-1 ring-line sm:p-7", shapes[i])}>
                <IconBadge icon={Icon} size="xl" tone={tones[i]} shape={i % 2 ? "circle" : "square"} />
                <div>
                  <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{x.t[lang]}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{x.d[lang]}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
        )}

        {benefits && (
          <div className="mt-16">
            <Reveal>
              <p className="text-center text-2xl font-extrabold tracking-tight text-ink">{tiqms.benefitsTitle[lang]}</p>
            </Reveal>
            <RevealGroup className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {tiqms.benefits.map((b, i) => (
                <RevealItem key={b.t.es} className="flex flex-col items-center text-center">
                  <IconBadge icon={benefitIcons[i]} size="xl" tone={i % 2 ? "neon" : "solid"} shape="circle" />
                  <p className="mt-5 text-lg font-extrabold tracking-tight text-ink">{b.t[lang]}</p>
                  <p className="mt-1.5 max-w-xs leading-relaxed text-ink-soft">{b.d[lang]}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        )}
      </Container>
    </section>
  );
}
