"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { authClient, authErrorMessage } from "@/lib/auth/client";
import { buttonClass, fieldClass, labelClass, Notice } from "./ui";

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("busy");
    setError("");
    const { error } = await authClient.requestPasswordReset({ email: email.trim() });
    if (error && error.status === 429) {
      setState("idle");
      return setError(authErrorMessage(error));
    }
    // Same answer whether or not the address has an account.
    setState("sent");
  };

  if (state === "sent") {
    return (
      <div className="space-y-5">
        <Notice tone="ok">Si el correo pertenece a una cuenta del panel, le enviamos un enlace. Revise también la carpeta de spam.</Notice>
        <Link href="/admin/login" className="block text-center text-sm font-bold text-accent">
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className={labelClass}>Correo</span>
        <input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus required />
      </label>
      {error && <Notice>{error}</Notice>}
      <button className={`${buttonClass} w-full`} disabled={state === "busy"}>
        {state === "busy" ? "Enviando…" : "Enviar enlace"}
      </button>
      <Link href="/admin/login" className="block text-center text-sm font-bold text-accent">
        Volver a ingresar
      </Link>
    </form>
  );
}

export function SetPasswordForm() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) return setError("La contraseña debe tener al menos 12 caracteres.");
    if (password !== confirm) return setError("Las contraseñas no coinciden.");
    setState("busy");
    setError("");
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setState("idle");
      return setError(authErrorMessage(error));
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="space-y-5">
        <Notice tone="ok">Contraseña guardada. Ya puede ingresar al panel.</Notice>
        <Link href="/admin/login" className={`${buttonClass} w-full`}>
          Ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className={labelClass}>Nueva contraseña</span>
        <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={12} autoFocus required />
      </label>
      <label className="block">
        <span className={labelClass}>Repita la contraseña</span>
        <input className={fieldClass} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" minLength={12} required />
      </label>
      {error && <Notice>{error}</Notice>}
      <button className={`${buttonClass} w-full`} disabled={state === "busy"}>
        {state === "busy" ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
