import Link from "next/link";
import { asc, desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { PageHead } from "@/components/admin/PageHead";
import { ActionForm } from "@/components/admin/ActionForm";
import { Card, fieldClass, labelClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { createRedirect, deleteRedirect, dismissNotFound, toggleRedirect } from "./actions";

export const metadata = { title: "Redirecciones" };

const when = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

export default async function RedirectsPage({ searchParams }: PageProps<"/admin/redirecciones">) {
  await requireUser("settings:manage");
  const [rows, missing, { desde }] = await Promise.all([
    db.select().from(schema.redirect).orderBy(asc(schema.redirect.fromPath)),
    db.select().from(schema.notFoundHit).orderBy(desc(schema.notFoundHit.hits), desc(schema.notFoundHit.lastSeen)).limit(100),
    searchParams,
  ]);
  const from = typeof desde === "string" ? desde.slice(0, 300) : undefined;

  return (
    <>
      <PageHead title="Redirecciones" lead="Envían direcciones antiguas (por ejemplo, las del sitio en Wix) a su página nueva, para no perder enlaces ni posiciones en Google. Los cambios se aplican en menos de un minuto." />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-line text-mute">
              <tr>
                {["Desde", "Hacia", "Tipo", "Estado", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.id} className={cn(!r.active && "opacity-60")}>
                  <td className="break-all px-4 py-3 font-mono text-xs text-ink">{r.fromPath}</td>
                  <td className="break-all px-4 py-3 font-mono text-xs text-ink-soft">{r.toPath}</td>
                  <td className="px-4 py-3 text-ink-soft">{r.statusCode === 301 || r.statusCode === 308 ? "Permanente" : "Temporal"}</td>
                  <td className="px-4 py-3 font-bold">{r.active ? "Activa" : "Inactiva"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <ActionForm action={toggleRedirect} hidden={{ id: r.id }} submit={r.active ? "Desactivar" : "Activar"} quiet className="contents" />
                      <ActionForm action={deleteRedirect} hidden={{ id: r.id }} submit="Eliminar" quiet confirm={`¿Eliminar la redirección de ${r.fromPath}?`} className="contents" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Card title="Nueva redirección">
          <ActionForm action={createRedirect} submit="Crear">
            <label className="block">
              <span className={labelClass}>Desde</span>
              <input name="from" required defaultValue={from} key={from} placeholder="/ruta-antigua" className={cn(fieldClass, "font-mono text-sm")} />
            </label>
            <label className="block">
              <span className={labelClass}>Hacia</span>
              <input name="to" required placeholder="/es/servicios/tuberia" className={cn(fieldClass, "font-mono text-sm")} />
            </label>
            <label className="block">
              <span className={labelClass}>Tipo</span>
              <select name="statusCode" defaultValue="308" className={fieldClass}>
                <option value="308">Permanente (la página se movió para siempre)</option>
                <option value="307">Temporal</option>
              </select>
            </label>
          </ActionForm>
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="text-xl font-extrabold text-ink">Direcciones no encontradas</h2>
        <p className="mt-1 max-w-3xl text-ink-soft">
          Direcciones que alguien abrió y que no existen (por ejemplo, enlaces viejos de Wix guardados o en Google). Si alguna tiene una página equivalente, créele una redirección. Se borran solas tras 90 días sin visitas.
        </p>
        {missing.length === 0 ? (
          <p className="mt-4 rounded-3xl bg-surface p-5 text-ink-soft ring-1 ring-line">Ninguna por ahora.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-line text-mute">
                <tr>
                  {["Dirección", "Visitas", "Última vez", "Llegó desde", ""].map((h, i) => (
                    <th key={i} className="px-4 py-3 font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {missing.map((m) => (
                  <tr key={m.path}>
                    <td className="break-all px-4 py-3 font-mono text-xs text-ink">{m.path}</td>
                    <td className="px-4 py-3 font-bold text-ink">{m.hits}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{when.format(m.lastSeen)}</td>
                    <td className="break-all px-4 py-3 text-ink-soft">{m.referrer ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/redirecciones?desde=${encodeURIComponent(m.path)}`} scroll={false} className="rounded-full bg-surface-2 px-3 py-1.5 text-sm font-bold text-ink ring-1 ring-line hover:ring-neon/40">
                          Redirigir
                        </Link>
                        <ActionForm action={dismissNotFound} hidden={{ path: m.path }} submit="Descartar" quiet className="contents" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
