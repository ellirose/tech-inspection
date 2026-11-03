// Server-side check of a Cloudflare Turnstile token (design document §12, anti-spam).
// Without TURNSTILE_SECRET_KEY the check is switched off, as for every optional integration.
import "server-only";

export type TurnstileResult = "ok" | "failed" | "skipped";

export async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return "skipped";
  if (!token) return "failed";
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    const body = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (body.success) return "ok";
    console.warn("[turnstile] rejected", body["error-codes"]?.join(",") ?? res.status);
    return "failed";
  } catch (error) {
    // Cloudflare unreachable: let the lead through rather than lose it. The honeypot and the
    // rate limit still apply.
    console.error("[turnstile] verification unavailable", (error as Error).name);
    return "skipped";
  }
}
