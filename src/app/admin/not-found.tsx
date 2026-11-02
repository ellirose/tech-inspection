import Link from "next/link";
import { AuthFrame } from "@/components/admin/ui";

// Also shown when a role opens a section it has no access to, so the section's existence is not revealed.
export default function AdminNotFound() {
  return (
    <AuthFrame title="Página no encontrada" lead="La sección no existe o su rol no tiene acceso a ella.">
      <Link href="/admin" className="font-bold text-accent">
        Volver al inicio del panel
      </Link>
    </AuthFrame>
  );
}
