// Download of a quote attachment. With Spaces, a redirect to a link that expires after five minutes;
// with local storage, the file itself. Attachments carry client data, so each download is logged.
import { NextResponse, type NextRequest } from "next/server";
import { audit, requestIp } from "@/lib/audit";
import { authorize, getSession } from "@/lib/auth/session";
import { getLead } from "@/lib/leads/admin";
import { signedDownload, storage } from "@/lib/storage";

const notFound = () => new Response("No encontrado", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest, { params }: RouteContext<"/admin/leads/[reference]/adjuntos/[n]">) {
  const { reference, n } = await params;
  let user;
  try {
    user = await authorize("leads:read");
  } catch {
    if (await getSession()) return new Response("No autorizado", { status: 403 });
    return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(`/admin/leads/${reference}`)}`, request.url));
  }
  if (!/^[1-9]$/.test(n)) return notFound();
  const found = await getLead(reference);
  const file = found?.lead.attachments[Number(n) - 1];
  if (!found || !file) return notFound();

  await audit({ userId: user.id, action: "lead_attachment_downloaded", entity: "lead", entityId: found.lead.id, diff: { referencia: reference, archivo: file.name }, ip: requestIp(request.headers) });

  const signed = await signedDownload(file.key, file.name);
  if (signed) return NextResponse.redirect(signed, { status: 303, headers: { "Cache-Control": "no-store" } });

  const stored = await storage().get(file.key);
  if (!stored) return notFound();
  return new Response(stored.body as BodyInit, {
    headers: {
      "Content-Type": file.mime,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Content-Length": String(stored.size ?? file.size),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
