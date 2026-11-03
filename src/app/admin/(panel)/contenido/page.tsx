import Link from "next/link";
import { count, eq } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { collections } from "@/lib/admin/collections";
import { PageHead } from "@/components/admin/PageHead";
import { ExpiryWarnings } from "@/components/admin/content/ExpiryWarnings";

export const metadata = { title: "Contenido" };

export default async function ContentPage() {
  const user = await requireUser("content:read");
  const counts = await Promise.all(
    collections.map(async (c) => {
      const t = c.table as unknown as PgTable & { status: PgColumn };
      const [[all], [drafts]] = await Promise.all([db.select({ n: count() }).from(t), db.select({ n: count() }).from(t).where(eq(t.status, "draft"))]);
      return { all: all.n, drafts: drafts.n };
    }),
  );

  return (
    <div className="max-w-5xl space-y-6">
      <PageHead title="Contenido" lead={can(user.role, "content:write") ? "Lo que se publica en el sitio. Los cambios guardados en elementos publicados se ven de inmediato." : "Solo lectura para su rol."} />
      <ExpiryWarnings />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/contenido/paginas" className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line transition hover:ring-accent/50">
          <p className="text-lg font-extrabold text-ink">Secciones de página</p>
          <p className="mt-1 text-sm text-ink-soft">Textos de la portada y de las secciones fijas: encabezado, trayectoria, proceso, normas, TI-QMS…</p>
        </Link>
        {collections.map((c, i) => (
          <Link key={c.key} href={`/admin/contenido/${c.key}`} className="rounded-3xl bg-surface p-6 shadow-soft ring-1 ring-line transition hover:ring-accent/50">
            <p className="text-lg font-extrabold text-ink">{c.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{c.lead}</p>
            <p className="mt-3 text-sm font-bold text-mute">
              {counts[i].all} elementos{counts[i].drafts ? ` · ${counts[i].drafts} borradores` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
