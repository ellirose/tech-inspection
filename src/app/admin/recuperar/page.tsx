import { AuthFrame } from "@/components/admin/ui";
import { RecoverForm } from "@/components/admin/AccessForms";

export const metadata = { title: "Recuperar acceso" };

export default function RecoverPage() {
  return (
    <AuthFrame title="Recuperar acceso" lead="Le enviaremos un enlace para definir una nueva contraseña.">
      <RecoverForm />
    </AuthFrame>
  );
}
