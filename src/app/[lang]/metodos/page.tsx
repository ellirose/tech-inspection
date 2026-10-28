import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { methods, methodTone } from "@/content/methods";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { MethodGlyph } from "@/components/ui/Icons";
import { MethodOverlay } from "@/components/visuals/MethodOverlay";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/metodos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/metodos", d.nav.methods, d.pages.methods.lead);
}

const frames = ["rounded-[2.5rem] rounded-tr-[7rem]", "rounded-[2.5rem] rounded-tl-[7rem]", "rounded-[2.5rem] rounded-br-[7rem]", "rounded-[2.5rem] rounded-bl-[7rem]"];

export default async function MethodsPage({ params }: PageProps<"/[lang]/metodos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.methods }]}
        eyebrow={d.methodsSection.eyebrow}
        title={d.pages.methods.title}
        lead={d.pages.methods.lead}
      />
      <Container className="pb-8">
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {methods.map((m, i) => (
            <RevealItem key={m.key}>
              <Link href={`/${lang}/metodos/${m.slug}`} className={cn("group relative flex h-full flex-col overflow-hidden bg-white shadow-lift ring-1 ring-line transition hover:-translate-y-1.5", frames[i])}>
                <div className="relative aspect-[16/10] overflow-hidden bg-brand-900">
                  <Image src={m.cover} alt={m.name[lang]} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-900/50 to-transparent" />
                  <MethodOverlay method={m.key} />
                  <span className="absolute left-6 top-6 rounded-full px-4 py-1.5 font-mono text-sm font-bold tracking-widest text-white" style={{ backgroundColor: methodTone[m.key].hex }}>
                    {m.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7 sm:p-9">
                  <div className="flex items-center gap-4">
                    <span className={cn("grid size-16 shrink-0 place-items-center rounded-2xl", methodTone[m.key].soft, methodTone[m.key].text)}>
                      <MethodGlyph name={m.key} className="size-9" />
                    </span>
                    <h2 className="font-display text-[2rem] font-bold leading-tight tracking-tight text-ink">{m.name[lang]}</h2>
                  </div>
                  <p className="mt-4 text-lg leading-relaxed text-ink-soft">{m.tagline[lang]}</p>
                  <div className="mt-auto flex items-center justify-between pt-7">
                    <span className="font-display font-bold text-brand-700">{d.cta.details}</span>
                    <span className="grid size-12 place-items-center rounded-full bg-brand-700 text-white transition duration-500 group-hover:rotate-45">
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
