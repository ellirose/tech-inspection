import { notFound } from "next/navigation";
import { Briefcase, Calculator, ClipboardText, EnvelopeSimple, Gear, Phone, ShieldCheck, Wallet, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { channels, company } from "@/content/site";
import { pageMeta } from "@/lib/metadata";
import { PageHero } from "@/components/ui/PageHero";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { QuoteSection } from "@/components/quote/QuoteSection";
import { Email } from "@/components/ui/Email";
import { cn } from "@/lib/cn";

export async function generateMetadata({ params }: PageProps<"/[lang]/contacto">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDictionary(lang);
  return pageMeta(lang, "/contacto", d.nav.contact, d.contact.lead);
}

// One icon per desk, in the order of the directory published on the original site.
const deskIcons = [Briefcase, Gear, ClipboardText, ShieldCheck, Wallet, Calculator];
const tones = ["solid", "neon", "brand", "lime", "brand", "neon"] as const;
const shapes = ["rounded-[2rem] rounded-tl-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-tr-[4rem]", "rounded-[2rem] rounded-bl-[4rem]", "rounded-[2rem]", "rounded-[2rem] rounded-br-[4rem]"];

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
        imagePosition="40% 35%"
        caption={company.phone}
      />
      <QuoteSection lang={lang} dict={d} heading={false} />

      <section className="bg-surface py-24 sm:py-28">
        <Container>
          <SectionHeading index="01" eyebrow={d.contact.eyebrow} title={d.contact.directory} lead={d.contact.directoryLead} />
          <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {channels.map((c, i) => {
              const digits = `57${c.phone.replace(/\D/g, "")}`;
              return (
                <RevealItem key={c.role.es} className={cn("flex flex-col bg-canvas p-6 shadow-soft ring-1 ring-line sm:p-7", shapes[i])}>
                  <div className="flex items-center gap-4">
                    <IconBadge icon={deskIcons[i]} size="lg" tone={tones[i]} />
                    <h3 className="text-xl font-extrabold leading-tight tracking-tight text-ink">{c.role[lang]}</h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-ink-soft">{c.scope[lang]}</p>
                  <div className="mt-auto space-y-2 pt-6">
                    <div className="flex gap-2">
                      <a href={`tel:+${digits}`} className="inline-flex h-12 flex-1 items-center gap-2 rounded-full bg-surface px-4 font-bold text-ink ring-1 ring-line transition hover:ring-accent/40">
                        <Phone weight="duotone" className="size-6 text-accent" /> {c.phone}
                      </a>
                      <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener" aria-label={`WhatsApp ${c.role[lang]}`} className="grid size-12 place-items-center rounded-full bg-whatsapp text-white">
                        <WhatsappLogo weight="fill" className="size-6" />
                      </a>
                    </div>
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 rounded-[1.4rem] bg-surface px-4 py-3 text-[0.95rem] font-bold text-ink ring-1 ring-line transition hover:ring-accent/40">
                      <EnvelopeSimple weight="duotone" className="size-6 shrink-0 text-accent" />
                      <span className="min-w-0">
                        <Email address={c.email} />
                      </span>
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
