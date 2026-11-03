"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { renderSVG } from "uqr";
import { authClient, authErrorMessage } from "@/lib/auth/client";
import { buttonClass, Card, fieldClass, labelClass, Notice, quietButtonClass } from "./ui";

function BackupCodes({ codes }: { codes: string[] }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-soft">
        Guarde estos códigos de respaldo en un lugar seguro (por ejemplo, un gestor de contraseñas). Cada uno sirve una sola vez si pierde acceso a su
        teléfono. No se volverán a mostrar.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-4 font-mono text-sm sm:grid-cols-5">
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <button type="button" className={quietButtonClass} onClick={() => navigator.clipboard?.writeText(codes.join("\n"))}>
        Copiar códigos
      </button>
    </div>
  );
}

const PasswordField = ({ value, onChange, label = "Contraseña actual" }: { value: string; onChange: (v: string) => void; label?: string }) => (
  <label className="block">
    <span className={labelClass}>{label}</span>
    <input className={fieldClass} type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete="current-password" required />
  </label>
);

export function TwoFactorSettings({ enabled, required }: { enabled: boolean; required: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<{ uri: string; codes: string[] } | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<{ error: { code?: string; status?: number } | null } | undefined | void>) => {
    setBusy(true);
    setError("");
    setDone("");
    const result = await fn();
    setBusy(false);
    if (result?.error) setError(authErrorMessage(result.error));
    return !result?.error;
  };

  // Not enabled: confirm the password, scan the QR code, then prove it works with a first code.
  if (!enabled) {
    if (!setup) {
      return (
        <Card title="Verificación en dos pasos">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                const res = await authClient.twoFactor.enable({ password });
                if (res.data && "totpURI" in res.data) setSetup({ uri: res.data.totpURI, codes: res.data.backupCodes });
                return res;
              });
            }}
          >
            <p className="text-ink-soft">
              Además de la contraseña, el panel le pedirá un código de 6 dígitos de una aplicación de autenticación (Google Authenticator, Microsoft
              Authenticator, 1Password…).
            </p>
            <PasswordField value={password} onChange={setPassword} />
            {error && <Notice>{error}</Notice>}
            <button className={buttonClass} disabled={busy}>
              Configurar
            </button>
          </form>
        </Card>
      );
    }
    const secret = new URL(setup.uri).searchParams.get("secret") ?? "";
    return (
      <Card title="Verificación en dos pasos">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            run(async () => {
              const res = await authClient.twoFactor.verifyTotp({ code: code.replace(/\s/g, "") });
              if (!res.error) {
                router.refresh();
                if (required) router.push("/admin");
              }
              return res;
            });
          }}
        >
          <p className="text-ink-soft">1. Escanee este código con su aplicación de autenticación.</p>
          <div className="w-48 rounded-2xl bg-white p-3" dangerouslySetInnerHTML={{ __html: renderSVG(setup.uri, { border: 1 }) }} />
          <p className="text-sm text-ink-soft">
            ¿No puede escanear? Ingrese esta clave manualmente: <code className="break-all font-mono font-bold text-ink">{secret}</code>
          </p>
          <BackupCodes codes={setup.codes} />
          <label className="block max-w-xs">
            <span className={labelClass}>2. Escriba el código que muestra la aplicación</span>
            <input
              className={`${fieldClass} font-mono text-lg tracking-[0.3em]`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              required
            />
          </label>
          {error && <Notice>{error}</Notice>}
          <button className={buttonClass} disabled={busy}>
            Activar
          </button>
        </form>
      </Card>
    );
  }

  return (
    <Card title="Verificación en dos pasos">
      <div className="space-y-5">
        <Notice tone="ok">Activa. El panel le pedirá un código de su aplicación al ingresar.</Notice>
        {codes && <BackupCodes codes={codes} />}
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <PasswordField value={password} onChange={setPassword} />
          {error && <Notice>{error}</Notice>}
          {done && <Notice tone="ok">{done}</Notice>}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={quietButtonClass}
              disabled={busy || !password}
              onClick={() =>
                run(async () => {
                  const res = await authClient.twoFactor.generateBackupCodes({ password });
                  if (res.data) setCodes(res.data.backupCodes);
                  return res;
                })
              }
            >
              Generar nuevos códigos de respaldo
            </button>
            {!required && (
              <button
                type="button"
                className={quietButtonClass}
                disabled={busy || !password}
                onClick={() =>
                  run(async () => {
                    const res = await authClient.twoFactor.disable({ password });
                    if (!res.error) router.refresh();
                    return res;
                  })
                }
              >
                Desactivar
              </button>
            )}
          </div>
        </form>
      </div>
    </Card>
  );
}

export function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDone(false);
    if (next.length < 12) return setError("La nueva contraseña debe tener al menos 12 caracteres.");
    if (next !== confirm) return setError("Las contraseñas nuevas no coinciden.");
    setBusy(true);
    setError("");
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(true);
  };

  return (
    <Card title="Cambiar contraseña">
      <form onSubmit={submit} className="space-y-4">
        <PasswordField value={current} onChange={setCurrent} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Nueva contraseña</span>
            <input className={fieldClass} type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" minLength={12} required />
          </label>
          <label className="block">
            <span className={labelClass}>Repita la nueva contraseña</span>
            <input className={fieldClass} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={12} required />
          </label>
        </div>
        {error && <Notice>{error}</Notice>}
        {done && <Notice tone="ok">Contraseña cambiada. Se cerraron sus sesiones en otros dispositivos.</Notice>}
        <button className={buttonClass} disabled={busy}>
          Cambiar contraseña
        </button>
      </form>
    </Card>
  );
}
