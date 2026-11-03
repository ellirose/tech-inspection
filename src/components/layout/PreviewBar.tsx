"use client";

import { usePathname } from "next/navigation";
import { exitPreview } from "./preview-actions";

/** Shown while an editor previews drafts (only admins reach this mode, so it is in Spanish only). */
export function PreviewBar() {
  const path = usePathname();
  return (
    <div role="status" className="fixed bottom-5 left-4 z-[60] flex max-w-[calc(100vw-7rem)] flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-vt px-4 py-3 text-sm font-semibold text-brand-950 shadow-float sm:bottom-6 sm:left-6">
      <span>Vista previa: incluye borradores y solo usted la ve.</span>
      <form action={exitPreview}>
        <input type="hidden" name="path" value={path} />
        <button className="rounded-full bg-brand-950 px-3 py-1.5 text-xs font-bold text-white">Salir de la vista previa</button>
      </form>
    </div>
  );
}
