import Image from "next/image";
import {
  ArrowRight,
  Barcode,
  Camera,
  Certificate,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  DeviceTablet,
  Eye,
  FileText,
  HardHat,
  Hourglass,
  LockKey,
  Package,
  Pulse,
  SprayBottle,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import { process } from "@/content/deck";
import { Container, Swoosh } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const procIcons = [Package, Barcode, SprayBottle, Eye, Pulse, ClipboardText, Camera, FileText, CheckCircle];
const traceIcons = [HardHat, DeviceTablet, Certificate, Hourglass, ChartLineUp, FileText, UsersThree];

/** Slide 7: the general procedure and the calibration/traceability chain, on a cobalt panel. */
export function Process({ lang, index = "05" }: { lang: Locale; index?: string }) {
  const steps = process.procedure[lang];
  const chain = process.trace[lang];
  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-brand-600 px-6 py-14 text-white shadow-float sm:rounded-[3.5rem] sm:px-12 sm:py-20 lg:px-16 dark:bg-brand-800">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-network opacity-60 mask-radial" />
          <Swoosh className="absolute -right-24 -top-10 -z-10 w-[44rem] text-neon" />

          <Reveal className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="glass inline-flex items-center gap-2.5 rounded-full py-1.5 pl-2.5 pr-4 font-mono text-[0.8rem] font-medium uppercase tracking-[0.14em] text-ink ring-1 ring-white/40">
                <span className="size-2.5 rounded-full bg-lime" />
                <span className="text-accent-ink">{index}</span> / {{ es: "Proceso", pt: "Processo", en: "Process" }[lang]}
              </span>
              <h2 className="mt-6 text-balance text-[clamp(2.3rem,4.4vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">{process.title[lang]}</h2>
            </div>
            <p className="text-lg leading-relaxed text-white/80 sm:text-xl lg:col-span-5">{process.lead[lang]}</p>
          </Reveal>

          <div className="mt-14 grid gap-10 lg:grid-cols-12">
            {/* General procedure: a vertical rail of nine steps */}
            <div className="lg:col-span-5">
              <p className="text-lg font-extrabold">{process.procedureTitle[lang]}</p>
              <RevealGroup stagger={0.05} className="relative mt-5">
                <span aria-hidden className="absolute bottom-7 left-7 top-7 w-0.5 bg-[repeating-linear-gradient(to_bottom,rgb(255_255_255/0.45)_0_5px,transparent_5px_10px)]" />
                {steps.map((s, i) => {
                  const Icon = procIcons[i];
                  const last = i === steps.length - 1;
                  return (
                    <RevealItem key={s} className="relative flex items-center gap-4 py-1.5">
                      <span className={cn("grid size-14 shrink-0 place-items-center rounded-2xl ring-4 ring-brand-600 dark:ring-brand-800", last ? "bg-lime text-[#0b1533]" : "bg-white text-brand-600")}>
                        <Icon weight={last ? "fill" : "duotone"} className="size-7" />
                      </span>
                      <span className="font-mono text-sm text-white/60">{String(i + 1).padStart(2, "0")}</span>
                      <span className={cn("text-lg tracking-tight", last ? "font-extrabold text-lime" : "font-bold")}>{s}</span>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>

            {/* Traceability: photo plus the chain from inspector to client */}
            <div className="lg:col-span-7">
              <Reveal className="relative">
                <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] ring-1 ring-white/25">
                  <Image src="/media/deck/pt-inspector.jpg" alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[50%_30%]" />
                </div>
                <div className="glass absolute -bottom-6 left-6 right-6 flex items-center gap-4 rounded-3xl p-4 text-ink shadow-float ring-1 ring-white/50 sm:left-auto sm:max-w-md">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-lime text-[#0b1533]">
                    <LockKey weight="duotone" className="size-8" />
                  </span>
                  <p className="leading-snug">
                    <span className="block font-extrabold">{process.lockTitle[lang]}</span>
                    <span className="text-sm text-ink-soft">{process.lockText[lang]}</span>
                  </p>
                </div>
              </Reveal>
              <p className="mt-14 text-lg font-extrabold">{process.traceTitle[lang]}</p>
              <RevealGroup stagger={0.05} className="mt-5 flex flex-wrap items-center gap-2">
                {chain.map((c, i) => {
                  const Icon = traceIcons[i];
                  return (
                    <RevealItem key={c} className="flex items-center gap-2">
                      <span className="flex items-center gap-2.5 rounded-full bg-white/12 py-1.5 pl-1.5 pr-4 font-bold ring-1 ring-white/25 backdrop-blur">
                        <span className="grid size-10 place-items-center rounded-full bg-white text-brand-600">
                          <Icon weight="duotone" className="size-6" />
                        </span>
                        {c}
                      </span>
                      {i < chain.length - 1 && <ArrowRight weight="bold" className="size-4 text-neon" />}
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
