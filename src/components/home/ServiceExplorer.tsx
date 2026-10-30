"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check } from "@phosphor-icons/react/ssr";
import type { ServiceIcon } from "@/content/services";
import { ServiceGlyph } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export type ExplorerItem = { slug: string; href: string; icon: ServiceIcon; name: string; short: string; image: string; scope: string[]; methods: string[] };

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * Hover or focus a service on the left and the stage on the right swaps to its photo, scope and
 * methods. Phones get a swipeable row of cards instead.
 */
export function ServiceExplorer({ items, featured, cta }: { items: ExplorerItem[]; featured: string; cta: string }) {
  const [active, setActive] = useState(0);
  const s = items[active];

  return (
    <>
      {/* Desktop */}
      <div className="hidden gap-10 lg:grid lg:grid-cols-12">
        <ol className="lg:col-span-5">
          {items.map((it, i) => {
            const on = i === active;
            return (
              <li key={it.slug}>
                <Link
                  href={it.href}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={cn("group relative flex items-center gap-5 rounded-[1.75rem] px-5 py-3.5 transition-colors duration-300", on ? "text-ink" : "text-ink-soft hover:text-ink")}
                >
                  {on && <motion.span layoutId="svc-active" transition={{ type: "spring", stiffness: 360, damping: 34 }} className="absolute inset-0 -z-10 rounded-[1.75rem] bg-surface shadow-card ring-1 ring-line" />}
                  <span className="w-7 font-mono text-sm font-medium text-mute">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl transition duration-300", on ? "bg-brand-600 text-white shadow-[0_12px_26px_-10px_rgb(10_100_191/0.7)] dark:bg-neon dark:text-[#071a2e]" : "bg-mist text-accent")}>
                    <ServiceGlyph name={it.icon} className="size-8" />
                  </span>
                  <span className="min-w-0 flex-1 text-[1.4rem] font-extrabold leading-tight tracking-tight">{it.name}</span>
                  {i === 0 && <span className="rounded-full bg-lime px-3 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-widest text-[#071a2e]">{featured}</span>}
                  <ArrowUpRight weight="bold" className={cn("size-5 shrink-0 transition duration-300", on ? "rotate-45 text-accent opacity-100" : "opacity-0")} />
                </Link>
              </li>
            );
          })}
        </ol>

        <div className="lg:col-span-7">
          <div className="sticky top-32">
            <div className="relative aspect-[5/6] max-h-[44rem] w-full overflow-hidden rounded-[3rem] rounded-tl-[9rem] bg-brand-900 shadow-float xl:aspect-[1/1.05]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={s.slug} className="absolute inset-0" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease }}>
                  <Image src={s.image} alt={s.name} fill sizes="(min-width:1024px) 52vw, 100vw" className="animate-kenburns object-cover motion-reduce:animate-none" quality={80} />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/10 to-transparent" />
              <span className="text-stroke absolute right-8 top-6 text-[7rem] font-extrabold leading-none tracking-tighter text-white/70">{String(active + 1).padStart(2, "0")}</span>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={s.slug} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease }} className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                  <div className="glass rounded-[2rem] p-6 shadow-float ring-1 ring-white/40 sm:p-7">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p className="text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink">{s.name}</p>
                        <p className="mt-1.5 text-[1.05rem] leading-relaxed text-ink-soft">{s.short}</p>
                      </div>
                      <Link href={s.href} aria-label={`${cta}: ${s.name}`} className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:rotate-45 dark:bg-neon dark:text-[#071a2e]">
                        <ArrowUpRight weight="bold" className="size-6" />
                      </Link>
                    </div>
                    <ul className="mt-5 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                      {s.scope.slice(0, 4).map((x) => (
                        <li key={x} className="flex items-start gap-2 text-[0.98rem] font-semibold text-ink">
                          <Check weight="bold" className="mt-1 size-4 shrink-0 text-lime-deep dark:text-lime" />
                          {x}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {s.methods.map((m) => (
                        <span key={m} className="rounded-full bg-tint px-3 py-1 font-mono text-xs font-bold tracking-widest text-accent ring-1 ring-neon/25">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Phones and tablets */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden">
        {items.map((it, i) => (
          <Link key={it.slug} href={it.href} className="group w-[82%] shrink-0 snap-start overflow-hidden rounded-[2rem] bg-surface shadow-card ring-1 ring-line sm:w-[46%]">
            <div className={cn("relative aspect-[4/3]", i % 2 ? "rounded-b-[3rem]" : "")}>
              <Image src={it.image} alt="" fill sizes="(min-width:640px) 46vw, 82vw" className="object-cover" />
              <span className="absolute left-4 top-4 grid size-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft">
                <ServiceGlyph name={it.icon} className="size-8" />
              </span>
              {i === 0 && <span className="absolute right-4 top-4 rounded-full bg-lime px-3 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-widest text-[#071a2e]">{featured}</span>}
            </div>
            <div className="p-5">
              <p className="text-xl font-extrabold leading-tight tracking-tight text-ink">{it.name}</p>
              <p className="mt-1.5 text-ink-soft">{it.short}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {it.methods.map((m) => (
                  <span key={m} className="rounded-full bg-tint px-2.5 py-0.5 font-mono text-[0.7rem] font-bold tracking-widest text-accent">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
