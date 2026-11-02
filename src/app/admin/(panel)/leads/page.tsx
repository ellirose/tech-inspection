import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getServices } from "@/lib/data/content";
import { leadAssignees, listLeads, parseLeadFilters, sourceLabels, statusLabels, urgencyLabel, type LeadFilters } from "@/lib/leads/admin";
import { urgencyKeys } from "@/lib/leads/options";
import { getDictionary } from "@/i18n/dictionaries";
import { PageHead } from "@/components/admin/PageHead";
import { formatBogota } from "@/components/admin/format";
import { fieldClass, quietButtonClass, buttonClass } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/leads/StatusBadge";
import { cn } from "@/lib/cn";

export const metadata = { title: "Leads" };

/** Same filters with some values changed, as a query string. */
const withParams = (f: LeadFilters, changes: Partial<Record<keyof LeadFilters, string | number | undefined>>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...changes })) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
};

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireUser("leads:read");
  const filters = parseLeadFilters(await searchParams);
  const [{ rows, total, page, pages }, services, assignees] = await Promise.all([listLeads(filters), getServices(), leadAssignees()]);
  const serviceName = Object.fromEntries(services.map((s) => [s.slug, s.name.es]));
  const urgencies = getDictionary("es").quote.urgencies;
  const filtered = Object.entries(filters).some(([k, v]) => k !== "pagina" && v);
  const select = cn(fieldClass, "py-2 text-sm");

  return (
    <>
      <PageHead title="Leads" lead={`${total} ${filtered ? "coinciden con los filtros" : "solicitudes en total"}.`}>
        <a href={`/admin/leads/exportar${withParams(filters, { pagina: undefined })}`} className={quietButtonClass}>
          Exportar CSV
        </a>
      </PageHead>

      <form method="get" className="mb-6 grid gap-3 rounded-3xl bg-surface p-4 shadow-soft ring-1 ring-line sm:grid-cols-2 lg:grid-cols-4">
        <input name="q" defaultValue={filters.q} placeholder="Buscar nombre, empresa, correo, referencia…" className={cn(select, "sm:col-span-2")} />
        <select name="estado" defaultValue={filters.estado ?? ""} className={select} aria-label="Estado">
          <option value="">Todos los estados</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="fuente" defaultValue={filters.fuente ?? ""} className={select} aria-label="Fuente">
          <option value="">Todas las fuentes</option>
          {Object.entries(sourceLabels).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="servicio" defaultValue={filters.servicio ?? ""} className={select} aria-label="Servicio">
          <option value="">Todos los servicios</option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name.es}
            </option>
          ))}
        </select>
        <select name="urgencia" defaultValue={filters.urgencia ?? ""} className={select} aria-label="Prioridad">
          <option value="">Todas las prioridades</option>
          {urgencyKeys.map((k, i) => (
            <option key={k} value={k}>
              {urgencies[i]}
            </option>
          ))}
        </select>
        <select name="asignado" defaultValue={filters.asignado ?? ""} className={select} aria-label="Asignado a">
          <option value="">Cualquier responsable</option>
          <option value="ninguno">Sin asignar</option>
          {assignees.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-mute">
          Desde <input type="date" name="desde" defaultValue={filters.desde} className={select} />
        </label>
        <label className="flex items-center gap-2 text-sm text-mute">
          Hasta <input type="date" name="hasta" defaultValue={filters.hasta} className={select} />
        </label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-2 lg:justify-end">
          <button className={cn(buttonClass, "h-10")}>Filtrar</button>
          {filtered && (
            <Link href="/admin/leads" className={cn(quietButtonClass, "h-10")}>
              Limpiar
            </Link>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        <table className="w-full min-w-[56rem] text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              {["Recibido", "Referencia", "Solicitante", "Servicios", "Prioridad", "Fuente", "Estado", "Responsable"].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-2">
                <td className="whitespace-nowrap px-4 py-3 text-ink-soft">{formatBogota(r.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/leads/${r.reference}`} className="font-mono font-bold text-accent">
                    {r.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="block font-bold text-ink">{r.name}</span>
                  {r.company && <span className="block text-mute">{r.company}</span>}
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.services.map((s) => serviceName[s] ?? s).join(", ") || <span className="italic">{r.description?.slice(0, 60)}</span>}</td>
                <td className={cn("px-4 py-3", r.urgency === "urgent" && "font-bold text-pt")}>{urgencyLabel(r.urgency)}</td>
                <td className="px-4 py-3 text-ink-soft">{sourceLabels[r.source]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-ink-soft">{r.assignee ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-mute">
                  {filtered ? "Ningún lead coincide con los filtros." : "Todavía no hay solicitudes."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={`/admin/leads${withParams(filters, { pagina: page - 1 })}`} className={quietButtonClass}>
              Anterior
            </Link>
          )}
          <span className="text-mute">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link href={`/admin/leads${withParams(filters, { pagina: page + 1 })}`} className={quietButtonClass}>
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
