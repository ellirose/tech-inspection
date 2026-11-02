"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle, WhatsappLogo } from "@phosphor-icons/react/ssr";
import type { Locale } from "@/i18n/config";
import { readThanks } from "@/lib/leads/client";
import { whatsappLink } from "@/lib/site";

type Copy = Record<"successTitle" | "successText" | "continueWa" | "newRequest" | "reference" | "emailSent" | "backHome" | "waIntro", string>;

const subscribe = () => () => {};

/** Success screen after a quote request: reference, WhatsApp hand-off with the summary, next steps. */
export function ThanksPanel({ lang, t, whatsapp }: { lang: Locale; t: Copy; whatsapp: string }) {
  // The request summary is handed over in sessionStorage, so it appears after hydration.
  const thanks = useSyncExternalStore(subscribe, readThanks, () => null);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center rounded-[2.5rem] bg-surface p-10 text-center shadow-card ring-1 ring-line sm:p-14">
      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }} className="grid size-20 place-items-center rounded-full bg-lime/20 text-lime-deep dark:text-lime">
        <CheckCircle weight="light" className="size-12" />
      </motion.span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{t.successTitle}</h1>
      {thanks && (
        <p className="mt-5 font-mono text-sm font-bold uppercase tracking-[0.16em] text-mute">
          {t.reference} <span className="ml-2 rounded-full bg-tint px-3 py-1 text-base tracking-[0.08em] text-accent-ink">{thanks.reference}</span>
        </p>
      )}
      <p className="mt-4 max-w-md text-lg text-ink-soft">{t.successText}</p>
      {thanks?.emailed && <p className="mt-2 max-w-md text-ink-soft">{t.emailSent}</p>}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a href={whatsappLink(whatsapp, thanks?.whatsappText ?? t.waIntro)} target="_blank" rel="noopener" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-white">
          <WhatsappLogo weight="fill" className="size-6" /> {t.continueWa}
        </a>
        <Link href={`/${lang}/contacto#cotizar`} className="inline-flex h-14 items-center justify-center rounded-full px-6 font-bold text-ink ring-1 ring-inset ring-line">
          {t.newRequest}
        </Link>
      </div>
      <Link href={`/${lang}`} className="mt-6 inline-flex items-center gap-2 font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> {t.backHome}
      </Link>
    </motion.div>
  );
}
