// Files the editors' path fields accept and suggest: those shipped under /public and the uploads in the
// media library.
import "server-only";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { db, schema } from "@/db";

function walk(dir: string, base: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name), `${base}/${e.name}`) : [`${base}/${e.name}`]));
}

export async function publicFiles() {
  const root = path.join(process.cwd(), "public");
  const uploads = await db.select({ url: schema.media.url }).from(schema.media);
  const all = [...uploads.map((u) => u.url), ...walk(path.join(root, "media"), "/media"), ...walk(path.join(root, "docs"), "/docs")].sort();
  return {
    images: all.filter((f) => /\.(jpe?g|png|webp|avif|svg)$/i.test(f)),
    videos: all.filter((f) => /\.(mp4|webm)$/i.test(f)),
    docs: all.filter((f) => /\.pdf$/i.test(f)),
  };
}

/** A check for the editors' path fields: true for a file under /public or an upload. Loads the uploads once. */
export async function fileChecker() {
  const uploads = new Set((await db.select({ url: schema.media.url }).from(schema.media)).map((u) => u.url));
  return (p: string) => uploads.has(p) || existsSync(path.join(process.cwd(), "public", ...p.split("/").filter(Boolean)));
}
