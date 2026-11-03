"use client";

// Browser side of admin authentication; talks to /api/auth on the same origin.
import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({ plugins: [twoFactorClient()] });

/** Spanish message for an error returned by the auth API. */
export function authErrorMessage(error: { code?: string; status?: number } | null | undefined) {
  switch (error?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Correo o contraseña incorrectos.";
    case "ACCOUNT_LOCKED":
    case "ACCOUNT_TEMPORARILY_LOCKED":
      return "Cuenta bloqueada por demasiados intentos fallidos. Vuelva a intentarlo en 15 minutos o pida a un superadministrador que la desbloquee.";
    case "ACCOUNT_DISABLED":
      return "Esta cuenta está desactivada. Contacte a un superadministrador.";
    case "INVALID_CODE":
    case "INVALID_BACKUP_CODE":
      return "El código no es válido. Revise la hora de su teléfono e inténtelo de nuevo.";
    case "INVALID_TWO_FACTOR_COOKIE":
      return "La verificación venció. Vuelva a ingresar su correo y contraseña.";
    case "INVALID_TOKEN":
      return "El enlace no es válido o ya venció. Pida uno nuevo.";
    case "PASSWORD_TOO_SHORT":
      return "La contraseña debe tener al menos 12 caracteres.";
    case "PASSWORD_TOO_LONG":
      return "La contraseña puede tener hasta 128 caracteres.";
    case "INVALID_PASSWORD":
      return "La contraseña actual no es correcta.";
  }
  if (error?.status === 429) return "Demasiados intentos. Espere unos minutos y vuelva a intentarlo.";
  return "No pudimos completar la operación. Inténtelo de nuevo.";
}
