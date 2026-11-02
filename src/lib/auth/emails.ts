// Email with a one-time access link: account setup for a new user, or a password reset.
import { createHash } from "node:crypto";
import { escapeHtml as esc, type Email } from "@/lib/email";

export function accessLinkEmail({ name, email, url, kind }: { name: string; email: string; url: string; kind: "setup" | "reset" }): Email {
  const setup = kind === "setup";
  const subject = setup ? "Active su acceso al panel de Tech-Inspection" : "Restablezca su contraseña del panel de Tech-Inspection";
  const intro = setup
    ? "Le crearon una cuenta en el panel de administración del sitio web de Tech-Inspection. Para activarla, defina su contraseña con el siguiente enlace."
    : "Recibimos una solicitud para restablecer la contraseña de su cuenta en el panel de Tech-Inspection. Defina una nueva con el siguiente enlace.";
  const action = setup ? "Definir contraseña" : "Restablecer contraseña";
  const note = "El enlace funciona una sola vez y vence en 24 horas. Si usted no esperaba este correo, ignórelo: su cuenta no cambia.";

  return {
    to: [email],
    subject,
    // Derived from the link without containing any of it, so the token never leaves in a header or file name.
    idempotencyKey: `access-${kind}-${createHash("sha256").update(url).digest("hex").slice(0, 16)}`,
    html: `<!doctype html><html><body style="margin:0;background:#f2f7fa;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0a1d30">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1f37d6;padding:20px 28px;color:#ffffff;font-size:20px;font-weight:700">Tech-Inspection · Panel</td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.6">
<p style="margin:0 0 14px">Hola ${esc(name)},</p>
<p style="margin:0 0 22px">${esc(intro)}</p>
<p style="margin:0 0 22px"><a href="${esc(url)}" style="display:inline-block;background:#1f37d6;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px">${esc(action)}</a></p>
<p style="margin:0;color:#5b6b7a;font-size:13px">${esc(note)}</p>
</td></tr></table></td></tr></table></body></html>`,
    text: `Hola ${name},\n\n${intro}\n\n${url}\n\n${note}\n`,
  };
}
