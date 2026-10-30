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
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

export type NavData = {
  lang: Locale;
  nav: Dictionary["nav"];
  methods: { key: MethodKey; slug: string; code: string; name: string; tagline: string }[];
  services: { slug: string; icon: ServiceIcon; name: string; short: string }[];
};

const methodTile: Record<MethodKey, string> = {
  vt: "bg-vt/12 text-[#c47a00] dark:text-vt",
  mt: "bg-mt/15 text-[#4e9d12] dark:text-mt",
  pt: "bg-pt/12 text-pt",
  ut: "bg-ut/12 text-[#0784b8] dark:text-ut",
};

export function Header({ data, theme }: { data: NavData; theme: { light: string; dark: string } }) {
  const { lang, nav } = data;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<null | "methods" | "services">(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
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
    <header className={cn("fixed inset-x-0 top-0 pt-3 transition-[padding] duration-300 sm:pt-4", drawer ? "z-[70]" : "z-50", scrolled && "sm:pt-3")} onMouseLeave={() => setOpen(null)}>
      <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-6 lg:px-10">
        <div
          className={cn(
            "glass flex items-center gap-4 rounded-[1.75rem] px-4 ring-1 ring-line/80 transition-all duration-300 sm:px-5",
            scrolled || open ? "h-[4.75rem] shadow-card" : "h-[5.5rem] shadow-soft",
          )}
        >
          <Link href={base} className="shrink-0" aria-label="Tech-Inspection">
            <Logo preload className={cn("transition-all duration-300", scrolled ? "h-12" : "h-14")} />
          </Link>

          <nav className="mx-auto hidden min-w-0 items-center xl:flex" aria-label="Principal">
            {links.map((l) => {
              const active = isActive(l.href, l.exact);
              return (
                <div key={l.href} className="relative shrink-0" onMouseEnter={() => setOpen(l.menu ?? null)}>
                  <Link
                    href={l.href}
                    aria-expanded={l.menu ? open === l.menu : undefined}
                    onFocus={() => setOpen(l.menu ?? null)}
                    className={cn(
                      "relative flex h-12 items-center gap-1 whitespace-nowrap rounded-full px-3 text-[1.02rem] font-bold tracking-[-0.01em] transition-colors 2xl:px-4 2xl:text-[1.08rem]",
                      active ? "text-accent" : "text-ink hover:text-accent",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="nav-active" className="absolute inset-0 -z-10 rounded-full bg-tint ring-1 ring-neon/25" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
                    )}
                    {l.label}
                    {l.menu && <CaretDown weight="bold" className={cn("size-3.5 transition-transform duration-300", open === l.menu && "rotate-180")} />}
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0">
            <ThemeToggle labels={theme} className="hidden sm:grid" />
            <LangMenu lang={lang} label={nav.language} className="hidden sm:block" />
            <Link
              href={`${base}/contacto#cotizar`}
              className="group hidden h-12 items-center gap-3 whitespace-nowrap rounded-full bg-brand-600 pl-5 pr-1.5 text-[1.02rem] font-bold text-white shadow-[0_12px_26px_-12px_rgb(31_55_214/0.8)] transition hover:bg-brand-500 md:flex dark:bg-neon dark:text-[#071a2e]"
            >
              {nav.quote}
              <span className="grid size-9 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5 group-hover:bg-lime group-hover:text-[#071a2e] dark:bg-[#071a2e]/10">
                <ArrowRight weight="bold" className="size-4" />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid size-12 place-items-center rounded-2xl bg-surface text-ink shadow-soft ring-1 ring-line xl:hidden"
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
              initial={{ opacity: 0, y: -8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="glass mt-2 hidden rounded-[1.75rem] p-6 shadow-float ring-1 ring-line/80 xl:block"
            >
              {open === "methods" ? (
                <div className="grid grid-cols-4 gap-3">
                  {data.methods.map((m) => (
                    <Link key={m.slug} href={`${base}/metodos/${m.slug}`} className="group rounded-3xl bg-surface p-5 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-card">
                      <div className="flex items-center justify-between">
                        <span className={cn("grid size-16 place-items-center rounded-2xl", methodTile[m.key])}>
                          <MethodGlyph name={m.key} className="size-9" />
                        </span>
                        <span className="font-mono text-sm font-medium text-mute">{m.code}</span>
                      </div>
                      <p className="mt-5 text-xl font-extrabold tracking-tight text-ink">{m.name}</p>
                      <p className="mt-1.5 line-clamp-2 text-[0.95rem] leading-snug text-ink-soft">{m.tagline}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {data.services.map((s) => (
                    <Link key={s.slug} href={`${base}/servicios/${s.slug}`} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-surface hover:shadow-soft">
                      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-tint text-accent ring-1 ring-neon/20 transition group-hover:bg-brand-600 group-hover:text-white dark:group-hover:bg-neon dark:group-hover:text-[#071a2e]">
                        <ServiceGlyph name={s.icon} className="size-8" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[1.05rem] font-bold leading-tight text-ink">{s.name}</span>
                        <span className="line-clamp-1 text-sm text-mute">{s.short}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              <Link href={`${base}/${open === "methods" ? "metodos" : "servicios"}`} className="mt-5 inline-flex items-center gap-2 text-base font-bold text-accent transition-all hover:gap-3">
                {open === "methods" ? nav.allMethods : nav.allServices}
                <ArrowRight weight="bold" className="size-4" />
              </Link>
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
              className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-canvas"
            >
              <div className="pointer-events-none absolute inset-0 bg-blueprint mask-fade-b" />
              <div className="relative flex h-24 items-center justify-between px-6">
                <Logo className="h-11" />
                <button type="button" onClick={() => setDrawer(false)} className="grid size-12 place-items-center rounded-2xl bg-surface shadow-soft ring-1 ring-line" aria-label={nav.close}>
                  <X weight="bold" className="size-6" />
                </button>
              </div>
              <nav className="relative flex flex-col gap-1 px-4" aria-label="Principal">
                {links.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                    <Link
                      href={l.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-4 text-[1.7rem] font-extrabold tracking-tight",
                        isActive(l.href, l.exact) ? "bg-surface text-accent shadow-soft" : "text-ink",
                      )}
                    >
                      {l.label}
                      <ArrowRight weight="bold" className="size-5 text-neon" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="relative mt-auto space-y-4 p-6">
                <div className="flex items-center gap-2">
                  <LangMenu lang={lang} label={nav.language} placement="up" />
                  <ThemeToggle labels={theme} />
                </div>
                <Link href={`${base}/contacto#cotizar`} className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand-600 text-lg font-bold text-white dark:bg-neon dark:text-[#071a2e]">
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
