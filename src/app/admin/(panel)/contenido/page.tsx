import { count } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { PageHead, Upcoming } from "@/components/admin/PageHead";
import { Card } from "@/components/admin/ui";

export const metadata = { title: "Contenido" };

const tables = [
  ["Servicios", schema.service],
  ["Métodos", schema.method],
  ["Clientes", schema.client],
  ["Cifras", schema.stat],
  ["Certificaciones", schema.certification],
  ["Documentos y políticas", schema.companyDocument],
  ["Equipo directivo", schema.teamMember],
  ["Bloques de página", schema.pageBlock],
] as const;

export default async function ContentPage() {
  const user = await requireUser("content:read");
  const counts = await Promise.all(tables.map(([, t]) => db.select({ n: count() }).from(t).then(([r]) => r.n)));
  return (
    <>
      <PageHead title="Contenido" lead={can(user.role, "content:write") ? "Lo que se publica en el sitio." : "Solo lectura para su rol."} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map(([label], i) => (
          <Card key={label}>
            <p className="text-sm font-bold text-mute">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-ink">{counts[i]}</p>
          </Card>
        ))}
      </div>
      <Upcoming>La edición, borradores, vista previa y publicación llegan en la etapa 4.</Upcoming>
    </>
  );
}
