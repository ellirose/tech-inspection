"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { UploadResponse } from "@/app/api/admin/media/route";
import { buttonClass, fieldClass, labelClass, Notice } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { CopyPath } from "./CopyPath";

/** Upload form. Sends the file to /api/admin/media and adds it to the library below. */
export function MediaUpload() {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [pdf, setPdf] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: new FormData(e.currentTarget) });
      const body = (await res.json().catch(() => ({ ok: false, error: "El archivo es demasiado grande o la conexión falló." }))) as UploadResponse;
      setResult(body);
      if (body.ok) {
        form.current?.reset();
        setPdf(false);
        router.refresh();
      }
    } catch {
      setResult({ ok: false, error: "No se pudo subir el archivo. Revise la conexión e inténtelo de nuevo." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={form} onSubmit={onSubmit} className="space-y-3">
      <label className="block">
        <span className={labelClass}>Archivo</span>
        <input
          type="file"
          name="file"
          required
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(e) => setPdf(e.currentTarget.files?.[0]?.type === "application/pdf")}
          className={cn(fieldClass, "text-sm file:mr-3 file:rounded-full file:border-0 file:bg-tint file:px-3 file:py-1 file:font-bold file:text-accent-ink")}
        />
        <span className="mt-1 block text-xs text-mute">JPG, PNG o WebP hasta 15 MB (se reducen a 2400 px y se guardan en WebP), o PDF hasta 20 MB.</span>
      </label>
      <label className="block">
        <span className={labelClass}>Texto alternativo {pdf ? "(opcional)" : ""}</span>
        <input name="alt" required={!pdf} minLength={pdf ? undefined : 3} maxLength={200} placeholder="Ej.: Inspector midiendo una broca PDC con ultrasonido" className={fieldClass} />
        <span className="mt-1 block text-xs text-mute">Qué muestra la imagen, en español, para quien no puede verla.</span>
      </label>
      <label className="block">
        <span className={labelClass}>Nota interna (opcional)</span>
        <input name="caption" maxLength={300} className={fieldClass} />
      </label>
      {result && !result.ok && <Notice>{result.error}</Notice>}
      {result?.ok && (
        <div className="space-y-2">
          <Notice tone="ok">Archivo subido. Use esta ruta en el contenido:</Notice>
          <CopyPath path={result.url} />
        </div>
      )}
      <button className={cn(buttonClass, "h-10 px-4 text-sm")} disabled={pending}>
        {pending ? "Subiendo…" : "Subir"}
      </button>
    </form>
  );
}
