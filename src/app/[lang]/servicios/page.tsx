import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { services } from "@/content/services";
import { methodByKey, methodTone } from "@/content/methods";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { ServiceGlyph } from "@/components/ui/Icons";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/servicios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/servicios", d.nav.services, d.pages.services.lead);
}

// Alternating silhouettes so the grid never reads as a wall of identical rectangles.
const frames = [
  "rounded-[2.5rem] rounded-tr-[6rem]",
  "rounded-[2.5rem]",
  "rounded-[2.5rem] rounded-bl-[6rem]",
  "shape-leaf",
];
// Full-width frames only: a circle here used to crop the crews out of their own photos.
const photoFrames = ["rounded-[1.75rem]", "rounded-[1.75rem] rounded-bl-[4rem]", "rounded-[1.75rem] rounded-tr-[4rem]", "rounded-b-[1.75rem] rounded-t-[7rem]"];

export default async function ServicesPage({ params }: PageProps<"/[lang]/servicios">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.services }]}
        eyebrow={d.servicesSection.eyebrow}
        title={d.pages.services.title}
        lead={d.pages.services.lead}
        image="/media/photos/workshop-team.jpg"
        imageClass="rounded-[3rem] rounded-bl-[8rem]"
      />
      <Container className="pb-8">
        <RevealGroup className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" stagger={0.06}>
          {services.map((s, i) => (
            <RevealItem key={s.slug}>
              <Link href={`/${lang}/servicios/${s.slug}`} className={cn("group flex h-full flex-col bg-white p-5 shadow-soft ring-1 ring-line transition hover:-translate-y-1.5 hover:shadow-lift", frames[i % frames.length])}>
                <div className={cn("relative aspect-[4/3] overflow-hidden bg-mist", photoFrames[i % photoFrames.length])}>
                  <Image src={s.image} alt={s.name[lang]} fill sizes="(min-width:1280px) 22vw, 50vw" className="object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col px-2 pb-2 pt-6">
                  <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <ServiceGlyph name={s.icon} className="size-8" />
                  </span>
                  <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">{s.name[lang]}</h2>
                  <p className="mt-2 text-ink-soft">{s.short[lang]}</p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="flex gap-1.5">
                      {s.methods.map((k) => (
                        <span key={k} className="rounded-full bg-canvas px-2 py-0.5 font-mono text-[0.7rem] font-bold ring-1 ring-line" style={{ color: methodTone[k].hex }}>
                          {methodByKey(k).code}
                        </span>
                      ))}
                    </span>
                    <span className="grid size-11 place-items-center rounded-full bg-brand-700 text-white transition duration-500 group-hover:rotate-45">
                      <ArrowUpRight weight="bold" className="size-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
      <CtaBand lang={lang} dict={d} />
    </>
  );
}
