// Editing of fixed page sections (page_block). Blocks are structured JSON; the editor exposes the text
// in them (translations, item lists), years and figures, standard codes and image paths, and never
// their structure or internal keys. The server rebuilds a block by walking its stored value, so a
// submitted form can change values but not add, drop or rename anything.
import { locales, type L10n } from "@/i18n/config";

/** Label, where the section appears, and the public pages that show it (without the language prefix). */
export const blockInfo: Record<string, { label: string; where: string; pages: string[] }> = {
  home: { label: "Portada", where: "Encabezado, servicios, métodos y proceso de la portada; también Servicios y Métodos", pages: ["", "/servicios", "/metodos"] },
  cover: { label: "Presentación de la empresa", where: "Bloque de brocas de la portada y pie de página", pages: [""] },
  timelineIntro: { label: "Trayectoria: introducción", where: "Portada (trayectoria y aliado)", pages: [""] },
  timeline: { label: "Trayectoria: hitos", where: "Portada y página TI-QMS", pages: ["", "/plataforma"] },
  credentials: { label: "Credenciales", where: "Portada (por qué elegirnos) y HSEQ", pages: ["", "/hseq"] },
  whyBit: { label: "Inspección de brocas", where: "Portada", pages: [""] },
  methodsApplied: { label: "Métodos aplicados", where: "Página de cada método", pages: ["/metodos/ultrasonido", "/metodos/particulas-magneticas", "/metodos/liquidos-penetrantes", "/metodos/dimensional-visual"] },
  process: { label: "Proceso de inspección", where: "Portada", pages: [""] },
  standards: { label: "Marco normativo", where: "Portada", pages: [""] },
  partner: { label: "Aliado Ulterra", where: "Portada", pages: [""] },
  tiqms: { label: "Plataforma TI-QMS", where: "Portada", pages: [""] },
  closing: { label: "Cierre", where: "Portada", pages: [""] },
};

const keyLabels: Record<string, string> = {
  eyebrow: "Antetítulo",
  title: "Título",
  lead: "Entradilla",
  body: "Texto",
  text: "Texto",
  intro: "Introducción",
  label: "Etiqueta",
  cta: "Botón",
  ctaSecondary: "Botón secundario",
  items: "Elementos",
  steps: "Pasos",
  pillars: "Pilares",
  features: "Funciones",
  image: "Imagen",
  alt: "Texto alternativo",
  caption: "Pie de foto",
  year: "Año",
  value: "Valor",
  code: "Código",
  name: "Nombre",
  note: "Nota",
  quote: "Cita",
  hero: "Encabezado",
};
export const keyLabel = (key: string) => keyLabels[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

export const isL10n = (v: unknown): v is L10n => !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).sort().join() === "en,es,pt" && locales.every((l) => typeof (v as Record<string, unknown>)[l] === "string");
export const isL10nList = (v: unknown): v is Record<string, string[]> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).sort().join() === "en,es,pt" && locales.every((l) => Array.isArray((v as Record<string, unknown>)[l]));

/** Plain strings that people edit: standard codes and image paths. Other strings are internal keys. */
export const isEditableString = (key: string, v: unknown): v is string => typeof v === "string" && (key === "code" || v.startsWith("/media/"));

export type BlockError = { path: string; message: string };

/**
 * New value of a block from the submitted form, following the stored value's shape.
 * Inputs are named by their path, e.g. hero.title.es or timeline.2.year.
 */
export function rebuildBlock(stored: unknown, form: FormData, fileExists: (p: string) => boolean) {
  const errors: BlockError[] = [];
  const get = (name: string) => {
    const v = form.get(name);
    return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : null;
  };
  const walk = (v: unknown, path: string, key: string): unknown => {
    if (isL10n(v)) {
      const next = Object.fromEntries(locales.map((l) => [l, get(`${path}.${l}`) ?? v[l]])) as L10n;
      const required = locales.filter((l) => v[l] !== "");
      if (required.some((l) => !next[l])) errors.push({ path, message: "Complete el texto en los tres idiomas" });
      return next;
    }
    if (isL10nList(v)) {
      const next = Object.fromEntries(
        locales.map((l) => {
          const raw = get(`${path}.${l}`);
          return [l, raw === null ? v[l] : raw.split("\n").map((x) => x.trim()).filter(Boolean)];
        }),
      ) as Record<string, string[]>;
      if (locales.some((l) => next[l].length !== v[l].length)) errors.push({ path, message: `Debe tener ${v.es.length} líneas en cada idioma` });
      return next;
    }
    if (typeof v === "number") {
      const raw = get(path);
      if (raw === null) return v;
      const n = Number(raw);
      if (!raw || !Number.isFinite(n)) errors.push({ path, message: "Número no válido" });
      return Number.isFinite(n) ? n : v;
    }
    if (isEditableString(key, v)) {
      const raw = get(path);
      if (raw === null) return v;
      if (!raw) errors.push({ path, message: "Obligatorio" });
      else if (v.startsWith("/media/") && (!raw.startsWith("/media/") || raw.includes("..") || !fileExists(raw))) errors.push({ path, message: `No existe el archivo ${raw}` });
      return raw || v;
    }
    if (Array.isArray(v)) return v.map((x, i) => walk(x, path ? `${path}.${i}` : String(i), key));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, path ? `${path}.${k}` : k, k)]));
    return v;
  };
  return { value: walk(stored, "", ""), errors };
}
