import Image from "next/image";
import { notFound } from "next/navigation";
import { EnvelopeSimple, Eye, Target } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { leadership } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Credentials } from "@/components/home/Credentials";
import { Timeline } from "@/components/home/Timeline";
import { Partner } from "@/components/home/Partner";
import { Closing } from "@/components/home/Closing";
import { Clients } from "@/components/home/Clients";
import { Certifications } from "@/components/home/Certifications";
import { CtaBand } from "@/components/ui/CtaBand";
import { Mosaic } from "@/components/media/Mosaic";
import { photo } from "@/lib/media";
import { Email } from "@/components/ui/Email";

export async function generateMetadata({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/nosotros", d.nav.about, d.pages.about.lead);
}

export default async function AboutPage({ params }: PageProps<"/[lang]/nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const a = d.pages.about;
  const team = [
    { ...photo("/media/photos/team-office.jpg"), pos: "50% 45%" },
    { ...photo("/media/photos/team-uniform.jpg"), pos: "50% 30%" },
    { ...photo("/media/photos/workshop-team.jpg"), pos: "50% 40%" },
    { ...photo("/media/photos/team-blue.jpg"), pos: "50% 35%" },
    { ...photo("/media/photos/inspector-logo.jpg"), pos: "50% 25%" },
    { ...photo("/media/photos/bit-inspection.jpg"), pos: "65% 35%" },
    { ...photo("/media/hseq/integration-3.jpg"), pos: "50% 55%" },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.about }]}
        eyebrow={d.nav.about}
        title={a.title}
        lead={a.lead}
        image="/media/deck/team.jpg"
        imagePosition="50% 30%"
        caption="Tech-Inspection S.A.S."
      />

      {/* Story, mission, vision */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-6 lg:grid-cols-12">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-brand-600 p-8 text-white shadow-float sm:p-10 lg:col-span-5 dark:bg-brand-700">
            <div className="pointer-events-none absolute inset-0 bg-network opacity-40" />
            <p className="relative text-balance text-[clamp(1.5rem,2.3vw,2rem)] font-extrabold leading-snug tracking-[-0.02em]">{a.story}</p>
          </Reveal>
          <Reveal delay={0.08} className="rounded-[2.5rem] rounded-tr-[5rem] bg-surface p-8 shadow-card ring-1 ring-line sm:p-10 lg:col-span-4">
            <IconBadge icon={Target} size="xl" tone="neon" />
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">{a.mission}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{a.missionText}</p>
          </Reveal>
          <Reveal delay={0.16} className="rounded-[2.5rem] rounded-bl-[5rem] border-2 border-dashed border-neon/50 bg-tint p-8 sm:p-10 lg:col-span-3">
            <IconBadge icon={Eye} size="xl" tone="lime" shape="circle" />
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">{a.vision}</h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-soft">{a.visionText}</p>
          </Reveal>
        </Container>
      </section>

      <Credentials lang={lang} dict={d} index="01" />
      <Timeline lang={lang} dict={d} index="02" />
      <Partner lang={lang} dict={d} index="03" intro={false} />
      <Closing lang={lang} index="04" ulterra />

      {/* Team */}
      <section className="bg-surface py-24 sm:py-32">
        <Container>
          <SectionHeading index="05" eyebrow={a.team} title={a.teamTitle} lead={a.teamLead} />
          <Mosaic className="mt-14" items={team} alt={a.team} />
        </Container>
      </section>

      {/* Leadership */}
      <section id="liderazgo" className="py-24 sm:py-32">
        <Container>
          <Eyebrow index="06">{a.leadership}</Eyebrow>
          <RevealGroup className="mt-10 grid gap-6 xl:grid-cols-2">
            {leadership.map((p, i) => (
              <RevealItem key={p.name} className={`grid items-center gap-6 bg-surface p-5 shadow-card ring-1 ring-line sm:grid-cols-[14rem_minmax(0,1fr)] sm:p-6 ${i ? "rounded-[2.5rem] rounded-tr-[5rem]" : "rounded-[2.5rem] rounded-tl-[5rem]"}`}>
                {/* Portraits are 3:4, so the frame matches and nothing is cropped. */}
                <div className="relative mx-auto aspect-[3/4] w-full max-w-64 overflow-hidden rounded-[2rem] bg-surface-2">
                  <Image src={p.photo} alt={p.name} fill sizes="(min-width:640px) 14rem, 16rem" className="object-cover" />
                </div>
                <div>
                  <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-accent-ink">{p.role[lang]}</p>
                  <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{p.name}</h3>
                  <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">{p.bio[lang]}</p>
                  <a href={`mailto:${p.email}`} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-tint px-4 py-2.5 text-sm font-bold text-accent ring-1 ring-neon/25">
                    <EnvelopeSimple weight="duotone" className="size-5 shrink-0" />
                    <span className="min-w-0">
                      <Email address={p.email} />
                    </span>
                  </a>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <Clients lang={lang} dict={d} />
      <Certifications lang={lang} dict={d} index="07" />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
