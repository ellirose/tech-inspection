import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { home } from "@/content/home";
import { services } from "@/content/services";
import { methodByKey } from "@/content/methods";
import { Container, SectionHeading } from "@/components/ui/Section";
import { cn } from "@/lib/cn";
import { ServiceExplorer } from "./ServiceExplorer";

/** The nine service lines as an interactive explorer. */
export function ServicesGrid({ lang, dict, heading = true, className }: { lang: Locale; dict: Dictionary; heading?: boolean; className?: string }) {
  const t = home.services;
  return (
    <section id="servicios" className={cn("relative isolate overflow-hidden bg-surface py-24 sm:py-32", className)}>
      <div className="pointer-events-none absolute -right-20 top-0 -z-10 h-[34rem] w-[60rem] bg-hatch mask-radial" />
      <Container>
        {heading && <SectionHeading eyebrow={t.eyebrow[lang]} title={t.title[lang]} lead={t.lead[lang]} />}
        <div className={cn(heading && "mt-14")}>
          <ServiceExplorer
            featured={t.featured[lang]}
            cta={dict.cta.details}
            items={services.map((s) => ({
              slug: s.slug,
              href: `/${lang}/servicios/${s.slug}`,
              icon: s.icon,
              name: s.name[lang],
              short: s.short[lang],
              image: s.image,
              scope: s.scope[lang],
              methods: s.methods.map((k) => methodByKey(k).code),
            }))}
          />
        </div>
      </Container>
    </section>
  );
}
