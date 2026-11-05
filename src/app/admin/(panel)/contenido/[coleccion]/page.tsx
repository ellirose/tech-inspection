import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { db } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { findCollection } from "@/lib/admin/collections";
import { PageHead } from "@/components/admin/PageHead";
import { buttonClass, Notice } from "@/components/admin/ui";
import { MoveButtons } from "@/components/admin/content/RowActions";
import { cn } from "@/lib/cn";

export const metadata = { title: "Contenido" };

export default async function CollectionPage({ params, searchParams }: PageProps<"/admin/contenido/[coleccion]">) {
  const user = await requireUser("content:read");
  const { coleccion } = await params;
  const c = findCollection(coleccion);
  if (!c) notFound();
  const t = c.table as unknown as PgTable & { sortOrder: PgColumn; id: PgColumn };
  const rows = (await db.select().from(t).orderBy(asc(t.sortOrder), asc(t.id))) as (Record<string, unknown> & { id: string; status: string })[];
  const write = can(user.role, "content:write");
  const deleted = (await searchParams).eliminado;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/contenido" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Contenido
      </Link>
      <PageHead title={c.label} lead={c.lead}>
        {write && c.canCreate && (
          <Link href={`/admin/contenido/${c.key}/nuevo`} className={buttonClass}>
            {c.feminine ? "Nueva" : "Nuevo"} {c.singular}
          </Link>
        )}
      </PageHead>
      {deleted && (
        <div className="mb-4">
          <Notice tone="ok">Eliminado.</Notice>
        </div>
      )}
      <ul className="divide-y divide-line rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        {rows.map((row, i) => (
          <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
            {write && <MoveButtons collection={c.key} id={row.id} first={i === 0} last={i === rows.length - 1} />}
            <Link href={`/admin/contenido/${c.key}/${row.id}`} className="min-w-0 flex-1">
              <span className="block truncate font-bold text-ink hover:text-accent">{c.title(row)}</span>
              {c.detail && <span className="block truncate text-sm text-mute">{c.detail(row)}</span>}
            </Link>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-bold",
                row.status === "published" ? "bg-lime/20 text-lime-deep dark:text-lime" : "bg-surface-2 text-mute ring-1 ring-inset ring-line",
              )}
            >
              {row.status === "published" ? "Publicado" : "Borrador"}
            </span>
          </li>
        ))}
        {rows.length === 0 && <li className="px-4 py-8 text-center text-mute">Todavía no hay elementos.</li>}
      </ul>
    </div>
  );
}
