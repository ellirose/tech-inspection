// Serves a public upload from storage. Upload names never change (each upload gets a new random name),
// so browsers and the proxy in front may keep them for a year.
import "server-only";
import { isStorageKey, mimeOf, storage } from "./storage";

export async function serveUpload(folder: "media/uploads" | "docs/uploads", segments: string[]) {
  const key = `${folder}/${segments.join("/")}`;
  if (!isStorageKey(key)) return new Response("Not found", { status: 404 });
  const file = await storage().get(key);
  if (!file) return new Response("Not found", { status: 404 });
  const headers = new Headers({
    "Content-Type": mimeOf(key),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  if (file.size) headers.set("Content-Length", String(file.size));
  return new Response(file.body as BodyInit, { headers });
}
