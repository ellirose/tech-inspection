import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { blockInfo } from "@/lib/admin/blocks";
import { PageHead } from "@/components/admin/PageHead";
import { formatBogota } from "@/components/admin/format";

export const metadata = { title: "Secciones de página" };

export default async function BlocksPage() {
  await requireUser("content:read");
  const rows = await db.select({ key: schema.pageBlock.key, updatedAt: schema.pageBlock.updatedAt }).from(schema.pageBlock);
  const updated = Object.fromEntries(rows.map((r) => [r.key, r.updatedAt]));
  return (
    <div className="max-w-5xl">
      <Link href="/admin/contenido" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Contenido
      </Link>
      <PageHead title="Secciones de página" lead="Textos de las secciones fijas del sitio, en los tres idiomas. La estructura de cada sección no cambia: solo sus textos, cifras e imágenes." />
      <ul className="divide-y divide-line rounded-3xl bg-surface shadow-soft ring-1 ring-line">
        {Object.entries(blockInfo)
          .filter(([key]) => updated[key])
          .map(([key, info]) => (
            <li key={key}>
              <Link href={`/admin/contenido/paginas/${key}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-4 hover:bg-surface-2">
                <span>
                  <span className="block font-bold text-ink">{info.label}</span>
                  <span className="block text-sm text-mute">{info.where}</span>
                </span>
                <span className="text-xs text-mute">Modificada {formatBogota(updated[key])}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
