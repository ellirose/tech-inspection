// Answer keys shared by the quote wizard, the assistant and the lead service. Forms send these keys,
// the database stores them, and labels come from the dictionaries by position
// (dict.quote.quantities[i], .locations[i], .urgencies[i]), so a lead reads the same in any language.
import type { MethodKey } from "@/content/methods";

export const quantityKeys = ["1-10", "11-50", "51-200", "200+"] as const;
export const locationKeys = ["base", "field"] as const;
export const urgencyKeys = ["scheduled", "priority", "urgent"] as const;
export const methodKeys = ["ut", "mt", "pt", "vt"] as const satisfies readonly MethodKey[];

export type QuantityKey = (typeof quantityKeys)[number];
export type LocationKey = (typeof locationKeys)[number];
export type UrgencyKey = (typeof urgencyKeys)[number];
/** A method key, or "unsure" when the requester does not know which method they need. */
export type LeadMethod = MethodKey | "unsure";

/** Label for an answer key from the matching dictionary list. */
export const labelFor = <K extends string>(keys: readonly K[], labels: readonly string[], key: K | null | undefined) =>
  key ? (labels[keys.indexOf(key)] ?? key) : undefined;

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Digits with optional +, spaces, dots, dashes and parentheses; 7 to 15 digits in total.
const PHONE = /^\+?[\d\s().-]+$/;
export const isPhone = (v: string) => {
  const digits = v.replace(/\D/g, "").length;
  return PHONE.test(v) && digits >= 7 && digits <= 15;
};

/** Reads a free-text "phone or email" answer into whichever field it fits, keeping fields already given. */
export function splitContact(contact: string, given: { email?: string; phone?: string } = {}): { email?: string; phone?: string } {
  const value = contact.trim();
  if (EMAIL.test(value)) return { email: given.email ?? value.toLowerCase() };
  if (isPhone(value)) return { phone: given.phone ?? value };
  return {};
}

/** Where a submission came from, as the wizard and assistant send it. */
export type LeadAttributionInput = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  submittedFrom?: string;
};

/** Response body of POST /api/leads. */
export type LeadResponse = { ok: true; reference: string } | { ok: false; error: "invalid" | "files" | "rate_limited" | "captcha" | "server" };

/** Drawings, specs or photos sent with a quote request (design document §11.2), checked on both sides. */
export const ATTACHMENTS = { maxFiles: 3, maxBytes: 10 * 1024 * 1024, accept: "application/pdf,image/jpeg,image/png", extensions: /\.(pdf|jpe?g|png)$/i };

/** File size for people: "640 KB", "2,4 MB" (decimal separator of the language). */
export const formatBytes = (n: number, lang = "es") =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }).format(n / 1024 / 1024)} MB`;
