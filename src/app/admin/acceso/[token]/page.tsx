import { Suspense } from "react";
import { AuthFrame } from "@/components/admin/ui";
import { SetPasswordForm } from "@/components/admin/AccessForms";

// One-time link from the setup or reset email. The token is read in the browser and only sent with the
// new password, so this page has no request-time work and the token is never rendered.
export const metadata = { title: "Definir contraseña", referrer: "no-referrer" as const };

export function generateStaticParams() {
  return [{ token: "_" }];
}

export default function AccessPage() {
  return (
    <AuthFrame title="Definir contraseña" lead="Use al menos 12 caracteres. Una frase de varias palabras es fácil de recordar y difícil de adivinar.">
      <Suspense>
        <SetPasswordForm />
      </Suspense>
    </AuthFrame>
  );
}
