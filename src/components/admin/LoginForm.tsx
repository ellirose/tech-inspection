"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authClient, authErrorMessage } from "@/lib/auth/client";
import { buttonClass, fieldClass, labelClass, Notice } from "./ui";

/** Only paths inside the panel, so the login page cannot be used to send people elsewhere. */
const safeNext = (value: string | null) => (value && /^\/admin(\/|$)/.test(value) && !value.startsWith("//") ? value : "/admin");

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [step, setStep] = useState<"password" | "code">("password");
  const [backup, setBackup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const done = () => {
    router.replace(next);
    router.refresh();
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { data, error } = await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (error) return setError(authErrorMessage(error));
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) return setStep("code");
    done();
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const value = code.replace(/\s/g, "");
    const { error } = backup ? await authClient.twoFactor.verifyBackupCode({ code: value }) : await authClient.twoFactor.verifyTotp({ code: value });
    setBusy(false);
    if (error) {
      if (error.code === "INVALID_TWO_FACTOR_COOKIE") setStep("password");
      return setError(authErrorMessage(error));
    }
    done();
  };

  if (step === "code") {
    return (
      <form onSubmit={verify} className="space-y-5">
        <label className="block">
          <span className={labelClass}>{backup ? "Código de respaldo" : "Código de su aplicación de autenticación"}</span>
          <input
            className={`${fieldClass} font-mono text-lg tracking-[0.3em]`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode={backup ? "text" : "numeric"}
            autoComplete="one-time-code"
            autoFocus
            required
          />
        </label>
        {error && <Notice>{error}</Notice>}
        <button className={`${buttonClass} w-full`} disabled={busy}>
          {busy ? "Verificando…" : "Verificar"}
        </button>
        <button
          type="button"
          className="w-full text-sm font-bold text-accent"
          onClick={() => {
            setBackup((b) => !b);
            setCode("");
            setError("");
          }}
        >
          {backup ? "Usar el código de la aplicación" : "¿Sin acceso a su teléfono? Use un código de respaldo"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={signIn} className="space-y-5">
      <label className="block">
        <span className={labelClass}>Correo</span>
        <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required />
      </label>
      <label className="block">
        <span className={labelClass}>Contraseña</span>
        <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
      </label>
      {error && <Notice>{error}</Notice>}
      <button className={`${buttonClass} w-full`} disabled={busy}>
        {busy ? "Ingresando…" : "Ingresar"}
      </button>
      <p className="text-center text-sm">
        <Link href="/admin/recuperar" className="font-bold text-accent">
          ¿Olvidó su contraseña?
        </Link>
      </p>
    </form>
  );
}
