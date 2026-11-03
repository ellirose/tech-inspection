import { requireUser } from "@/lib/auth/session";
import { requiresTwoFactor } from "@/lib/auth/roles";
import { PageHead } from "@/components/admin/PageHead";
import { ChangePassword, TwoFactorSettings } from "@/components/admin/SecurityForms";
import { Notice } from "@/components/admin/ui";

export const metadata = { title: "Seguridad" };

export default async function SecurityPage() {
  // Reachable before two-factor is on: this is where super-admins are sent to turn it on.
  const user = await requireUser(undefined, { allowMissingTwoFactor: true });
  const required = requiresTwoFactor(user.role);
  const enabled = Boolean(user.twoFactorEnabled);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHead title="Seguridad" lead="Su contraseña y la verificación en dos pasos." />
      {required && !enabled && (
        <Notice tone="info">Su rol exige la verificación en dos pasos. Actívela para usar el resto del panel.</Notice>
      )}
      <TwoFactorSettings enabled={enabled} required={required} />
      <ChangePassword />
    </div>
  );
}
