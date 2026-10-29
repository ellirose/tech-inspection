import Image from "next/image";
import { Clock, EnvelopeSimple, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { company, policyDocs, whatsappLink } from "@/content/site";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { Container, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { Email } from "@/components/ui/Email";
import { QuoteWizard } from "./QuoteWizard";

export function QuoteSection({ lang, dict, heading = true }: { lang: Locale; dict: Dictionary; heading?: boolean }) {
  const q = dict.quote;
  const c = dict.contact;
  const contactRows = [
    { icon: Phone, label: c.phone, value: company.phone, href: company.phoneHref },
    { icon: EnvelopeSimple, label: c.email, value: <Email address={company.email} />, href: `mailto:${company.email}` },
    { icon: Clock, label: c.hours, value: company.hours[lang] },
    { icon: MapPin, label: c.address, value: `${company.address}, ${company.country[lang]}`, href: company.mapsUrl },
  ];

  return (
    <section id="cotizar" className={cn("relative overflow-hidden pb-20 sm:pb-28", heading ? "pt-20 sm:pt-28" : "pt-2")}>
      <div className="pointer-events-none absolute inset-0 bg-blueprint mask-radial opacity-80" />
      <div className="pointer-events-none absolute -right-48 top-24 size-[40rem] rounded-full bg-brand-100/60 blur-3xl" />
      <Container className="relative">
        {heading && <SectionHeading eyebrow={q.eyebrow} title={q.title} lead={q.lead} />}
        <div className={cn("grid gap-6 lg:grid-cols-12", heading && "mt-14")}>
          <Reveal className="lg:col-span-8">
            <QuoteWizard
              lang={lang}
              t={q}
              whatsapp={company.whatsapp}
              policyHref={policyDocs.find((d) => d.code === "PL-09-1")!.file}
              services={services.map((s) => ({ slug: s.slug, icon: s.icon, name: s.name[lang] }))}
              methods={methods.map((m) => ({ key: m.key, code: m.code, name: m.name[lang] }))}
            />
          </Reveal>

          <Reveal delay={0.12} className="flex flex-col gap-4 lg:col-span-4">
            {/* Photo and WhatsApp button stacked, so the button never covers the inspector. */}
            <div className="relative min-h-56 flex-1 overflow-hidden rounded-[2.5rem] rounded-tr-[6rem] shadow-lift">
              <Image src="/media/photos/inspector-logo.jpg" alt="" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover object-[50%_25%]" />
            </div>
            <a href={whatsappLink(q.waIntro)} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-[1.5rem] bg-whatsapp p-4 text-white shadow-float transition hover:-translate-y-0.5">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/20">
                <WhatsappLogo weight="fill" className="size-7" />
              </span>
              <span>
                <span className="block font-display text-lg font-bold leading-tight">{dict.cta.whatsapp}</span>
                <span className="text-sm text-white/85">{company.phone}</span>
              </span>
            </a>
            <ul className="space-y-1 rounded-[2rem] bg-white p-3 shadow-soft ring-1 ring-line">
              {contactRows.map(({ icon: Icon, label, value, href }) => {
                const inner = (
                  <>
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon weight="duotone" className="size-7" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mute">{label}</span>
                      <span className="block break-words font-semibold text-ink">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="flex items-center gap-4 rounded-[1.4rem] p-2.5 transition hover:bg-canvas">
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-center gap-4 p-2.5">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
