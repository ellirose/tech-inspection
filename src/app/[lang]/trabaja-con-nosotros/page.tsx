import { notFound } from "next/navigation";
import { Briefcase, EnvelopeSimple, GraduationCap, MagnifyingGlass, SealCheck, ShieldCheck, UsersThree, Wrench } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getDocuments } from "@/lib/data/content";
import { pageMeta } from "@/lib/metadata";
import { CAREERS_EMAIL } from "@/lib/site";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Email } from "@/components/ui/Email";

const profileIcons = [MagnifyingGlass, Wrench, SealCheck, Briefcase];
const offerIcons = [GraduationCap, ShieldCheck, UsersThree];

export async function generateMetadata({ params }: PageProps<"/[lang]/trabaja-con-nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/trabaja-con-nosotros", d.nav.careers, d.pages.careers.lead);
}

/** Careers: who we hire, what we offer, and how to send a CV (by email, with the data-protection notice). */
export default async function CareersPage({ params }: PageProps<"/[lang]/trabaja-con-nosotros">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const c = d.pages.careers;
  const policy = (await getDocuments("policy")).find((doc) => doc.code === "PL-09-1");
  const mailto = `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(c.subject)}`;

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.careers }]}
        eyebrow={d.nav.careers}
        title={c.title}
        lead={c.lead}
        image="/media/hseq/training-1.jpg"
        imagePosition="50% 40%"
        caption="Tech-Inspection S.A.S."
      >
        <ButtonLink href="#postularse" className="mt-8">
          {c.applyCta}
        </ButtonLink>
      </PageHero>

      {/* Profiles */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading index="01" eyebrow={d.nav.careers} title={c.profilesTitle} lead={c.profilesLead} />
          <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {c.profiles.map((p, i) => (
              <RevealItem key={p.t} className="rounded-[2.25rem] bg-surface p-7 shadow-card ring-1 ring-line">
                <IconBadge icon={profileIcons[i]} tone={i === 0 ? "solid" : "neon"} />
                <h3 className="mt-6 text-2xl font-extrabold leading-tight tracking-tight text-ink">{p.t}</h3>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-soft">{p.d}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* What we offer */}
      <section className="band py-24 sm:py-32">
        <Container>
          <Eyebrow index="02">{c.offerTitle}</Eyebrow>
          <RevealGroup className="mt-10 grid gap-6 lg:grid-cols-3">
            {c.offer.map((o, i) => (
              <RevealItem key={o.t} className="flex gap-5 rounded-[2.25rem] bg-surface p-7 shadow-card ring-1 ring-line">
                <IconBadge icon={offerIcons[i]} tone="lime" shape="circle" className="shrink-0" />
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-ink">{o.t}</h3>
                  <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">{o.d}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      {/* How to apply */}
      <section id="postularse" className="scroll-mt-32 py-24 sm:py-32">
        <Container>
          <Reveal className="grid gap-10 rounded-[2.5rem] rounded-tr-[5rem] bg-brand-600 p-8 text-white shadow-float sm:p-12 lg:grid-cols-12 dark:bg-brand-700">
            <div className="lg:col-span-6">
              <Eyebrow index="03" tone="onImage">
                {c.applyTitle}
              </Eyebrow>
              <ol className="mt-8 space-y-5">
                {c.apply.map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white font-mono text-sm font-bold text-[#071a2e]">{i + 1}</span>
                    <span className="pt-1.5 text-lg font-semibold leading-snug">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col justify-center gap-6 lg:col-span-6">
              <a href={mailto} className="flex items-center gap-4 rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/20 transition hover:bg-white/15">
                <EnvelopeSimple weight="duotone" className="size-9 shrink-0 text-lime" />
                <span className="min-w-0 text-lg font-bold">
                  <Email address={CAREERS_EMAIL} />
                </span>
              </a>
              <ButtonLink href={mailto} variant="light" className="self-start">
                {c.applyCta}
              </ButtonLink>
              <p className="text-sm leading-relaxed text-white/75">
                {c.privacy}{" "}
                {policy ? (
                  <a href={policy.file} target="_blank" rel="noopener" className="font-bold text-white underline underline-offset-4">
                    {c.privacyLink}
                  </a>
                ) : (
                  c.privacyLink
                )}
                .
              </p>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
