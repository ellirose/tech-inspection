import Image from "next/image";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { listMedia } from "@/lib/admin/media";
import { PageHead } from "@/components/admin/PageHead";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, fieldClass, labelClass } from "@/components/admin/ui";
import { formatBogota } from "@/components/admin/format";
import { CopyPath } from "@/components/admin/media/CopyPath";
import { MediaUpload } from "@/components/admin/media/MediaUpload";
import { cn } from "@/lib/cn";
import { deleteMedia, updateMedia } from "./actions";

export const metadata = { title: "Medios" };

const size = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default async function MediaPage() {
  const user = await requireUser("content:read");
  const write = can(user.role, "media:write");
  const rows = await listMedia();
  const images = rows.filter((r) => r.mime.startsWith("image/"));
  const videos = rows.filter((r) => r.mime.startsWith("video/"));
  const docs = rows.filter((r) => !r.mime.startsWith("image/") && !r.mime.startsWith("video/"));

  const item = (r: (typeof rows)[number]) => (
    <li key={r.id} className="flex flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
      {r.width && r.height ? (
        <div className="relative aspect-[4/3] bg-surface-2">
          <Image src={r.url} alt={r.alt ?? ""} fill sizes="(min-width:1280px) 18rem, (min-width:640px) 45vw, 100vw" className="object-contain" />
        </div>
      ) : r.mime.startsWith("video/") ? (
        <video src={r.url} muted playsInline controls preload="metadata" className="aspect-[4/3] w-full bg-surface-2 object-contain" />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-surface-2 font-mono text-sm font-bold text-mute">PDF</div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="truncate text-sm font-bold text-ink" title={r.originalName ?? undefined}>
            {r.originalName ?? r.url.split("/").pop()}
          </p>
          <p className="text-xs text-mute">
            {size(r.sizeBytes)}
            {r.width && r.height ? ` · ${r.width}×${r.height}` : ""} · {formatBogota(r.createdAt)}
          </p>
        </div>
        <CopyPath path={r.url} />
        {write ? (
          <details className="text-sm">
            <summary className="cursor-pointer font-bold text-accent">Descripción y eliminar</summary>
            <div className="mt-3 space-y-3">
              <ActionForm action={updateMedia} hidden={{ id: r.id }} submit="Guardar" quiet>
                <label className="block">
                  <span className={labelClass}>Texto alternativo</span>
                  <input name="alt" defaultValue={r.alt ?? ""} maxLength={200} className={cn(fieldClass, "text-sm")} />
                </label>
                <label className="block">
                  <span className={labelClass}>Nota interna</span>
                  <input name="caption" defaultValue={r.caption ?? ""} maxLength={300} className={cn(fieldClass, "text-sm")} />
                </label>
              </ActionForm>
              <ActionForm action={deleteMedia} hidden={{ id: r.id }} submit="Eliminar" quiet confirm="¿Eliminar este archivo definitivamente? Solo se puede si no se usa en ningún contenido." />
            </div>
          </details>
        ) : (
          r.alt && <p className="text-sm text-ink-soft">{r.alt}</p>
        )}
      </div>
    </li>
  );

  return (
    <>
      <PageHead title="Medios" lead="Imágenes, videos y PDF subidos para el sitio. Copie la ruta de un archivo y péguela en el campo de imagen, galería, video o documento del contenido." />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-8">
          {rows.length === 0 && <p className="text-ink-soft">Todavía no hay archivos subidos. Las fotos del sitio original siguen disponibles en los campos del contenido.</p>}
          {images.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-extrabold text-ink">Imágenes ({images.length})</h2>
              <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{images.map(item)}</ul>
            </section>
          )}
          {videos.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-extrabold text-ink">Videos ({videos.length})</h2>
              <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{videos.map(item)}</ul>
            </section>
          )}
          {docs.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-extrabold text-ink">Documentos ({docs.length})</h2>
              <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{docs.map(item)}</ul>
            </section>
          )}
        </div>
        {write && (
          <Card title="Subir archivo" className="xl:sticky xl:top-6 xl:self-start">
            <MediaUpload />
          </Card>
        )}
      </div>
    </>
  );
}
