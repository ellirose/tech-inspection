// Field definitions for the content editor (design document §14.3: forms generated from the same
// schemas that validate what is published). Plain data, so the browser form can render from the same
// definitions the server validates with. Translatable text is { es, pt, en } with Spanish required.
import { locales, type L10n } from "@/i18n/config";

type Base = { name: string; label: string; hint?: string; required?: boolean };

export type Field = Base &
  (
    | { type: "text"; max?: number; createOnly?: boolean; pattern?: string }
    | { type: "l10n"; multiline?: boolean; max?: number; nullable?: boolean }
    /** One item per line, per language. */
    | { type: "l10nList" }
    /** A fixed number of translatable paragraphs, e.g. a service's two body paragraphs. */
    | { type: "l10nParagraphs"; count: number }
    | { type: "bool" }
    | { type: "int"; min?: number; max?: number }
    | { type: "select"; options: [value: string, label: string][] }
    /** Path of a file under /public, e.g. /media/photos/x.jpg or /docs/x.pdf. */
    | { type: "path"; prefixes: string[]; nullable?: boolean }
    /** One path per line. */
    | { type: "paths"; prefixes: string[] }
    | { type: "date" }
    | { type: "email"; nullable?: boolean }
    /** Ordered steps, each with a translatable title and text. */
    | { type: "steps" }
    /** Optional background video: file and poster image. */
    | { type: "video" }
    /** Methods linked to a service, in method order. */
    | { type: "methods" }
  );

export type FieldError = { field: string; message: string };

const langLabel = { es: "español", pt: "portugués", en: "inglés" } as const;

/** Builds the stored value of `field` from the submitted form, or reports what is wrong. */
export function readField(field: Field, form: FormData, fileExists: (path: string) => boolean): { value?: unknown; error?: string } {
  const get = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : "";
  };
  const l10n = (key: string, required: boolean, max = 4000): { value?: L10n | null; error?: string } => {
    const value = Object.fromEntries(locales.map((l) => [l, get(`${key}.${l}`)])) as L10n;
    if (!value.es && !value.pt && !value.en) return required ? { error: "Escriba al menos el texto en español" } : { value: null };
    const missing = locales.filter((l) => !value[l]);
    if (missing.length) return { error: `Falta el texto en ${missing.map((l) => langLabel[l]).join(" y ")}` };
    if (locales.some((l) => value[l].length > max)) return { error: `Máximo ${max} caracteres por idioma` };
    return { value };
  };
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const checkPath = (p: string, prefixes: string[]) => {
    if (!prefixes.some((pre) => p.startsWith(pre)) || p.includes("..")) return `Debe empezar por ${prefixes.join(" o ")}`;
    if (!fileExists(p)) return `No existe el archivo ${p}`;
  };

  switch (field.type) {
    case "text": {
      const v = get(field.name);
      if (!v) return field.required ? { error: "Obligatorio" } : { value: null };
      if (field.max && v.length > field.max) return { error: `Máximo ${field.max} caracteres` };
      if (field.pattern && !new RegExp(field.pattern).test(v)) return { error: "Formato no válido" };
      return { value: v };
    }
    case "l10n":
      return l10n(field.name, !field.nullable, field.max);
    case "l10nList": {
      const value = Object.fromEntries(locales.map((l) => [l, lines(get(`${field.name}.${l}`))])) as Record<string, string[]>;
      const counts = locales.map((l) => value[l].length);
      if (!counts[0]) return field.required === false ? { value } : { error: "Agregue al menos un elemento" };
      if (new Set(counts).size > 1) return { error: `Cada idioma debe tener la misma cantidad de líneas (${locales.map((l, i) => `${langLabel[l]}: ${counts[i]}`).join(", ")})` };
      return { value };
    }
    case "l10nParagraphs": {
      const out: L10n[] = [];
      for (let i = 0; i < field.count; i++) {
        const p = l10n(`${field.name}.${i}`, true);
        if (p.error) return { error: `Párrafo ${i + 1}: ${p.error}` };
        out.push(p.value!);
      }
      return { value: out };
    }
    case "bool":
      return { value: form.get(field.name) === "on" };
    case "int": {
      const raw = get(field.name);
      const n = Number(raw);
      if (!raw || !Number.isInteger(n)) return field.required === false && !raw ? { value: null } : { error: "Número entero" };
      if ((field.min !== undefined && n < field.min) || (field.max !== undefined && n > field.max)) return { error: `Entre ${field.min} y ${field.max}` };
      return { value: n };
    }
    case "select": {
      const v = get(field.name);
      return field.options.some(([o]) => o === v) ? { value: v } : { error: "Elija una opción" };
    }
    case "path": {
      const v = get(field.name);
      if (!v) return field.nullable ? { value: null } : { error: "Obligatorio" };
      const error = checkPath(v, field.prefixes);
      return error ? { error } : { value: v };
    }
    case "paths": {
      const list = lines(get(field.name));
      for (const p of list) {
        const error = checkPath(p, field.prefixes);
        if (error) return { error };
      }
      return { value: list };
    }
    case "date": {
      const v = get(field.name);
      if (!v) return { value: null };
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? { value: v } : { error: "Fecha no válida" };
    }
    case "email": {
      const v = get(field.name);
      if (!v) return field.nullable ? { value: null } : { error: "Obligatorio" };
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? { value: v.toLowerCase() } : { error: "Correo no válido" };
    }
    case "steps": {
      const count = Number(get(`${field.name}.count`)) || 0;
      const steps = [];
      for (let i = 0; i < count; i++) {
        const title = l10n(`${field.name}.${i}.title`, false, 120);
        const text = l10n(`${field.name}.${i}.text`, false, 1000);
        if (title.value === null && text.value === null) continue; // removed or left empty
        if (title.error || !title.value) return { error: `Paso ${i + 1}, título: ${title.error ?? "obligatorio"}` };
        if (text.error || !text.value) return { error: `Paso ${i + 1}, texto: ${text.error ?? "obligatorio"}` };
        steps.push({ title: title.value, text: text.value });
      }
      return steps.length ? { value: steps } : { error: "Agregue al menos un paso" };
    }
    case "video": {
      const src = get(`${field.name}.src`);
      const poster = get(`${field.name}.poster`);
      if (!src && !poster) return { value: null };
      const error = (src && checkPath(src, ["/media/"])) || (poster && checkPath(poster, ["/media/"])) || (!src || !poster ? "Indique el video y su imagen de portada, o deje ambos vacíos" : undefined);
      return error ? { error } : { value: { src, poster } };
    }
    case "methods":
      return { value: form.getAll(field.name).filter((v): v is string => typeof v === "string") };
  }
}
