import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/roles";
import { blockInfo } from "@/lib/admin/blocks";
import { publicFiles } from "@/lib/admin/files";
import { Notice } from "@/components/admin/ui";
import { BlockEditor } from "@/components/admin/content/BlockEditor";

export const metadata = { title: "Editar sección" };

export default async function BlockPage({ params }: PageProps<"/admin/contenido/paginas/[key]">) {
  const user = await requireUser("content:read");
  const { key } = await params;
  const info = blockInfo[key];
  if (!info) notFound();
  const [row] = await db.select().from(schema.pageBlock).where(eq(schema.pageBlock.key, key));
  if (!row) notFound();
  const write = can(user.role, "content:write");

  return (
    <div className="max-w-6xl">
      <Link href="/admin/contenido/paginas" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
        <ArrowLeft weight="bold" className="size-4" /> Secciones de página
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{info.label}</h1>
          <p className="mt-1 text-ink-soft">Aparece en: {info.where}</p>
        </div>
        <a href={`/es${info.pages[0]}`} target="_blank" rel="noopener" className="text-sm font-bold text-accent">
          Ver en el sitio ↗
        </a>
      </div>
      {!write && (
        <div className="mb-5">
          <Notice tone="info">Solo lectura para su rol.</Notice>
        </div>
      )}
      <BlockEditor blockKey={key} updatedAt={row.updatedAt.toISOString()} value={row.data} images={publicFiles().images} readOnly={!write} />
    </div>
  );
}
