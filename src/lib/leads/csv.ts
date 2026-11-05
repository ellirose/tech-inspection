// CSV export of leads, shared by `npm run leads:export` and the admin inbox's export button.
// UTF-8 with a byte-order mark and CRLF rows, so Excel opens accents and line breaks correctly.
import { langLabels, locationLabel, sourceLabels, statusLabels, urgencyLabel } from "./labels";
import type { Lead } from "./service";

/** Date and time in Colombia, in a form spreadsheets read as a date: "2026-11-01 10:30". */
const bogota = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Bogota", dateStyle: "short", timeStyle: "short" });
const when = (d: Date | null | undefined) => (d ? bogota.format(d) : "");

// Spanish headings and values, for the sales team. The UTM columns keep their standard names.
const columns: [header: string, value: (l: Lead) => string | null | undefined][] = [
  ["Referencia", (l) => l.reference],
  ["Fecha (hora de Colombia)", (l) => when(l.createdAt)],
  ["Estado", (l) => statusLabels[l.status] ?? l.status],
  ["Canal", (l) => sourceLabels[l.source] ?? l.source],
  ["Idioma", (l) => langLabels[l.lang] ?? l.lang],
  ["Servicios", (l) => l.services.join("; ")],
  ["Métodos", (l) => l.methods.map((m) => (m === "unsure" ? "No sabe" : m.toUpperCase())).join("; ")],
  ["Industria", (l) => l.industry],
  ["Componente", (l) => l.component],
  ["Cantidad", (l) => l.quantity],
  ["Ubicación", (l) => locationLabel(l.location) ?? l.location],
  ["Ciudad", (l) => l.city],
  ["Urgencia", (l) => (l.urgency ? urgencyLabel(l.urgency) : "")],
  ["Descripción", (l) => l.description],
  ["Adjuntos", (l) => l.attachments.map((a) => a.name).join("; ")],
  ["Nombre", (l) => l.name],
  ["Empresa", (l) => l.company],
  ["Correo", (l) => l.email],
  ["Teléfono", (l) => l.phone],
  ["Autorización de datos (fecha)", (l) => when(l.consentAt)],
  ["utm_source", (l) => l.attribution.utmSource],
  ["utm_medium", (l) => l.attribution.utmMedium],
  ["utm_campaign", (l) => l.attribution.utmCampaign],
  ["Sitio de procedencia", (l) => l.attribution.referrer],
  ["Página de llegada", (l) => l.attribution.landingPage],
  ["Enviado desde", (l) => l.attribution.submittedFrom],
  ["Dispositivo", (l) => l.attribution.device],
  ["Asignado a", (l) => l.assignedTo],
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
