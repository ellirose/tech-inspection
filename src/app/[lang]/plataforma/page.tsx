import { notFound } from "next/navigation";
import { ArrowUpRight, UserCircle, UsersThree } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { PLATFORM_URL } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Platform } from "@/components/home/Platform";
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

  const access = [
    { icon: UserCircle, t: p.clients, d: p.clientsText, cta: d.cta.platformClients, style: "bg-brand-700 text-white rounded-[2.5rem] rounded-tr-[7rem]", btn: "bg-white text-brand-700" },
    { icon: UsersThree, t: p.team, d: p.teamText, cta: d.cta.platformTeam, style: "bg-white ring-1 ring-line rounded-[2.5rem] rounded-bl-[7rem] shadow-lift", btn: "bg-brand-700 text-white" },
  ];

  return (
    <>
      <PageHero crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: "TI-QMS" }]} eyebrow={d.platform.eyebrow} title={p.title} lead={p.lead} />
      <Container>
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          {access.map((a) => (
            <RevealItem key={a.t} className={`relative overflow-hidden p-8 sm:p-10 ${a.style}`}>
              <a.icon weight="duotone" className="size-16 text-mt" />
              <h2 className="mt-6 font-display text-4xl font-bold tracking-tight">{a.t}</h2>
              <p className="mt-3 max-w-md text-lg opacity-80">{a.d}</p>
              <a href={PLATFORM_URL} target="_blank" rel="noopener" className={`group mt-8 inline-flex items-center gap-3 rounded-full px-7 py-4 font-display text-lg font-bold ${a.btn}`}>
                {a.cta}
                <ArrowUpRight weight="bold" className="size-5 transition group-hover:rotate-45" />
              </a>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
      <Platform dict={d} compact />
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
