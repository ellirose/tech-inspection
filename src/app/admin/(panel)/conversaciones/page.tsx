import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { listConversations, recentUsage } from "@/lib/chat/admin";
import { PageHead } from "@/components/admin/PageHead";
import { formatBogota } from "@/components/admin/format";
import { quietButtonClass } from "@/components/admin/ui";

export const metadata = { title: "Conversaciones" };

const number = new Intl.NumberFormat("es-CO");

export default async function ConversationsPage({ searchParams }: PageProps<"/admin/conversaciones">) {
  await requireUser("leads:read");
  const requested = Number((await searchParams).pagina);
  const [{ rows, total, page, pages }, usage] = await Promise.all([listConversations(Number.isInteger(requested) && requested > 0 ? requested : 1), recentUsage()]);
  const retention = Number(process.env.CHAT_RETENTION_DAYS) || 90;

  return (
    <>
      <PageHead
        title="Conversaciones"
        lead={`Lo que los visitantes hablaron con el asistente del sitio, para revisar la calidad de sus respuestas. ${total} conversaciones; se eliminan a los ${retention} días.`}
      />
      <p className="mb-6 text-sm text-ink-soft">
        Últimos 30 días: {number.format(usage.conversations)} conversaciones · {number.format(usage.input)} tokens de entrada, {number.format(usage.cached)} leídos de caché, {number.format(usage.output)} de salida.
      </p>

      <div className="overflow-x-auto rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-line text-mute">
            <tr>
              {["Última actividad", "Primer mensaje", "Mensajes", "Idioma", "Lead", "Tokens"].map((h) => (
                <th key={h} className="px-4 py-3 font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-surface-2">
                <td className="whitespace-nowrap px-4 py-3">
                  <Link href={`/admin/conversaciones/${r.id}`} className="font-bold text-accent">
                    {formatBogota(r.updatedAt)}
                  </Link>
                </td>
                <td className="max-w-md truncate px-4 py-3 text-ink-soft">{r.firstMessage ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">{r.visitorTurns}</td>
                <td className="px-4 py-3 text-ink-soft">{r.lang.toUpperCase()}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {r.leadReference ? (
                    <Link href={`/admin/leads/${r.leadReference}`} className="font-mono font-bold text-accent">
                      {r.leadReference}
                    </Link>
                  ) : (
                    <span className="text-mute">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-soft">{number.format(r.tokens)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-mute">
                  Todavía no hay conversaciones.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="Páginas" className="mt-5 flex items-center justify-center gap-3 text-sm">
          {page > 1 && (
            <Link href={`/admin/conversaciones?pagina=${page - 1}`} className={quietButtonClass}>
              Anterior
            </Link>
          )}
          <span className="text-mute">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link href={`/admin/conversaciones?pagina=${page + 1}`} className={quietButtonClass}>
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
