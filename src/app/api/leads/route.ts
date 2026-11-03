// Lead intake for the quote wizard and the assistant. Order: validate, drop bots (honeypot), rate
// limit, verify Turnstile, store, then email after the response. Logs carry the reference only.
// The wizard sends multipart form data when files are attached (a "payload" field with the JSON, plus
// "files"); everything else sends JSON. This path is outside the proxy, so its body limit does not apply.
import { after, userAgent, type NextRequest } from "next/server";
import { getServices } from "@/lib/data/content";
import { linkLead } from "@/lib/chat/log";
import { readAttachments, removeAttachments, storeAttachments, type Attachment } from "@/lib/leads/attachments";
import { leadInput } from "@/lib/leads/input";
import { notifyLead } from "@/lib/leads/notify";
import { ATTACHMENTS, type LeadResponse } from "@/lib/leads/options";
import { createLead, newReference } from "@/lib/leads/service";
import { hit, pruneRateLimits, visitorKey } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

const limits = [
  { name: "lead:10m", max: 5, windowSeconds: 600 },
  { name: "lead:day", max: 20, windowSeconds: 86_400 },
];

const reply = (body: LeadResponse, status: number, headers?: HeadersInit) => Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Nginx sets X-Real-IP; X-Forwarded-For is the fallback when another proxy sits in front. */
const clientIp = (request: NextRequest) => request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? undefined;

/** The JSON body and any attached files; null when the body cannot be read. */
async function readBody(request: NextRequest): Promise<{ body: unknown; files: File[] } | null> {
  try {
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return { body: await request.json(), files: [] };
    const form = await request.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    return { body: JSON.parse(String(form.get("payload"))), files };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Room for the files plus the form itself.
  if (Number(request.headers.get("content-length") ?? 0) > ATTACHMENTS.maxBytes + 256 * 1024) return reply({ ok: false, error: "files" }, 413);
  const read = await readBody(request);
  if (!read) return reply({ ok: false, error: "invalid" }, 400);
  const { body } = read;

  const parsed = leadInput.safeParse(body);
  if (!parsed.success) return reply({ ok: false, error: "invalid" }, 422);
  const input = parsed.data;
  const files = read.files.length ? await readAttachments(read.files) : [];
  if (!files) return reply({ ok: false, error: "files" }, 422);

  // Bots get the same answer as people, so the trap is not revealed.
  if (input.website) return reply({ ok: true, reference: newReference() }, 201);

  const ip = clientIp(request);
  const limited = await hit(visitorKey(ip ?? "unknown"), limits);
  if (!limited.ok) return reply({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });

  if ((await verifyTurnstile(input.turnstileToken, ip)) === "failed") return reply({ ok: false, error: "captcha" }, 403);

  // Only services that exist on the site; anything else would be noise in the inbox.
  const known = new Set((await getServices()).map((s) => s.slug));
  input.services = input.services.filter((s) => known.has(s));

  let attachments: Attachment[] = [];
  try {
    attachments = await storeAttachments(files);
    const { device } = userAgent(request);
    const lead = await createLead(input, { device: device.type ?? "desktop", attachments });
    after(async () => {
      if (input.conversationId && input.source === "chatbot") await linkLead(input.conversationId, lead.reference).catch(() => {});
      await notifyLead(lead);
      await pruneRateLimits();
    });
    console.info("[leads] stored", lead.reference, lead.source);
    return reply({ ok: true, reference: lead.reference }, 201);
  } catch (error) {
    // Drizzle's own message lists the query parameters (personal data); log the database's reason only.
    const cause = (error as { cause?: Error }).cause;
    console.error("[leads] could not store lead:", cause?.message ?? (error as Error).name);
    await removeAttachments(attachments);
    return reply({ ok: false, error: "server" }, 500);
  }
}
