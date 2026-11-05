// Spanish labels for lead fields, shared by the admin screens and the CSV export (no server-only imports,
// so `npm run leads:export` can use them too).
import { getDictionary } from "@/i18n/dictionaries";
import type { Lead } from "./service";
import { labelFor, locationKeys, urgencyKeys } from "./options";

export const statusLabels: Record<Lead["status"], string> = {
  new: "Nuevo",
  contacted: "Contactado",
  quoted: "Cotizado",
  won: "Ganado",
  lost: "Perdido",
};
export const sourceLabels: Record<Lead["source"], string> = {
  form_quote: "Formulario de cotización",
  form_contact: "Formulario de contacto",
  chatbot: "Asistente",
};
export const langLabels: Record<string, string> = { es: "Español", pt: "Portugués", en: "Inglés" };

const es = getDictionary("es").quote;
export const urgencyLabel = (key: string | null) => labelFor(urgencyKeys, es.urgencies, key as (typeof urgencyKeys)[number]) ?? "—";
export const locationLabel = (key: string | null) => labelFor(locationKeys, es.locations, key as (typeof locationKeys)[number]);
