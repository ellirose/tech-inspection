import Link from "next/link";
import { expiringCertifications } from "@/lib/admin/expiry";

export async function ExpiryWarnings() {
  const rows = await expiringCertifications();
  if (!rows.length) return null;
  return (
    <div role="status" className="rounded-3xl bg-vt/15 p-5 ring-1 ring-inset ring-vt/40">
      <p className="font-extrabold text-ink">Certificaciones por vencer</p>
      <ul className="mt-2 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/admin/contenido/certificaciones/${r.id}`} className="font-bold text-accent">
              {r.code} · {r.title.es}
            </Link>{" "}
            <span className={r.expired ? "font-bold text-pt" : "text-ink-soft"}>{r.expired ? `venció el ${r.expiryDate} y ya no se muestra en el sitio` : `vence el ${r.expiryDate}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
