// Upload to the media library. A route handler rather than a server action so large files are not held
// to the server-action and proxy body limits (this path is outside the proxy's matcher).
import { headers } from "next/headers";
import { db, schema } from "@/db";
import { audit, requestIp } from "@/lib/audit";
import { authorize } from "@/lib/auth/session";
import { MAX_PDF_BYTES, prepareUpload } from "@/lib/media-upload";
import { storage } from "@/lib/storage";

export type UploadResponse = { ok: true; url: string } | { ok: false; error: string };

const reply = (body: UploadResponse, status = 200) => Response.json(body, { status });

export async function POST(request: Request) {
  // The session cookie is SameSite=Lax; refuse other origins as well.
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) return reply({ ok: false, error: "Origen no permitido." }, 403);
  let user;
  try {
    user = await authorize("media:write");
  } catch {
    return reply({ ok: false, error: "Su rol no puede subir archivos o la sesión terminó." }, 403);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_PDF_BYTES + 1024 * 1024) return reply({ ok: false, error: "El archivo es demasiado grande." }, 413);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) return reply({ ok: false, error: "Elija un archivo." }, 400);
  const alt = String(form?.get("alt") ?? "").trim();
  const caption = String(form?.get("caption") ?? "").trim() || null;
  if (alt.length > 200 || (caption?.length ?? 0) > 300) return reply({ ok: false, error: "La descripción es demasiado larga." }, 400);

  const prepared = await prepareUpload(file);
  if ("error" in prepared) return reply({ ok: false, error: prepared.error }, 400);
  const image = prepared.mime.startsWith("image/");
  // Design document §9.3: every image needs a Spanish text alternative.
  if (image && alt.length < 3) return reply({ ok: false, error: "Escriba el texto alternativo: qué muestra la imagen, en español." }, 400);

  await storage().put(prepared.key, prepared.body, prepared.mime);
  const url = `/${prepared.key}`;
  const [row] = await db
    .insert(schema.media)
    .values({
      storageKey: prepared.key,
      url,
      mime: prepared.mime,
      sizeBytes: prepared.body.byteLength,
      width: prepared.width,
      height: prepared.height,
      alt: alt || null,
      caption,
      originalName: file.name.slice(0, 200),
      uploadedBy: user.id,
    })
    .returning({ id: schema.media.id });
  await audit({ userId: user.id, action: "media_uploaded", entity: "media", entityId: row.id, diff: { archivo: url }, ip: requestIp(await headers()) });
  return reply({ ok: true, url });
}
