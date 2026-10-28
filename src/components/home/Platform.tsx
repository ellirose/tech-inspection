"use client";

import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowUpRight, Barcode, FileText, FolderLock, LockKey, MagnifyingGlass, SealCheck, UserCircle, UsersThree } from "@phosphor-icons/react/ssr";
import type { Dictionary } from "@/i18n/dictionaries";
import { PLATFORM_URL } from "@/content/site";
import { Container, SectionHeading } from "@/components/ui/Section";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const featureIcons = [FileText, Barcode, FolderLock, LockKey];
const methodColor: Record<string, string> = { UT: "#0aa6e6", MT: "#6fd11c", PT: "#e3263f", VT: "#f29a0b" };

export function Platform({ dict, compact = false }: { dict: Dictionary; compact?: boolean }) {
  const p = dict.platform;
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-1, 1], [12, 2]), { stiffness: 80, damping: 16 });
  const ry = useSpring(useTransform(mx, [-1, 1], [-20, -6]), { stiffness: 80, damping: 16 });

  return (
    <section id="plataforma" className="relative overflow-hidden bg-white py-20 sm:py-28">
      <div className="pointer-events-none absolute -left-40 top-20 size-[36rem] rounded-full bg-brand-100/60 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-50 mask-fade-y" />
      <Container className="relative grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {!compact && <SectionHeading eyebrow={p.eyebrow} title={p.title} lead={p.lead} />}
          <RevealGroup className={cn("grid gap-3 sm:grid-cols-2", !compact && "mt-10")}>
            {p.features.map((f, i) => {
              const Icon = featureIcons[i];
              return (
                <RevealItem key={f.t} className={cn("rounded-[1.75rem] p-5 ring-1 ring-line", i % 3 === 0 ? "bg-brand-50/70" : "bg-canvas")}>
                  <span className="grid size-14 place-items-center rounded-2xl bg-white text-brand-700 shadow-soft">
                    <Icon weight="duotone" className="size-8" />
                  </span>
                  <p className="mt-4 font-display text-lg font-bold text-ink">{f.t}</p>
                  <p className="mt-1 text-[0.95rem] leading-snug text-ink-soft">{f.d}</p>
                </RevealItem>
              );
            })}
          </RevealGroup>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={PLATFORM_URL} target="_blank" rel="noopener" className="group inline-flex items-center justify-center gap-3 rounded-full bg-brand-700 px-7 py-4 font-display text-lg font-bold text-white shadow-[0_16px_36px_-14px_rgb(3_10_140/0.75)] transition hover:bg-brand-600">
              <UserCircle weight="duotone" className="size-6" /> {dict.cta.platformClients}
              <ArrowUpRight weight="bold" className="size-5 transition group-hover:rotate-45" />
            </a>
            <a href={PLATFORM_URL} target="_blank" rel="noopener" className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-display text-lg font-bold text-ink ring-2 ring-brand-200 transition hover:ring-brand-700">
              <UsersThree weight="duotone" className="size-6 text-brand-700" /> {dict.cta.platformTeam}
            </a>
          </div>
        </div>

        {/* 3D dashboard mock: illustrative UI, not live data */}
        <div
          className="relative lg:col-span-7 perspective-1600"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
            my.set(((e.clientY - r.top) / r.height) * 2 - 1);
          }}
          onMouseLeave={() => {
            mx.set(0);
            my.set(0);
          }}
          aria-hidden="true"
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry }}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative preserve-3d"
          >
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-float ring-1 ring-line">
              <div className="flex items-center gap-3 border-b border-line bg-canvas px-5 py-3.5">
                <span className="flex gap-1.5">
                  {["#ff6058", "#ffbd2e", "#28c840"].map((c) => (
                    <span key={c} className="size-3 rounded-full" style={{ background: c }} />
                  ))}
                </span>
                <span className="mx-auto flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-mono text-xs text-mute ring-1 ring-line">
                  <LockKey weight="fill" className="size-3.5 text-mt" /> plataforma.tech-inspection.com
                </span>
              </div>
              <div className="grid grid-cols-[4.5rem_1fr]">
                <div className="flex flex-col items-center gap-3 border-r border-line bg-canvas py-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-brand-700 font-display text-sm font-extrabold text-white">TI</span>
                  {[FileText, Barcode, SealCheck, FolderLock].map((I, i) => (
                    <span key={i} className={cn("grid size-11 place-items-center rounded-xl", i === 0 ? "bg-brand-50 text-brand-700" : "text-mute")}>
                      <I weight="duotone" className="size-6" />
                    </span>
                  ))}
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-display text-xl font-bold text-ink">{p.mock.title}</p>
                    <span className="hidden items-center gap-2 rounded-full bg-canvas px-4 py-2 text-sm text-mute ring-1 ring-line sm:flex">
                      <MagnifyingGlass className="size-4" /> {p.mock.search}
                    </span>
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_11rem]">
                    <div className="overflow-hidden rounded-2xl ring-1 ring-line">
                      <div className="grid grid-cols-[1fr_4rem_6rem] bg-canvas px-4 py-2.5 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-mute">
                        {p.mock.cols.map((c) => <span key={c}>{c}</span>)}
                      </div>
                      {p.mock.rows.map(([comp, meth, status], i) => (
                        <motion.div
                          key={comp}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.12 }}
                          className="grid grid-cols-[1fr_4rem_6rem] items-center border-t border-line px-4 py-3 text-sm"
                        >
                          <span className="truncate font-semibold text-ink">{comp}</span>
                          <span className="font-mono text-xs font-bold" style={{ color: methodColor[meth] }}>{meth}</span>
                          <span className={cn("w-fit rounded-full px-2.5 py-1 text-xs font-bold", i === 2 ? "bg-vt-soft text-[#b46f00]" : "bg-mt-soft text-[#3f8a07]")}>{status}</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="hidden flex-col items-center justify-center rounded-2xl bg-canvas p-4 ring-1 ring-line sm:flex">
                      <svg viewBox="0 0 120 120" className="size-28 -rotate-90">
                        {[
                          ["#0aa6e6", 0, 95],
                          ["#6fd11c", 100, 85],
                          ["#e3263f", 190, 60],
                          ["#f29a0b", 255, 45],
                        ].map(([c, off, len]) => (
                          <motion.circle
                            key={c as string}
                            cx="60"
                            cy="60"
                            r="46"
                            fill="none"
                            stroke={c as string}
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={`${len} 289`}
                            initial={{ strokeDashoffset: 289 }}
                            whileInView={{ strokeDashoffset: -(off as number) }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                          />
                        ))}
                      </svg>
                      <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-mute">UT · MT · PT · VT</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "report issued" toast, lifted off the screen plane */}
            <motion.div
              style={{ translateZ: 80 }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.1, type: "spring", stiffness: 200, damping: 18 }}
              className="glass absolute -bottom-8 -left-6 flex items-center gap-3 rounded-[1.4rem] p-3.5 pr-5 shadow-float sm:-left-10"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-mt text-brand-900">
                <SealCheck weight="fill" className="size-7" />
              </span>
              <span>
                <span className="block font-display font-bold text-ink">{p.mock.report}</span>
                <span className="font-mono text-xs text-mute">DP-0418 · PDF</span>
              </span>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
