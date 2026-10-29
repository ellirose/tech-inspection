import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { Container, Eyebrow } from "./Section";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/cn";

type Crumb = { label: string; href?: string };

/** Inner-page hero: breadcrumb, oversized title and a shaped photo. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  image,
  imageClass = "rounded-[3rem] rounded-tr-[8rem]",
  imagePosition = "50% 50%",
  accent,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  lead?: string;
  image?: string;
  imageClass?: string;
  /** object-position for the photo, so faces stay in frame. */
  imagePosition?: string;
  accent?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-blueprint mask-radial" />
      <div className="pointer-events-none absolute -right-48 -top-48 size-[40rem] rounded-full blur-3xl" style={{ background: accent ? `${accent}26` : "rgb(194 200 255 / 0.45)" }} />
      <Container className="relative grid items-center gap-12 lg:grid-cols-12">
        <div className={cn(image ? "lg:col-span-7" : "lg:col-span-10")}>
          <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-[0.95rem] font-semibold text-mute">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link href={c.href} className="hover:text-brand-700">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current="page">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <CaretRight weight="bold" className="size-3.5" />}
              </span>
            ))}
          </nav>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-5 text-balance font-display text-[clamp(2.6rem,6vw,5.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-ink">{title}</h1>
            {lead && <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{lead}</p>}
            {children}
          </Reveal>
        </div>
        {image && (
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className={cn("relative aspect-[4/3.4] overflow-hidden shadow-float", imageClass)}>
              <Image src={image} alt="" fill preload sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" style={{ objectPosition: imagePosition }} quality={80} />
            </div>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
