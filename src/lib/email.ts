// Outgoing email. Sends through Resend when RESEND_API_KEY is set; otherwise, when EMAIL_OUTBOX_DIR
// is set (development), writes each message to that folder as an .html file to open in a browser.
// With neither, sending is switched off and only the subject is logged.
// Not marked server-only: the admin scripts use it too. Its Node imports keep it out of client bundles.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type Email = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  /** Resend ignores a repeat of the same key for 24 hours, so a retried job cannot send twice. */
  idempotencyKey?: string;
};

const FROM = process.env.EMAIL_FROM || "Tech-Inspection <notificaciones@send.tech-inspection.com>";

export async function sendEmail(email: Email): Promise<"sent" | "outbox" | "disabled"> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(email.idempotencyKey && { "Idempotency-Key": email.idempotencyKey }),
      },
      body: JSON.stringify({ from: FROM, to: email.to, subject: email.subject, html: email.html, text: email.text, reply_to: email.replyTo }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return "sent";
  }

  const dir = process.env.EMAIL_OUTBOX_DIR;
  if (dir) {
    await mkdir(dir, { recursive: true });
    const name = `${new Date().toISOString().replace(/[:.]/g, "-")}-${(email.idempotencyKey ?? "email").replace(/[^\w-]/g, "_")}.html`;
    const header = `<pre style="background:#eee;padding:12px;margin:0">From: ${escapeHtml(FROM)}\nTo: ${escapeHtml(email.to.join(", "))}\nReply-To: ${escapeHtml(email.replyTo ?? "")}\nSubject: ${escapeHtml(email.subject)}</pre>`;
    await writeFile(path.join(dir, name), header + email.html, "utf8");
    return "outbox";
  }

  console.warn("[email] sending is off (no RESEND_API_KEY or EMAIL_OUTBOX_DIR):", email.subject);
  return "disabled";
}

export const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
