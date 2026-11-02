import { count } from "drizzle-orm";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { PageHead, Upcoming } from "@/components/admin/PageHead";

export const metadata = { title: "Leads" };

export default async function LeadsPage() {
  await requireUser("leads:read");
  const [{ n }] = await db.select({ n: count() }).from(schema.lead);
  return (
    <>
      <PageHead title="Leads" lead={`${n} solicitudes registradas.`} />
      <Upcoming>La bandeja con filtros, detalle, estados, notas, asignación y exportación llega en la etapa 4. Mientras tanto: npm run leads:export.</Upcoming>
    </>
  );
}
