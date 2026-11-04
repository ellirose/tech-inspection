// Content types editable under Contenido: table, cache tag refreshed on save, list columns and fields.
import "server-only";
import { schema } from "@/db";
import { tags } from "@/lib/data/content";
import type { L10n } from "@/i18n/config";
import type { Field } from "./fields";

const seo: Field[] = [
  { name: "seoTitle", label: "Título para Google (opcional)", type: "l10n", nullable: true, max: 70, hint: "Hasta 70 caracteres. Vacío: se usa el nombre." },
  { name: "seoDescription", label: "Descripción para Google (opcional)", type: "l10n", nullable: true, multiline: true, max: 170, hint: "Hasta 170 caracteres. Vacío: se usa el resumen." },
];

const serviceIcons: [string, string][] = [
  ["bit", "Broca"],
  ["pipe", "Tubería"],
  ["drill", "Herramienta de perforación"],
  ["gauge", "Manómetro"],
  ["wrench", "Llave"],
  ["cylinder", "Cilindro"],
  ["crane", "Grúa"],
  ["tank", "Tanque"],
  ["buildings", "Estructura"],
];

type Row = Record<string, unknown> & { id: string };

export type Collection = {
  key: string;
  label: string;
  singular: string;
  lead: string;
  table: (typeof schema)[keyof typeof schema];
  tag: string;
  fields: Field[];
  title: (row: Row) => string;
  /** Public pages that show this content, without the language prefix ("" is the home page). */
  pages: (row: Row) => string[];
  /** Extra list column. */
  detail?: (row: Row) => string;
  canCreate: boolean;
  canDelete: boolean;
  /** Fixed values for new rows that are not edited in the form. */
  onCreate?: (values: Record<string, unknown>) => Record<string, unknown>;
};

const es = (v: unknown) => (v as L10n | null)?.es ?? "";

export const collections: Collection[] = [
  {
    key: "servicios",
    label: "Servicios",
    singular: "servicio",
    lead: "Líneas de servicio: menú, página de servicios, cotizador y asistente.",
    table: schema.service,
    tag: tags.services,
    title: (r) => es(r.name),
    pages: (r) => ["", "/servicios", `/servicios/${r.slug}`, "/contacto"],
    detail: (r) => `/servicios/${r.slug}${r.needsReview ? " · pendiente de confirmar" : ""}`,
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "slug", label: "Dirección (slug)", type: "text", required: true, max: 60, pattern: "^[a-z0-9]+(-[a-z0-9]+)*$", createOnly: true, hint: "Minúsculas y guiones, p. ej. inspeccion-de-valvulas. No se puede cambiar después: cambiarla rompería enlaces." },
      { name: "name", label: "Nombre", type: "l10n", max: 80 },
      { name: "short", label: "Resumen", type: "l10n", multiline: true, max: 300 },
      { name: "body", label: "Descripción", type: "l10nParagraphs", count: 2 },
      { name: "scope", label: "Alcance (un elemento por línea)", type: "l10nList" },
      { name: "methods", label: "Métodos que aplica", type: "methods" },
      { name: "icon", label: "Ícono", type: "select", options: serviceIcons },
      { name: "image", label: "Foto principal", type: "path", prefixes: ["/media/"] },
      { name: "gallery", label: "Galería (una ruta por línea)", type: "paths", prefixes: ["/media/"] },
      { name: "needsReview", label: "Texto pendiente de confirmar por el cliente", type: "bool" },
      ...seo,
    ],
  },
  {
    key: "metodos",
    label: "Métodos",
    singular: "método",
    lead: "Los cuatro métodos de ensayo no destructivo. Cada uno tiene su color, ícono y página.",
    table: schema.method,
    tag: tags.methods,
    title: (r) => `${r.code} · ${es(r.name)}`,
    pages: (r) => ["", "/metodos", `/metodos/${r.slug}`, "/servicios"],
    detail: (r) => `/metodos/${r.slug}`,
    canCreate: false,
    canDelete: false,
    fields: [
      { name: "name", label: "Nombre", type: "l10n", max: 80 },
      { name: "tagline", label: "Frase corta", type: "l10n", max: 160 },
      { name: "intro", label: "Introducción", type: "l10n", multiline: true },
      { name: "body", label: "Descripción", type: "l10n", multiline: true },
      { name: "advantages", label: "Ventajas (una por línea)", type: "l10nList" },
      { name: "detects", label: "Qué detecta (uno por línea)", type: "l10nList" },
      { name: "steps", label: "Pasos del ensayo", type: "steps" },
      { name: "cover", label: "Foto principal", type: "path", prefixes: ["/media/"] },
      { name: "gallery", label: "Galería (una ruta por línea)", type: "paths", prefixes: ["/media/"] },
      { name: "video", label: "Video de fondo (opcional)", type: "video" },
      ...seo,
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    singular: "cliente",
    lead: "Logos de la franja de clientes. Solo se muestran los autorizados.",
    table: schema.client,
    tag: tags.clients,
    title: (r) => String(r.name),
    pages: () => ["", "/nosotros"],
    detail: (r) => (r.showLogo ? "Logo autorizado" : "Sin autorización: no se muestra"),
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, max: 120 },
      { name: "logo", label: "Logo", type: "path", prefixes: ["/media/"] },
      { name: "square", label: "Logo cuadrado (se muestra más alto)", type: "bool" },
      { name: "showLogo", label: "El cliente autorizó mostrar su logo", type: "bool" },
    ],
  },
  {
    key: "cifras",
    label: "Cifras",
    singular: "cifra",
    lead: "Contadores de la portada.",
    table: schema.stat,
    tag: tags.stats,
    title: (r) => `${r.prefix ?? ""}${r.value} ${es(r.label)}`,
    pages: () => [""],
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "value", label: "Valor", type: "int", min: 0, max: 1_000_000 },
      { name: "prefix", label: "Prefijo (opcional)", type: "text", max: 3, hint: "Por ejemplo +" },
      { name: "label", label: "Etiqueta", type: "l10n", max: 60 },
    ],
  },
  {
    key: "certificaciones",
    label: "Certificaciones",
    singular: "certificación",
    lead: "Certificaciones del sistema de gestión y del personal. Una certificación vencida deja de mostrarse en el sitio.",
    table: schema.certification,
    tag: tags.certifications,
    title: (r) => `${r.code} · ${es(r.title)}`,
    pages: () => ["", "/hseq", "/nosotros"],
    detail: (r) => (r.expiryDate ? `Vence ${r.expiryDate}` : "Sin fecha de vencimiento"),
    canCreate: true,
    canDelete: true,
    onCreate: (v) => ({ key: String(v.code).toLowerCase().replace(/[^a-z0-9]+/g, "-") }),
    fields: [
      { name: "kind", label: "Tipo", type: "select", options: [["system", "Sistema de gestión"], ["personnel", "Personal"]] },
      { name: "code", label: "Código o norma", type: "text", required: true, max: 40, hint: "Por ejemplo ISO 9001:2015" },
      { name: "ring", label: "Texto alrededor del sello (solo sistema)", type: "text", max: 60 },
      { name: "title", label: "Título", type: "l10n", max: 120 },
      { name: "body", label: "Descripción", type: "l10n", multiline: true },
      { name: "certifier", label: "Organismo certificador", type: "text", max: 120 },
      { name: "certificateNumber", label: "Número de certificado", type: "text", max: 60, hint: "El sello oficial del CCS solo se muestra con este código (GC-… para ISO 9001, GS-… para ISO 45001)." },
      { name: "issueDate", label: "Fecha de emisión", type: "date" },
      { name: "expiryDate", label: "Fecha de vencimiento", type: "date", hint: "El panel avisa 60 días antes; al vencer se oculta del sitio." },
      { name: "pdfUrl", label: "Certificado en PDF (opcional)", type: "path", prefixes: ["/docs/"], nullable: true },
      { name: "usageNotes", label: "Notas de uso del sello (interno)", type: "text", max: 500 },
    ],
  },
  {
    key: "documentos",
    label: "Documentos y políticas",
    singular: "documento",
    lead: "PDF de la página HSEQ: políticas e informes de rendición de cuentas.",
    table: schema.companyDocument,
    tag: tags.documents,
    title: (r) => `${r.code} · ${es(r.title)}`,
    pages: () => ["/hseq"],
    detail: (r) => (r.kind === "policy" ? "Política" : `Rendición de cuentas ${r.year ?? ""}`),
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "kind", label: "Tipo", type: "select", options: [["policy", "Política"], ["accountability", "Rendición de cuentas"]] },
      { name: "code", label: "Código", type: "text", required: true, max: 40 },
      { name: "title", label: "Título", type: "l10n", max: 160 },
      { name: "fileUrl", label: "Archivo PDF", type: "path", prefixes: ["/docs/"] },
      { name: "version", label: "Versión", type: "text", max: 20 },
      { name: "year", label: "Año (rendición de cuentas)", type: "int", min: 2000, max: 2100, required: false },
      { name: "thumbnail", label: "Miniatura (opcional)", type: "path", prefixes: ["/media/"], nullable: true },
    ],
  },
  {
    key: "equipo",
    label: "Equipo directivo",
    singular: "persona",
    lead: "Personas de la sección de liderazgo en Nosotros.",
    table: schema.teamMember,
    tag: tags.team,
    title: (r) => String(r.name),
    pages: () => ["/nosotros"],
    detail: (r) => es(r.role),
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true, max: 120 },
      { name: "role", label: "Cargo", type: "l10n", max: 120 },
      { name: "bio", label: "Perfil", type: "l10n", multiline: true, nullable: true },
      { name: "photo", label: "Foto", type: "path", prefixes: ["/media/"], nullable: true },
      { name: "email", label: "Correo", type: "email", nullable: true },
      { name: "isLeadership", label: "Mostrar en liderazgo", type: "bool" },
    ],
  },
  {
    key: "canales",
    label: "Canales de atención",
    singular: "canal",
    lead: "Directorio de áreas de la página de contacto.",
    table: schema.contactChannel,
    tag: tags.channels,
    title: (r) => es(r.role),
    pages: () => ["/contacto"],
    detail: (r) => String(r.email),
    canCreate: true,
    canDelete: true,
    fields: [
      { name: "role", label: "Área", type: "l10n", max: 80 },
      { name: "scope", label: "Temas que atiende", type: "l10n", max: 200 },
      { name: "phone", label: "Teléfono", type: "text", required: true, max: 40 },
      { name: "email", label: "Correo", type: "email" },
    ],
  },
];

export const findCollection = (key: string) => collections.find((c) => c.key === key);
