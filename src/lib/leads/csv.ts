// CSV export of leads, shared by `npm run leads:export` now and the admin inbox's export button in stage 4.
// UTF-8 with a byte-order mark and CRLF rows, so Excel opens accents and line breaks correctly.
import type { Lead } from "./service";

const columns: [header: string, value: (l: Lead) => string | null | undefined][] = [
  ["reference", (l) => l.reference],
  ["created_at", (l) => l.createdAt.toISOString()],
  ["status", (l) => l.status],
  ["source", (l) => l.source],
  ["lang", (l) => l.lang],
  ["services", (l) => l.services.join("; ")],
  ["methods", (l) => l.methods.join("; ")],
  ["industry", (l) => l.industry],
  ["component", (l) => l.component],
  ["quantity", (l) => l.quantity],
  ["location", (l) => l.location],
  ["city", (l) => l.city],
  ["urgency", (l) => l.urgency],
  ["description", (l) => l.description],
  ["attachments", (l) => l.attachments.map((a) => a.name).join("; ")],
  ["name", (l) => l.name],
  ["company", (l) => l.company],
  ["email", (l) => l.email],
  ["phone", (l) => l.phone],
  ["consent_at", (l) => l.consentAt?.toISOString()],
  ["utm_source", (l) => l.attribution.utmSource],
  ["utm_medium", (l) => l.attribution.utmMedium],
  ["utm_campaign", (l) => l.attribution.utmCampaign],
  ["referrer", (l) => l.attribution.referrer],
  ["landing_page", (l) => l.attribution.landingPage],
  ["submitted_from", (l) => l.attribution.submittedFrom],
  ["device", (l) => l.attribution.device],
  ["assigned_to", (l) => l.assignedTo],
];

/** Quotes a field, and defuses values a spreadsheet would run as a formula. */
export function csvField(value: string | null | undefined) {
  if (value == null) return "";
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n;]/.test(safe) || safe !== value ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** `separator` ";" suits Excel with Spanish (Colombia) regional settings, whose list separator is ";". */
export function leadsToCsv(leads: Lead[], separator: "," | ";" = ",") {
  const rows = [columns.map(([h]) => h), ...leads.map((l) => columns.map(([, get]) => get(l)))];
  return "﻿" + rows.map((r) => r.map(csvField).join(separator)).join("\r\n") + "\r\n";
}
