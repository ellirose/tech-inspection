import { notFound } from "next/navigation";
import { EnvelopeSimple, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { channels } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, Eyebrow } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { QuoteSection } from "@/components/quote/QuoteSection";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/contacto", d.nav.contact, d.contact.lead);
}

const tones = ["bg-brand-50 text-brand-700", "bg-ut-soft text-[#0784b8]", "bg-vt-soft text-[#b46f00]", "bg-mt-soft text-[#3f8a07]", "bg-brand-50 text-brand-700", "bg-pt-soft text-pt"];

export default async function ContactPage({ params }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDictionary(lang);

  return (
    <>
      <PageHero
        crumbs={[{ label: d.nav.home, href: `/${lang}` }, { label: d.nav.contact }]}
        eyebrow={d.contact.eyebrow}
        title={d.contact.title}
        lead={d.contact.lead}
        image="/media/photos/crew-yard.jpg"
        imageClass="rounded-[3rem] rounded-tl-[8rem]"
      />
      <QuoteSection lang={lang} dict={d} heading={false} />

      <section className="bg-white py-20">
        <Container>
          <Eyebrow>{d.contact.directory}</Eyebrow>
          <p className="mt-4 text-lg text-ink-soft">{d.contact.directoryLead}</p>
          <RevealGroup className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((c, i) => {
              const digits = `57${c.phone.replace(/\D/g, "")}`;
              return (
                <RevealItem key={c.role.es} className={cn("flex flex-col bg-canvas p-7 ring-1 ring-line", i % 3 === 1 ? "rounded-[2rem] rounded-tr-[5rem]" : "rounded-[2rem]")}>
                  <span className={cn("w-fit rounded-full px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-widest", tones[i])}>{c.role[lang]}</span>
                  <p className="mt-4 leading-relaxed text-ink-soft">{c.scope[lang]}</p>
                  <div className="mt-auto space-y-2 pt-6">
                    <div className="flex gap-2">
                      <a href={`tel:+${digits}`} className="inline-flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2.5 font-semibold text-ink ring-1 ring-line hover:ring-brand-300">
                        <Phone weight="duotone" className="size-5 text-brand-700" /> {c.phone}
                      </a>
                      <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${c.role[lang]}`} className="grid size-11 place-items-center rounded-full bg-whatsapp text-white">
                        <WhatsappLogo weight="fill" className="size-5" />
                      </a>
                    </div>
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 break-all rounded-full bg-white px-4 py-2.5 text-[0.95rem] font-semibold text-ink ring-1 ring-line hover:ring-brand-300">
                      <EnvelopeSimple weight="duotone" className="size-5 shrink-0 text-brand-700" /> {c.email}
                    </a>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </section>
    </>
  );
}
