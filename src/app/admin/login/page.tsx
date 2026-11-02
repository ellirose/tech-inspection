import { Suspense } from "react";
import { AuthFrame } from "@/components/admin/ui";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Ingresar" };

export default function LoginPage() {
  return (
    <AuthFrame title="Ingresar al panel" lead="Acceso para el equipo de Tech-Inspection.">
      {/* The form reads ?next= from the URL, which is only known in the browser. */}
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  );
}
