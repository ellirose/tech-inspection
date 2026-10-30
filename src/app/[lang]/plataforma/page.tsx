import { notFound } from "next/navigation";
import { UserCircle, UsersThree } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PLATFORM_URL } from "@/content/site";
import { timeline } from "@/content/deck";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, IconBadge } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PlatformShowcase } from "@/components/home/PlatformShowcase";
import { Process } from "@/components/home/Process";
import { CtaBand } from "@/components/ui/CtaBand";

export async function generateMetadata({ params }: PageProps<"/[lang]/plataforma">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/plataforma", "TI-QMS", d.pages.platform.lead);
}

export default async function PlatformPage({ params }: PageProps<"/[lang]/plataforma">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = d.pages.platform;
  const digital = timeline.find((m) => m.icon === "digital")!;

  const access = [
    { icon: UserCircle, t: p.clients, d: p.clientsText, cta: d.cta.platformClients },
    { icon: UsersThree, t: p.team, d: p.teamText, cta: d.cta.platformTeam },
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: "TI-QMS" }]}
        eyebrow={d.platform.eyebrow}
        title={p.title}
        lead={p.lead}
        image="/media/stock/plant-night.jpg"
        caption={`${digital.year} · ${digital.t[lang]}`}
      />

      <section className="pb-16">
        <Container>
          <RevealGroup className="grid gap-6 md:grid-cols-2">
            {access.map((a, i) => (
              <RevealItem
                key={a.t}
                className={
                  i === 0
                    ? "relative overflow-hidden rounded-[2.5rem] rounded-tr-[6rem] bg-brand-600 p-8 text-white shadow-float sm:p-10 dark:bg-brand-700"
                    : "rounded-[2.5rem] rounded-bl-[6rem] bg-surface p-8 shadow-card ring-1 ring-line sm:p-10"
                }
              >
                <IconBadge icon={a.icon} size="xl" tone={i === 0 ? "lime" : "solid"} className={i === 0 ? "ring-0" : ""} />
                <h2 className={`mt-6 text-4xl font-extrabold tracking-tight ${i === 0 ? "" : "text-ink"}`}>{a.t}</h2>
                <p className={`mt-3 max-w-md text-lg ${i === 0 ? "text-white/80" : "text-ink-soft"}`}>{a.d}</p>
                <ButtonLink href={PLATFORM_URL} variant={i === 0 ? "light" : "primary"} className="mt-8">
                  {a.cta}
                </ButtonLink>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </section>

      <PlatformShowcase lang={lang} dict={d} index="01" benefits link={false} />
      <Process lang={lang} index="02" />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
