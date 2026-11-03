"use client";

import { useEffect, useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react/ssr";
import { locales, type L10n } from "@/i18n/config";
import type { Field } from "@/lib/admin/fields";
import { saveContent, type SaveState } from "@/app/admin/(panel)/contenido/actions";
import { buttonClass, Card, fieldClass, labelClass, Notice, quietButtonClass } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/useFormAction";
import { cn } from "@/lib/cn";

type Values = Record<string, unknown>;
export type EditorProps = {
  collection: string;
  id: string | null;
  updatedAt: string | null;
  fields: Field[];
  values: Values;
  files: { images: string[]; videos: string[]; docs: string[] };
  methods: { id: string; label: string }[];
  readOnly: boolean;
};

const langName = { es: "ES", pt: "PT", en: "EN" } as const;
const l10nOf = (v: unknown) => (v ?? {}) as Partial<L10n>;
const linesOf = (v: unknown, l: (typeof locales)[number]) => ((v as Record<string, string[]> | null)?.[l] ?? []).join("\n");

function L10nInputs({ name, value, multiline, rows = 3 }: { name: string; value: unknown; multiline?: boolean; rows?: number }) {
  const v = l10nOf(value);
  return (
    <div className={cn("grid gap-2", !multiline && "sm:grid-cols-3")}>
      {locales.map((l) => (
        <label key={l} className="flex items-start gap-2">
          <span className="mt-2.5 w-7 shrink-0 font-mono text-xs font-bold text-mute">{langName[l]}</span>
          {multiline ? (
            <textarea name={`${name}.${l}`} defaultValue={v[l] ?? ""} rows={rows} className={cn(fieldClass, "text-sm")} />
          ) : (
            <input name={`${name}.${l}`} defaultValue={v[l] ?? ""} className={cn(fieldClass, "text-sm")} />
          )}
        </label>
      ))}
    </div>
  );
}

function Thumbs({ paths }: { paths: string[] }) {
  const images = paths.filter((p) => /\.(jpe?g|png|webp|avif|svg)$/i.test(p));
  if (!images.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {images.slice(0, 12).map((p) => (
        // Plain img: an admin preview of files already in /public, any size.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p} src={p} alt="" className="h-16 w-24 rounded-lg object-cover ring-1 ring-line" />
      ))}
    </div>
  );
}

function PathInput({ name, value, list, preview }: { name: string; value: string; list: string; preview?: boolean }) {
  const [current, setCurrent] = useState(value);
  return (
    <>
      <input name={name} defaultValue={value} list={list} onChange={(e) => setCurrent(e.target.value.trim())} className={cn(fieldClass, "font-mono text-sm")} placeholder="/media/…" />
      {preview && current && <Thumbs paths={[current]} />}
    </>
  );
}

function Steps({ name, value }: { name: string; value: unknown }) {
  const initial = (value as { title: L10n; text: L10n }[] | null) ?? [];
  const [rows, setRows] = useState(() => initial.map((s, i) => ({ key: i, ...s })));
  const [next, setNext] = useState(initial.length);
  return (
    <div className="space-y-4">
      <input type="hidden" name={`${name}.count`} value={next} />
      {rows.map((row, i) => (
        <div key={row.key} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-inset ring-line">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-ink">Paso {i + 1}</span>
            <button type="button" onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))} className="inline-flex items-center gap-1 text-sm font-bold text-pt">
              <Trash className="size-4" /> Quitar
            </button>
          </div>
          <p className="mb-1 text-xs font-bold text-mute">Título</p>
          <L10nInputs name={`${name}.${row.key}.title`} value={row.title} />
          <p className="mb-1 mt-3 text-xs font-bold text-mute">Texto</p>
          <L10nInputs name={`${name}.${row.key}.text`} value={row.text} multiline rows={2} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((r) => [...r, { key: next, title: { es: "", pt: "", en: "" }, text: { es: "", pt: "", en: "" } }]);
          setNext((n) => n + 1);
        }}
        className={cn(quietButtonClass, "h-10 text-sm")}
      >
        <Plus className="size-4" /> Agregar paso
      </button>
    </div>
  );
}

function FieldInput({ field, value, methods }: { field: Field; value: unknown; methods: EditorProps["methods"] }) {
  switch (field.type) {
    case "text":
      return <input name={field.name} defaultValue={String(value ?? "")} maxLength={field.max} className={fieldClass} />;
    case "l10n":
      return <L10nInputs name={field.name} value={value} multiline={field.multiline} />;
    case "l10nList":
      return (
        <div className="grid gap-2 lg:grid-cols-3">
          {locales.map((l) => (
            <label key={l}>
              <span className="mb-1 block font-mono text-xs font-bold text-mute">{langName[l]}</span>
              <textarea name={`${field.name}.${l}`} defaultValue={linesOf(value, l)} rows={6} className={cn(fieldClass, "text-sm")} />
            </label>
          ))}
        </div>
      );
    case "l10nParagraphs":
      return (
        <div className="space-y-4">
          {Array.from({ length: field.count }, (_, i) => (
            <div key={i}>
              <p className="mb-1 text-xs font-bold text-mute">Párrafo {i + 1}</p>
              <L10nInputs name={`${field.name}.${i}`} value={(value as unknown[] | null)?.[i]} multiline />
            </div>
          ))}
        </div>
      );
    case "bool":
      return <input type="checkbox" name={field.name} defaultChecked={Boolean(value)} className="size-5 accent-brand-600" />;
    case "int":
      return <input type="number" name={field.name} defaultValue={value == null ? "" : String(value)} min={field.min} max={field.max} className={cn(fieldClass, "max-w-48")} />;
    case "select":
      return (
        <select name={field.name} defaultValue={String(value ?? field.options[0][0])} className={cn(fieldClass, "max-w-md")}>
          {field.options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      );
    case "path":
      return <PathInput name={field.name} value={String(value ?? "")} list={field.prefixes.includes("/docs/") ? "files-docs" : "files-images"} preview={field.prefixes.includes("/media/")} />;
    case "paths":
      return (
        <>
          <textarea name={field.name} defaultValue={((value as string[] | null) ?? []).join("\n")} rows={4} className={cn(fieldClass, "font-mono text-sm")} />
          <Thumbs paths={(value as string[] | null) ?? []} />
        </>
      );
    case "date":
      return <input type="date" name={field.name} defaultValue={String(value ?? "")} className={cn(fieldClass, "max-w-56")} />;
    case "email":
      return <input type="email" name={field.name} defaultValue={String(value ?? "")} className={cn(fieldClass, "max-w-md")} />;
    case "steps":
      return <Steps name={field.name} value={value} />;
    case "video": {
      const v = (value as { src: string; poster: string } | null) ?? { src: "", poster: "" };
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-bold text-mute">Video (mp4)</span>
            <input name={`${field.name}.src`} defaultValue={v.src} list="files-videos" className={cn(fieldClass, "font-mono text-sm")} />
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold text-mute">Imagen de portada</span>
            <input name={`${field.name}.poster`} defaultValue={v.poster} list="files-images" className={cn(fieldClass, "font-mono text-sm")} />
          </label>
        </div>
      );
    }
    case "methods": {
      const selected = new Set((value as string[] | null) ?? []);
      return (
        <div className="flex flex-wrap gap-3">
          {methods.map((m) => (
            <label key={m.id} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 ring-1 ring-inset ring-line">
              <input type="checkbox" name={field.name} value={m.id} defaultChecked={selected.has(m.id)} className="size-4 accent-brand-600" />
              <span className="text-sm font-bold">{m.label}</span>
            </label>
          ))}
        </div>
      );
    }
  }
}

/** Form for one content item, generated from its field definitions. */
export function ContentEditor({ collection, id, updatedAt, fields, values, files, methods, readOnly }: EditorProps) {
  const [state, onSubmit, pending] = useFormAction<SaveState>(saveContent, {});
  // The save result current when the form was last edited: still dirty until a later save succeeds.
  const [editedAt, setEditedAt] = useState<SaveState | null>(null);
  const dirty = editedAt !== null && (editedAt === state || !state.ok);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form onSubmit={onSubmit} onChange={() => setEditedAt(state)} className="space-y-5">
      <input type="hidden" name="collection" value={collection} />
      <input type="hidden" name="id" value={id ?? ""} />
      <input type="hidden" name="updatedAt" value={updatedAt ?? ""} />
      <datalist id="files-images">{files.images.map((f) => <option key={f} value={f} />)}</datalist>
      <datalist id="files-videos">{files.videos.map((f) => <option key={f} value={f} />)}</datalist>
      <datalist id="files-docs">{files.docs.map((f) => <option key={f} value={f} />)}</datalist>

      <fieldset disabled={readOnly} className="space-y-5">
        {fields.map((field) => {
          const error = state.fieldErrors?.[field.name];
          const locked = field.type === "text" && field.createOnly && id !== null;
          return (
            <Card key={field.name} className={cn(error && "ring-2 ring-pt/60")}>
              <div className={cn(field.type === "bool" && "flex flex-row-reverse items-center justify-end gap-3")}>
                <p className={cn(labelClass, field.type === "bool" && "mb-0")}>{field.label}</p>
                {locked ? <p className="font-mono text-sm text-ink">{String(values[field.name])}</p> : <FieldInput field={field} value={values[field.name]} methods={methods} />}
              </div>
              {field.hint && !locked && <p className="mt-2 text-xs text-mute">{field.hint}</p>}
              {(field.type === "path" || field.type === "paths") && !readOnly && (
                <p className="mt-2 text-xs text-mute">
                  ¿Un archivo nuevo? Súbalo en{" "}
                  <a href="/admin/medios" target="_blank" rel="noopener" className="font-bold text-accent">
                    Medios ↗
                  </a>{" "}
                  (se abre aparte, sin perder lo escrito) y pegue aquí su ruta.
                </p>
              )}
              {error && <p className="mt-2 text-sm font-bold text-pt">{error}</p>}
            </Card>
          );
        })}
      </fieldset>

      {!readOnly && (
        <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl bg-canvas/95 px-1 py-3 backdrop-blur">
          <button className={buttonClass} disabled={pending}>
            {pending ? "Guardando…" : id ? "Guardar cambios" : "Crear borrador"}
          </button>
          {dirty && !pending && <span className="text-sm font-bold text-vt">Cambios sin guardar</span>}
          {state.error && <Notice>{state.error}</Notice>}
          {state.ok && <Notice tone="ok">{state.ok}</Notice>}
        </div>
      )}
    </form>
  );
}
