import Image from "next/image";
import { Clock, EnvelopeSimple, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { company, policyDocs, whatsappLink } from "@/content/site";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { Container, IconBadge, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { Email } from "@/components/ui/Email";
import { QuoteWizard } from "./QuoteWizard";

export function QuoteSection({ lang, dict, heading = true, index }: { lang: Locale; dict: Dictionary; heading?: boolean; index?: string }) {
  const q = dict.quote;
  const c = dict.contact;
  const contactRows = [
    { icon: Phone, label: c.phone, value: company.phone, href: company.phoneHref },
    { icon: EnvelopeSimple, label: c.email, value: <Email address={company.email} />, href: `mailto:${company.email}` },
    { icon: Clock, label: c.hours, value: company.hours[lang] },
    { icon: MapPin, label: c.address, value: `${company.address}, ${company.country[lang]}`, href: company.mapsUrl },
  ];

  return (
    <section id="cotizar" className={cn("relative isolate overflow-hidden pb-24 sm:pb-32", heading ? "pt-24 sm:pt-32" : "pt-6")}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-radial" />
      <Container>
        {heading && <SectionHeading index={index} eyebrow={q.eyebrow} title={q.title} lead={q.lead} />}
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

          <Reveal delay={0.1} className="flex flex-col gap-5 lg:col-span-4">
            {/* Photo and WhatsApp stacked, so the button never covers the inspector */}
            <div className="relative min-h-56 flex-1 overflow-hidden rounded-[2.5rem] rounded-tl-[5rem] shadow-card">
              <Image src="/media/photos/inspector-logo.jpg" alt="" fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover object-[50%_25%]" />
            </div>
            <a href={whatsappLink(q.waIntro)} target="_blank" rel="noopener" className="group flex items-center gap-4 rounded-[1.75rem] bg-whatsapp p-4 text-white shadow-[0_18px_36px_-16px_rgb(37_211_102/0.8)] transition hover:-translate-y-0.5">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
                <WhatsappLogo weight="fill" className="size-8" />
              </span>
              <span>
                <span className="block text-lg font-extrabold leading-tight">{dict.cta.whatsapp}</span>
                <span className="font-semibold text-white/85">{company.whatsappDisplay}</span>
              </span>
            </a>
            <ul className="space-y-1 rounded-[2rem] bg-surface p-3 shadow-soft ring-1 ring-line">
              {contactRows.map(({ icon, label, value, href }) => {
                const inner = (
                  <>
                    <IconBadge icon={icon} size="md" tone="neon" />
                    <span className="min-w-0">
                      <span className="block font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-mute">{label}</span>
                      <span className="block break-words font-bold text-ink">{value}</span>
                    </span>
                  </>
                );
                return (
                  <li key={label}>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener" className="flex items-center gap-4 rounded-[1.4rem] p-2.5 transition hover:bg-surface-2">
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
