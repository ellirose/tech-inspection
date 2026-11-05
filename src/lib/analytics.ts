// Analytics events (design document §18.1), pushed to the Google Tag Manager data layer. Safe to call
// anywhere in the browser: without consent or without a container configured, events only queue in
// window.dataLayer and nothing leaves the page (see components/analytics/Analytics.tsx).

export type AnalyticsEvent =
  | { event: "quote_start"; prefilled_service?: string }
  | { event: "quote_step"; step_number: number }
  | { event: "quote_submit"; services: string; urgency: string; source_page: string }
  | { event: "contact_submit"; source_page: string }
  | { event: "whatsapp_click"; location: string; page: string }
  | { event: "phone_click"; page: string }
  | { event: "email_click"; page: string }
  | { event: "chat_open"; page: string }
  | { event: "chat_lead"; services: string; urgency: string }
  | { event: "cert_download"; document: string }
  | { event: "tiqms_click"; audience: string; page: string };

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(e: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  (window.dataLayer ??= []).push(e);
}

export const CONSENT_KEY = "ti-consent";
export const CONSENT_OPEN_EVENT = "ti:consent-open";
export type ConsentChoice = "granted" | "denied";

export function readConsent(): ConsentChoice | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {}
}

/** Analytics is configured for this build (a GTM container or a GA4 measurement ID). */
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";
export const analyticsEnabled = Boolean(GTM_ID || GA_ID);
