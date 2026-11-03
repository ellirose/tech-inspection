// Files already published under /public, offered as suggestions in the editor's path fields until
// uploads arrive (stage 5).
import "server-only";
import { readdirSync } from "node:fs";
import path from "node:path";

function walk(dir: string, base: string): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries.flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name), `${base}/${e.name}`) : [`${base}/${e.name}`]));
}

export function publicFiles() {
  const root = path.join(process.cwd(), "public");
  const all = [...walk(path.join(root, "media"), "/media"), ...walk(path.join(root, "docs"), "/docs")].sort();
  return {
    images: all.filter((f) => /\.(jpe?g|png|webp|avif|svg)$/i.test(f)),
    videos: all.filter((f) => /\.(mp4|webm)$/i.test(f)),
    docs: all.filter((f) => /\.pdf$/i.test(f)),
  };
}
