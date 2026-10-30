import Image from "next/image";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { Container, Eyebrow } from "./Section";
import { Reveal } from "./Reveal";
import { BackgroundVideo } from "@/components/media/BackgroundVideo";

type Crumb = { label: string; href?: string };

/** Inner-page hero: breadcrumb, large title and a shaped photo with an offset neon outline. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  image,
  imagePosition = "50% 50%",
  caption,
  video,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: string;
  lead?: string;
  image?: string;
  /** object-position for the photo, so faces stay in frame. */
  imagePosition?: string;
  /** Short caption on a glass chip under the photo. */
  caption?: string;
  /** Loop shown in the frame instead of the photo; `image` becomes its poster. */
  video?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-blueprint mask-fade-b" />
      <div className="pointer-events-none absolute -right-24 top-0 -z-10 h-[34rem] w-[42rem] bg-network opacity-60 mask-radial" />
      <div className="pointer-events-none absolute -right-40 -top-40 -z-10 size-[36rem] rounded-full bg-neon/15 blur-[110px]" />
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className={image ? "lg:col-span-7" : "lg:col-span-10"}>
          <nav aria-label="breadcrumb" className="mb-7 flex flex-wrap items-center gap-1.5 text-[0.95rem] font-bold text-mute">
            {crumbs.map((c, i) => (
              <span key={c.label} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link href={c.href} className="transition-colors hover:text-accent">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current="page">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <CaretRight weight="bold" className="size-3.5 text-neon" />}
              </span>
            ))}
          </nav>
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-6 text-balance text-[clamp(2.6rem,5.6vw,5.2rem)] font-extrabold leading-[1] tracking-[-0.045em] text-ink">{title}</h1>
            {lead && <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-ink-soft sm:text-xl">{lead}</p>}
            {children}
          </Reveal>
        </div>
        {image && (
          <Reveal delay={0.12} className="lg:col-span-5">
            <figure className="relative">
              <span aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.5rem] rounded-tr-[6rem] border-2 border-dashed border-neon/60" />
              <div className="relative aspect-[4/3.3] overflow-hidden rounded-[2.5rem] rounded-tr-[6rem] bg-surface-2 shadow-float">
                {video ? (
                  <BackgroundVideo src={video} poster={image} className="absolute inset-0 size-full" />
                ) : (
                  <Image src={image} alt="" fill preload sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" style={{ objectPosition: imagePosition }} quality={80} />
                )}
              </div>
              {caption && (
                <figcaption className="glass absolute -bottom-5 left-6 rounded-full px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-ink shadow-card ring-1 ring-line/70">
                  {caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
