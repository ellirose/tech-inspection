"use client";

import { useEffect, useState } from "react";
import { locales } from "@/i18n/config";
import { isEditableString, isL10n, isL10nList, keyLabel } from "@/lib/admin/blocks";
import { saveBlock, type BlockState } from "@/app/admin/(panel)/contenido/paginas/actions";
import { buttonClass, fieldClass, Notice, quietButtonClass } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/useFormAction";
import { cn } from "@/lib/cn";

const langName = { es: "ES", pt: "PT", en: "EN" } as const;

const hasEditable = (v: unknown, key: string): boolean =>
  isL10n(v) || isL10nList(v) || typeof v === "number" || isEditableString(key, v) || (Array.isArray(v) ? v.some((x) => hasEditable(x, key)) : !!v && typeof v === "object" && Object.entries(v).some(([k, x]) => hasEditable(x, k)));

/** A readable name for a list item: its Spanish title or label when it has one. */
const itemName = (v: unknown, i: number) => {
  const o = v as Record<string, unknown> | null;
  const named = o && (["title", "label", "name"] as const).map((k) => o[k]).find(isL10n);
  return named ? `${i + 1}. ${named.es}` : `Elemento ${i + 1}`;
};

function Node({ value, path, name, errors }: { value: unknown; path: string; name: string; errors: Record<string, string> }) {
  if (!hasEditable(value, name)) return null;
  const error = errors[path];
  const label = <p className="mb-1.5 text-sm font-bold text-ink">{keyLabel(name)}</p>;
  const errorLine = error && <p className="mt-1 text-sm font-bold text-pt">{error}</p>;

  if (isL10n(value)) {
    const long = locales.some((l) => value[l].length > 70);
    return (
      <div className={cn(error && "rounded-xl ring-2 ring-pt/60 ring-offset-4 ring-offset-surface")}>
        {label}
        <div className={cn("grid gap-2", !long && "lg:grid-cols-3")}>
          {locales.map((l) => (
            <label key={l} className="flex items-start gap-2">
              <span className="mt-2.5 w-7 shrink-0 font-mono text-xs font-bold text-mute">{langName[l]}</span>
              {long ? (
                <textarea name={`${path}.${l}`} defaultValue={value[l]} rows={Math.min(6, Math.ceil(value[l].length / 90) + 1)} className={cn(fieldClass, "text-sm")} />
              ) : (
                <input name={`${path}.${l}`} defaultValue={value[l]} className={cn(fieldClass, "text-sm")} />
              )}
            </label>
          ))}
        </div>
        {errorLine}
      </div>
    );
  }
  if (isL10nList(value)) {
    return (
      <div>
        {label}
        <p className="mb-2 text-xs text-mute">Una línea por elemento; {value.es.length} líneas en cada idioma.</p>
        <div className="grid gap-2 lg:grid-cols-3">
          {locales.map((l) => (
            <label key={l}>
              <span className="mb-1 block font-mono text-xs font-bold text-mute">{langName[l]}</span>
              <textarea name={`${path}.${l}`} defaultValue={value[l].join("\n")} rows={Math.max(3, value[l].length + 1)} className={cn(fieldClass, "text-sm")} />
            </label>
          ))}
        </div>
        {errorLine}
      </div>
    );
  }
  if (typeof value === "number") {
    return (
      <label className="block max-w-48">
        {label}
        <input name={path} type="number" defaultValue={value} className={fieldClass} />
        {errorLine}
      </label>
    );
  }
  if (typeof value === "string") {
    return (
      <label className="block">
        {label}
        <input name={path} defaultValue={value} list={value.startsWith("/media/") ? "files-images" : undefined} className={cn(fieldClass, value.startsWith("/media/") && "font-mono text-sm")} />
        {errorLine}
      </label>
    );
  }
  if (Array.isArray(value)) {
    return (
      <fieldset className="space-y-3">
        <legend className="mb-2 text-base font-extrabold text-ink">{keyLabel(name)}</legend>
        {value.map((item, i) => (
          <details key={i} className="rounded-2xl bg-surface-2 p-4 ring-1 ring-inset ring-line" open={value.length <= 3}>
            <summary className="cursor-pointer font-bold text-ink">{itemName(item, i)}</summary>
            <div className="mt-4 space-y-4">
              <Node value={item} path={path ? `${path}.${i}` : String(i)} name={name} errors={errors} />
            </div>
          </details>
        ))}
      </fieldset>
    );
  }
  const entries = Object.entries(value as Record<string, unknown>);
  return (
    <div className="space-y-4">
      {entries.map(([k, v]) => (
        <Node key={k} value={v} path={path ? `${path}.${k}` : k} name={k} errors={errors} />
      ))}
    </div>
  );
}

export function BlockEditor({ blockKey, updatedAt, value, images, readOnly }: { blockKey: string; updatedAt: string; value: unknown; images: string[]; readOnly: boolean }) {
  const [state, onSubmit, pending] = useFormAction<BlockState>(saveBlock, {});
  const [editedAt, setEditedAt] = useState<BlockState | null>(null);
  const dirty = editedAt !== null && (editedAt === state || !state.ok);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  return (
    <form onSubmit={onSubmit} onChange={() => setEditedAt(state)} className="space-y-6">
      <input type="hidden" name="key" value={blockKey} />
      <input type="hidden" name="updatedAt" value={updatedAt} />
      <datalist id="files-images">{images.map((f) => <option key={f} value={f} />)}</datalist>
      <fieldset disabled={readOnly} className="space-y-6 rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line">
        {/* A list-shaped block (e.g. the timeline) is edited as items at the top level. */}
        <Node value={value} path="" name={Array.isArray(value) ? blockKey : ""} errors={state.errors ?? {}} />
      </fieldset>
      {!readOnly && (
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-2xl bg-canvas/95 py-3 backdrop-blur">
          <button name="mode" value="publish" className={buttonClass} disabled={pending}>
            {pending ? "Guardando…" : "Publicar cambios"}
          </button>
          <button name="mode" value="draft" className={quietButtonClass} disabled={pending}>
            Guardar borrador
          </button>
          {dirty && !pending && <span className="text-sm font-bold text-vt">Cambios sin guardar</span>}
          {state.error && <Notice>{state.error}</Notice>}
          {state.ok && <Notice tone="ok">{state.ok}</Notice>}
        </div>
      )}
    </form>
  );
}
