import Link from "next/link";
import { ArrowUpRight, Clock, EnvelopeSimple, FilePdf, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { company, policyDocs, whatsappLink } from "@/content/site";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Section";
import { Email } from "@/components/ui/Email";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const base = `/${lang}`;
  const col = "font-mono text-xs font-bold uppercase tracking-[0.18em] text-mute";
  const link = "text-[1.02rem] font-medium text-ink-soft transition hover:text-brand-700";

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line bg-white">
      <div className="pointer-events-none absolute inset-0 bg-blueprint mask-radial opacity-70" />
      <Container className="relative">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <Logo className="h-14" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-soft">{dict.footer.tagline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={whatsappLink(dict.quote.waIntro)} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 font-display font-bold text-white">
                <WhatsappLogo weight="fill" className="size-5" /> WhatsApp
              </a>
              <a href={company.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-mist px-5 py-3 font-display font-bold text-ink ring-1 ring-line">
                <Phone weight="duotone" className="size-5 text-brand-700" /> {company.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-5">
            <div>
              <p className={col}>{dict.nav.methods}</p>
              <ul className="mt-5 space-y-3">
                {methods.map((m) => (
                  <li key={m.slug}><Link className={link} href={`${base}/metodos/${m.slug}`}>{m.name[lang]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className={col}>{dict.nav.services}</p>
              <ul className="mt-5 space-y-3">
                {services.map((s) => (
                  <li key={s.slug}><Link className={link} href={`${base}/servicios/${s.slug}`}>{s.name[lang]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className={col}>{dict.footer.company}</p>
              <ul className="mt-5 space-y-3">
                <li><Link className={link} href={`${base}/nosotros`}>{dict.nav.about}</Link></li>
                <li><Link className={link} href={`${base}/hseq`}>{dict.nav.hseq}</Link></li>
                <li><Link className={link} href={`${base}/plataforma`}>{dict.nav.platform}</Link></li>
                <li><Link className={link} href={`${base}/contacto`}>{dict.nav.contact}</Link></li>
              </ul>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-3">
            <p className={col}>{dict.nav.contact}</p>
            <a href={company.mapsUrl} target="_blank" rel="noopener" className="flex gap-3 text-ink-soft hover:text-brand-700">
              <MapPin weight="duotone" className="mt-0.5 size-6 shrink-0 text-brand-700" />
              <span>{company.address}, {company.country[lang]}</span>
            </a>
            <a href={`mailto:${company.email}`} className="flex gap-3 text-ink-soft hover:text-brand-700">
              <EnvelopeSimple weight="duotone" className="mt-0.5 size-6 shrink-0 text-brand-700" />
              <span className="min-w-0">
                <Email address={company.email} />
              </span>
            </a>
            <p className="flex gap-3 text-ink-soft">
              <Clock weight="duotone" className="mt-0.5 size-6 shrink-0 text-brand-700" />
              {company.hours[lang]}
            </p>
            <div className="pt-2">
              <p className={col}>{dict.footer.docs}</p>
              <ul className="mt-3 space-y-2">
                {policyDocs.map((d) => (
                  <li key={d.code}>
                    <a href={d.file} target="_blank" rel="noopener" className="group inline-flex items-center gap-2 text-[0.95rem] text-ink-soft hover:text-brand-700">
                      <FilePdf weight="duotone" className="size-5 text-pt" /> {d.title[lang]}
                      <ArrowUpRight className="size-4 opacity-0 transition group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-7 text-sm text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {company.name} · {dict.footer.rights}</p>
          <p className="font-mono text-xs tracking-wider">ISO 9001:2015 · ISO 45001:2018 · RUC · ASNT-TC-1A</p>
        </div>
      </Container>
    </footer>
  );
}
