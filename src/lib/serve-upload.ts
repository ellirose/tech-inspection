// Serves a public upload from storage. Upload names never change (each upload gets a new random name),
// so browsers and the proxy in front may keep them for a year. Byte ranges are answered (206), which
// browsers need to play and seek videos (Safari plays nothing without them).
import "server-only";
import { isStorageKey, mimeOf, storage, type ByteRange } from "./storage";

/** One range from a Range header ("bytes=0-", "bytes=500-999"); null for none, several or a suffix range. */
export function parseRange(header: string | null): ByteRange | null {
  const m = header?.match(/^bytes=(\d+)-(\d*)$/);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : undefined;
  return end !== undefined && end < start ? null : { start, end };
}

export async function serveUpload(folder: "media/uploads" | "docs/uploads", segments: string[], request?: Request) {
  const key = `${folder}/${segments.join("/")}`;
  if (!isStorageKey(key)) return new Response("Not found", { status: 404 });
  const range = parseRange(request?.headers.get("range") ?? null);
  const headers = new Headers({
    "Content-Type": mimeOf(key),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  });
  if (range) {
    const file = await storage().get(key, range);
    if (!file) return new Response("Not found", { status: 404 });
    if (file.size !== undefined && range.start >= file.size) {
      headers.set("Content-Range", `bytes */${file.size}`);
      return new Response(null, { status: 416, headers });
    }
    if (file.range && file.size !== undefined) {
      headers.set("Content-Range", `bytes ${file.range.start}-${file.range.end}/${file.size}`);
      headers.set("Content-Length", String(file.range.end - file.range.start + 1));
      return new Response(file.body as BodyInit, { status: 206, headers });
    }
    // The store ignored the range: send the whole file.
    if (file.size) headers.set("Content-Length", String(file.size));
    return new Response(file.body as BodyInit, { headers });
  }
  const file = await storage().get(key);
  if (!file) return new Response("Not found", { status: 404 });
  if (file.size) headers.set("Content-Length", String(file.size));
  return new Response(file.body as BodyInit, { headers });
}
