"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CaretDown, List, X } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { MethodKey } from "@/content/methods";
import type { ServiceIcon } from "@/content/services";
import { Logo } from "@/components/ui/Logo";
import { MethodGlyph, ServiceGlyph } from "@/components/ui/Icons";
import { LangMenu } from "./LangMenu";
import { cn } from "@/lib/cn";

export type NavData = {
  lang: Locale;
  nav: Dictionary["nav"];
  methods: { key: MethodKey; slug: string; code: string; name: string; tagline: string }[];
  services: { slug: string; icon: ServiceIcon; name: string; short: string }[];
};

const methodChip: Record<MethodKey, string> = {
  mt: "bg-mt-soft text-[#3f8a07]",
  pt: "bg-pt-soft text-pt",
  ut: "bg-ut-soft text-[#0784b8]",
  vt: "bg-vt-soft text-[#b46f00]",
};

export function Header({ data }: { data: NavData }) {
  const { lang, nav } = data;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<null | "methods" | "services">(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when the route changes (derived during render, no effect needed).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
    setDrawer(false);
  }

  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
  }, [drawer]);

  const base = `/${lang}`;
  const links = [
    { href: base, label: nav.home, exact: true },
    { href: `${base}/nosotros`, label: nav.about },
    { href: `${base}/metodos`, label: nav.methods, menu: "methods" as const },
    { href: `${base}/servicios`, label: nav.services, menu: "services" as const },
    { href: `${base}/hseq`, label: nav.hseq },
    { href: `${base}/plataforma`, label: nav.platform },
    { href: `${base}/contacto`, label: nav.contact },
  ];
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));

  return (
    <header className={cn("fixed inset-x-0 top-0", drawer ? "z-[70]" : "z-50")} onMouseLeave={() => setOpen(null)}>
      <div
        className={cn(
          "transition-all duration-500 ease-out",
          open
            ? "border-b border-line bg-white/97 shadow-[0_24px_60px_-24px_rgb(14_20_51/0.35)] backdrop-blur-xl"
            : scrolled
              ? "border-b border-line/70 bg-white/92 shadow-[0_10px_40px_-18px_rgb(14_20_51/0.25)] backdrop-blur-xl"
              : "border-b border-transparent bg-transparent",
        )}
      >
        <div className={cn("mx-auto flex max-w-[90rem] items-center gap-4 px-5 transition-[height] duration-500 sm:px-8 2xl:gap-8 2xl:px-12", scrolled ? "h-20" : "h-24")}>
          <Link href={base} className="shrink-0" aria-label="Tech-Inspection">
            <Logo preload className={cn("transition-all duration-500", scrolled ? "h-11" : "h-[3.25rem]")} />
          </Link>

          <nav className="mx-auto hidden min-w-0 items-center xl:flex 2xl:gap-0.5" aria-label="Principal">
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <div key={l.href} className="relative shrink-0" onMouseEnter={() => setOpen(l.menu ?? null)}>
                  <Link
                    href={l.href}
                    aria-expanded={l.menu ? open === l.menu : undefined}
                    onFocus={() => setOpen(l.menu ?? null)}
                    className={cn(
                      "relative flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-3 font-display text-base font-bold tracking-[-0.01em] transition-colors 2xl:px-4 2xl:text-[1.08rem]",
                      active ? "text-brand-700" : "text-ink hover:text-brand-700",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-brand-50 ring-1 ring-brand-100" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    {l.label}
                    {l.menu && <CaretDown weight="bold" className={cn("size-4 transition-transform duration-300", open === l.menu && "rotate-180")} />}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3 xl:ml-0">
            <LangMenu lang={lang} label={nav.language} className="hidden sm:block" />
            {/* Fixed width so the CTA keeps its size in every language. */}
            <Link
              href={`${base}/contacto#cotizar`}
              className="group hidden h-12 w-[11.5rem] items-center justify-between gap-2 whitespace-nowrap rounded-full bg-brand-700 pl-6 pr-1.5 font-display text-[1.05rem] font-bold text-white shadow-[0_10px_30px_-10px_rgb(3_10_140/0.7)] transition hover:bg-brand-600 md:flex"
            >
              {nav.quote}
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5 group-hover:bg-mt group-hover:text-brand-900">
                <ArrowRight weight="bold" className="size-4" />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid size-12 place-items-center rounded-2xl bg-white text-ink shadow-soft ring-1 ring-line xl:hidden"
              aria-label={nav.menu}
            >
              <List weight="bold" className="size-6" />
            </button>
          </div>
        </div>

        {/* Mega menus */}
        <AnimatePresence>
          {open && (
            <motion.div
              key={open}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="hidden border-t border-line/70 xl:block"
            >
              <div className="mx-auto max-w-[90rem] px-12 py-8">
                {open === "methods" ? (
                  <div className="grid grid-cols-4 gap-4">
                    {data.methods.map((m) => (
                      <Link key={m.slug} href={`${base}/metodos/${m.slug}`} className="group rounded-3xl bg-white/80 p-5 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-lift">
                        <div className="flex items-center gap-3">
                          <span className={cn("grid size-14 place-items-center rounded-2xl", methodChip[m.key])}>
                            <MethodGlyph name={m.key} className="size-8" />
                          </span>
                          <span className="font-mono text-sm font-bold text-mute">{m.code}</span>
                        </div>
                        <p className="mt-4 font-display text-xl font-bold text-ink">{m.name}</p>
                        <p className="mt-1.5 line-clamp-2 text-[0.95rem] leading-snug text-ink-soft">{m.tagline}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {data.services.map((s) => (
                      <Link key={s.slug} href={`${base}/servicios/${s.slug}`} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-white">
                        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100 transition group-hover:bg-brand-700 group-hover:text-white">
                          <ServiceGlyph name={s.icon} className="size-8" />
                        </span>
                        <span>
                          <span className="block font-display text-lg font-bold leading-tight text-ink">{s.name}</span>
                          <span className="line-clamp-1 text-sm text-mute">{s.short}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <Link href={`${base}/${open === "methods" ? "metodos" : "servicios"}`} className="mt-6 inline-flex items-center gap-2 font-display text-base font-bold text-brand-700 hover:gap-3 transition-all">
                  {open === "methods" ? nav.allMethods : nav.allServices}
                  <ArrowRight weight="bold" className="size-4" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div className="fixed inset-0 z-50 xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-brand-900/25 backdrop-blur-sm" onClick={() => setDrawer(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-canvas bg-blueprint"
            >
              <div className="flex h-24 items-center justify-between px-6">
                <Logo className="h-12" />
                <button type="button" onClick={() => setDrawer(false)} className="grid size-12 place-items-center rounded-2xl bg-white shadow-soft ring-1 ring-line" aria-label={nav.close}>
                  <X weight="bold" className="size-6" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-4" aria-label="Principal">
                {links.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link
                      href={l.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-4 font-display text-[1.7rem] font-bold tracking-tight",
                        isActive(l.href, l.exact) ? "bg-white text-brand-700 shadow-soft" : "text-ink",
                      )}
                    >
                      {l.label}
                      <ArrowRight weight="bold" className="size-5 text-brand-400" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-4 p-6">
                <LangMenu lang={lang} label={nav.language} placement="up" className="w-fit" />
                <Link href={`${base}/contacto#cotizar`} className="flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-4 font-display text-lg font-bold text-white">
                  {nav.quote}
                  <ArrowRight weight="bold" className="size-5" />
                </Link>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
