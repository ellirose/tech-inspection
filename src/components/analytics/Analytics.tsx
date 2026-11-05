"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie } from "@phosphor-icons/react";
import { analyticsEnabled, CONSENT_OPEN_EVENT, GA_ID, GTM_ID, readConsent, saveConsent, track, type ConsentChoice } from "@/lib/analytics";

type Text = { title: string; text: string; accept: string; reject: string; more: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Google Consent Mode v2: everything denied until the visitor accepts analytics. */
function gtag(...args: unknown[]) {
  (window.dataLayer ??= []).push(args);
}

let loaded = false;
function loadTags() {
  if (loaded || !analyticsEnabled) return;
  loaded = true;
  gtag("consent", "update", { analytics_storage: "granted" });
  const s = document.createElement("script");
  s.async = true;
  if (GTM_ID) {
    (window.dataLayer ??= []).push({ "gtm.start": Date.now(), event: "gtm.js" });
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  } else {
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
  document.head.appendChild(s);
}

/** Where on the page a link sits, for whatsapp_click (data-track="floating" etc., else the landmark). */
function placeOf(el: Element) {
  const tagged = el.closest<HTMLElement>("[data-track]")?.dataset.track;
  if (tagged) return tagged;
  if (el.closest("footer")) return "footer";
  if (el.closest("header")) return "header";
  return "cta";
}

/**
 * Consent banner and event tracking (design document §18). The banner appears only when analytics is
 * configured (NEXT_PUBLIC_GTM_ID or NEXT_PUBLIC_GA_ID); tags load only after the visitor accepts. Link
 * clicks (WhatsApp, phone, email, PDFs, TI-QMS) are tracked here by delegation; forms and chat call
 * track() themselves.
 */
export function Analytics({ lang, t, platformUrl }: { lang: string; t: Text; platformUrl: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const platformHost = (() => {
      try {
        return new URL(platformUrl).host;
      } catch {
        return "";
      }
    })();
    gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied", wait_for_update: 500 });
    const choice = readConsent();
    if (choice === "granted") loadTags();
    // Reading storage after hydration: the banner cannot be decided on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (choice === null && analyticsEnabled) setShow(true);
    const reopen = () => setShow(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const page = location.pathname;
      if (href.startsWith("tel:")) track({ event: "phone_click", page });
      else if (href.startsWith("mailto:")) track({ event: "email_click", page });
      else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) track({ event: "whatsapp_click", location: placeOf(a), page });
      else if (/\/docs\/[^?#]+\.pdf/i.test(href)) track({ event: "cert_download", document: href.split("/").pop()!.split(/[?#]/)[0] });
      else if (platformHost && href.includes(platformHost)) track({ event: "tiqms_click", audience: a.closest<HTMLElement>("[data-audience]")?.dataset.audience ?? "general", page });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [platformUrl]);

  const decide = (choice: ConsentChoice) => {
    saveConsent(choice);
    setShow(false);
    if (choice === "granted") loadTags();
    // Withdrawing consent: stop further collection now; tags already loaded stop on the next page.
    else gtag("consent", "update", { analytics_storage: "denied" });
  };

  if (!show) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label={t.title} className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-[1.75rem] bg-surface p-5 shadow-float ring-1 ring-line sm:bottom-5 sm:p-6">
      <div className="flex items-start gap-4">
        <Cookie weight="duotone" className="mt-0.5 hidden size-8 shrink-0 text-neon sm:block" />
        <div className="min-w-0">
          <p className="font-extrabold text-ink">{t.title}</p>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">
            {t.text}{" "}
            <Link href={`/${lang}/politica-de-privacidad`} className="font-bold text-accent underline-offset-4 hover:underline">
              {t.more}
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide("granted")} className="h-11 rounded-full bg-corp-blue px-5 font-bold text-white ring-1 ring-white/20 transition hover:bg-corp-steel">
              {t.accept}
            </button>
            <button type="button" onClick={() => decide("denied")} className="h-11 rounded-full bg-surface-2 px-5 font-bold text-ink ring-1 ring-line transition hover:ring-neon/40">
              {t.reject}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** "Cookie settings" in the footer: reopens the banner. Hidden when analytics is not configured. */
export function CookieSettings({ label, className }: { label: string; className?: string }) {
  if (!analyticsEnabled) return null;
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))} className={className}>
      {label}
    </button>
  );
}
