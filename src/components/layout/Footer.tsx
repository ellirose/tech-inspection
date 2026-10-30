import Link from "next/link";
import { ArrowUpRight, EnvelopeSimple, FilePdf, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { company, policyDocs, whatsappLink } from "@/content/site";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { cover } from "@/content/deck";
import { Logo } from "@/components/ui/Logo";
import { Container, Swoosh } from "@/components/ui/Section";
import { Email } from "@/components/ui/Email";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const base = `/${lang}`;
  const col = "text-sm font-extrabold uppercase tracking-[0.12em] text-ink";
  const link = "text-[1.02rem] font-semibold text-ink-soft transition hover:text-accent";

  return (
    <footer className="relative isolate overflow-hidden pt-10">
      <Container>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-surface shadow-card ring-1 ring-line sm:rounded-[3.5rem]">
          <div className="pointer-events-none absolute inset-0 -z-0 bg-blueprint mask-fade-b" />
          <Swoosh className="absolute -right-20 -top-6 w-[36rem] text-neon" />
          <div className="relative grid gap-12 p-8 sm:p-12 lg:grid-cols-12 lg:p-14">
            <div className="lg:col-span-4">
              <Logo className="h-14" />
              <p className="mt-6 max-w-sm text-lg font-semibold leading-relaxed text-ink-soft">{cover.lead[lang]}</p>
              <p className="mt-3 max-w-sm font-bold text-accent-ink">{cover.motto[lang]}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                <a href={whatsappLink(dict.quote.waIntro)} target="_blank" rel="noopener" className="inline-flex h-12 items-center gap-2 rounded-full bg-whatsapp px-5 font-bold text-white">
                  <WhatsappLogo weight="fill" className="size-6" /> WhatsApp
                </a>
                <a href={company.phoneHref} className="inline-flex h-12 items-center gap-2 rounded-full bg-tint px-5 font-bold text-ink ring-1 ring-neon/25">
                  <Phone weight="duotone" className="size-6 text-accent" /> {company.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
              <div>
                <p className={col}>{dict.nav.services}</p>
                <ul className="mt-5 space-y-2.5">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link className={link} href={`${base}/servicios/${s.slug}`}>
                        {s.name[lang]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={col}>{dict.nav.methods}</p>
                <ul className="mt-5 space-y-2.5">
                  {methods.map((m) => (
                    <li key={m.slug}>
                      <Link className={link} href={`${base}/metodos/${m.slug}`}>
                        {m.name[lang]}
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={`${col} mt-9`}>{dict.footer.company}</p>
                <ul className="mt-5 space-y-2.5">
                  <li><Link className={link} href={`${base}/nosotros`}>{dict.nav.about}</Link></li>
                  <li><Link className={link} href={`${base}/hseq`}>{dict.nav.hseq}</Link></li>
                  <li><Link className={link} href={`${base}/plataforma`}>{dict.nav.platform}</Link></li>
                  <li><Link className={link} href={`${base}/contacto`}>{dict.nav.contact}</Link></li>
                </ul>
              </div>
              <div className="col-span-2 space-y-5 sm:col-span-1">
                <p className={col}>{dict.nav.contact}</p>
                <a href={`mailto:${company.email}`} className="flex gap-3 text-ink-soft hover:text-accent">
                  <EnvelopeSimple weight="duotone" className="mt-0.5 size-6 shrink-0 text-accent" />
                  <span className="min-w-0 font-semibold">
                    <Email address={company.email} />
                  </span>
                </a>
                <a href={company.mapsUrl} target="_blank" rel="noopener" className="flex gap-3 font-semibold text-ink-soft hover:text-accent">
                  <MapPin weight="duotone" className="mt-0.5 size-6 shrink-0 text-accent" />
                  <span>
                    {company.address}, {company.country[lang]}
                  </span>
                </a>
                <p className="text-sm font-semibold text-mute">{company.hours[lang]}</p>
                <div className="pt-2">
                  <p className={col}>{dict.footer.docs}</p>
                  <ul className="mt-4 space-y-2">
                    {policyDocs.map((d) => (
                      <li key={d.code}>
                        <a href={d.file} target="_blank" rel="noopener" className="group inline-flex items-start gap-2 font-semibold text-ink-soft hover:text-accent">
                          <FilePdf weight="duotone" className="mt-0.5 size-5 shrink-0 text-pt" /> {d.title[lang]}
                          <ArrowUpRight className="mt-1 size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 py-8 text-sm font-semibold text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {company.name} · {dict.footer.rights}
          </p>
          <p className="font-mono text-xs tracking-wider">ISO 9001:2015 · ISO 45001:2018 · RUC · ASNT · DS-1</p>
        </div>
      </Container>
    </footer>
  );
}
