// Browser side of lead capture: where the visit came from, the request to /api/leads, and the
// hand-off to the thank-you page. Storage can be unavailable (private mode, blocked site data), so
// every access is guarded and the flow works without it.
import type { LeadAttributionInput, LeadResponse } from "./options";

const LANDING_KEY = "ti:landing";
const THANKS_KEY = "ti:thanks";

const read = <T>(key: string): T | undefined => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};
const write = (key: string, value: unknown) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

/** Called once per visit on the first page: keeps the campaign tags and the page the visit started on. */
export function recordLanding() {
  if (read(LANDING_KEY)) return;
  const url = new URL(location.href);
  const p = url.searchParams;
  const referrer = document.referrer && new URL(document.referrer).host !== location.host ? document.referrer : undefined;
  write(LANDING_KEY, {
    utmSource: p.get("utm_source") ?? undefined,
    utmMedium: p.get("utm_medium") ?? undefined,
    utmCampaign: p.get("utm_campaign") ?? undefined,
    utmTerm: p.get("utm_term") ?? undefined,
    utmContent: p.get("utm_content") ?? undefined,
    referrer,
    landingPage: url.pathname + url.search,
  } satisfies LeadAttributionInput);
}

const attribution = (): LeadAttributionInput => ({ ...read<LeadAttributionInput>(LANDING_KEY), submittedFrom: location.pathname });

export async function submitLead(payload: Record<string, unknown>): Promise<LeadResponse> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, attribution: attribution() }),
    });
    return (await res.json()) as LeadResponse;
  } catch {
    return { ok: false, error: "server" };
  }
}

export type Thanks = { reference: string; whatsappText: string; emailed: boolean };
export const saveThanks = (value: Thanks) => write(THANKS_KEY, value);

// Same object while the stored value is unchanged, as useSyncExternalStore requires.
let snapshot: { raw: string | null; value: Thanks | null } = { raw: null, value: null };
export function readThanks(): Thanks | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(THANKS_KEY);
  } catch {}
  if (raw !== snapshot.raw) {
    let value: Thanks | null = null;
    try {
      value = raw ? (JSON.parse(raw) as Thanks) : null;
    } catch {}
    snapshot = { raw, value };
  }
  return snapshot.value;
}
