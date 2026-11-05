import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { z } from "zod";
import { db, schema } from "@/db";
import type { PendingChanges } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { findCollection } from "@/lib/admin/collections";
import { publicFiles } from "@/lib/admin/files";
import { refOptions, type RefOption } from "@/lib/admin/refs";
import { Card, Notice } from "@/components/admin/ui";
import { formatBogota } from "@/components/admin/format";
import { ContentEditor } from "@/components/admin/content/ContentEditor";
import { DeleteButton, DiscardDraftButton, StatusButton } from "@/components/admin/content/RowActions";

export const metadata = { title: "Editar contenido" };

/** Opens a public page in preview, so a draft shows where it will appear. */
const previewHref = (path: string) => `/admin/vista-previa?ruta=${encodeURIComponent(path)}`;

/** Public page where the item appears, to check it after publishing. */
const publicPath = (collection: string, row: Record<string, unknown>) =>
  ({
    servicios: `/es/servicios/${row.slug}`,
    metodos: `/es/metodos/${row.slug}`,
    clientes: "/es",
    cifras: "/es",
    certificaciones: "/es/hseq",
    documentos: "/es/hseq",
    equipo: "/es/nosotros",
    canales: "/es/contacto",
    preguntas: "/es/preguntas-frecuentes",
    industrias: `/es/industrias/${row.slug}`,
    casos: `/es/clientes/${row.slug}`,
  })[collection];

export default async function EditContentPage({ params, searchParams }: PageProps<"/admin/contenido/[coleccion]/[id]">) {
  const user = await requireUser("content:read");
  const { coleccion, id } = await params;
  const c = findCollection(coleccion);
  if (!c) notFound();
  const creating = id === "nuevo";
  const write = can(user.role, "content:write");
  if (creating && (!c.canCreate || !write)) notFound();
  if (!creating && !z.uuid().safeParse(id).success) notFound();

  const t = c.table as unknown as PgTable & { id: PgColumn };
  const row = creating ? null : ((await db.select().from(t).where(eq(t.id, id)))[0] as (Record<string, unknown> & { id: string; status: string; pending: PendingChanges | null; updatedAt: Date }) | undefined);
  if (!creating && !row) notFound();

  // A draft saved on a published item is what the editor continues from.
  const draft = row?.pending ?? null;
  const values: Record<string, unknown> = { ...row, ...(draft?.values ?? {}) };
  const hasMethods = c.fields.some((f) => f.type === "methods");
  let methods = hasMethods ? (await db.select({ id: schema.method.id, code: schema.method.code, name: schema.method.name }).from(schema.method).orderBy(asc(schema.method.sortOrder))).map((m) => ({ id: m.id, label: `${m.code} · ${m.name.es}` })) : [];
  if (hasMethods && row) {
    const linked = (await db.select({ id: schema.serviceMethod.methodId }).from(schema.serviceMethod).where(eq(schema.serviceMethod.serviceId, row.id)).orderBy(asc(schema.serviceMethod.sortOrder))).map((r) => r.id);
    const chosen = draft?.methodIds ?? linked;
    values.methods = chosen;
    // Linked methods first, in the service's own order (the order the form submits them in), then the rest.
    methods = [...chosen.map((id) => methods.find((m) => m.id === id)!).filter(Boolean), ...methods.filter((m) => !chosen.includes(m.id))];
  }
  const refs: Record<string, RefOption[]> = {};
  for (const f of c.fields) if (f.type === "refs") refs[f.name] = await refOptions(f.source);
  // Only plain data crosses to the browser form.
  const plain = JSON.parse(JSON.stringify(values)) as Record<string, unknown>;
  const created = (await searchParams).creado;
  const title = row ? c.title(row) : `${c.feminine ? "Nueva" : "Nuevo"} ${c.singular}`;
  const href = row && publicPath(c.key, row);

  return (
    <div className="max-w-6xl">
      <Link href={`/admin/contenido/${c.key}`} className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> {c.label}
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
      {created && (
        <div className="mb-5">
          <Notice tone="ok">Borrador creado. Revíselo y publíquelo cuando esté listo.</Notice>
        </div>
      )}
      {!write && (
        <div className="mb-5">
          <Notice tone="info">Solo lectura para su rol.</Notice>
        </div>
      )}
      {draft && (
        <div className="mb-5">
          <Notice tone="info">
            Este formulario muestra un borrador guardado el {formatBogota(new Date(draft.at))}. El sitio sigue mostrando la versión publicada hasta que pulse «Publicar cambios».
          </Notice>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
        <ContentEditor
          key={row ? row.updatedAt.toISOString() : "nuevo"}
          published={row?.status === "published"}
          collection={c.key}
          id={row?.id ?? null}
          updatedAt={row ? row.updatedAt.toISOString() : null}
          fields={c.fields}
          values={plain}
          files={await publicFiles()}
          methods={methods}
          refs={refs}
          readOnly={!write}
        />
        {row && (
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <Card title="Publicación">
              <p className="mb-3 text-sm text-ink-soft">
                {row.status === "published" ? "Visible en el sitio." : "Borrador: no aparece en el sitio."}
                <br />
                <span className="text-mute">Última modificación: {formatBogota(row.updatedAt)}</span>
              </p>
              {write && <StatusButton collection={c.key} id={row.id} published={row.status === "published"} />}
              {href && (
                <a href={row.status === "published" ? href : previewHref(href)} target="_blank" rel="noopener" className="mt-3 block text-sm font-bold text-accent">
                  {row.status === "published" ? "Ver en el sitio ↗" : "Vista previa ↗"}
                </a>
              )}
              {href && row.status !== "published" && <p className="mt-1 text-xs text-mute">Muestra la última versión guardada, con los borradores; solo la ven quienes entran al panel.</p>}
            </Card>
            {draft && (
              <Card title="Borrador sin publicar">
                <p className="mb-3 text-sm text-ink-soft">Guardado el {formatBogota(new Date(draft.at))}. Solo lo ven quienes entran al panel.</p>
                {href && (
                  <a href={previewHref(href)} target="_blank" rel="noopener" className="mb-3 block text-sm font-bold text-accent">
                    Vista previa del borrador ↗
                  </a>
                )}
                {write && <DiscardDraftButton collection={c.key} id={row.id} />}
              </Card>
            )}
            {c.canDelete && can(user.role, "content:delete") && (
              <Card title="Eliminar">
                <DeleteButton collection={c.key} id={row.id} title={title} />
              </Card>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
