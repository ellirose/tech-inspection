// Quote attachments: checked by content (PDF, JPG or PNG only), kept as sent, and stored under leads/,
// a folder no public route serves. The team opens them from the lead's page in the admin, which hands
// out a link that expires after a few minutes (see storage.ts, signedDownload).
import "server-only";
import { randomBytes } from "node:crypto";
import { detectFile, slugifyName } from "@/lib/media-upload";
import { storage } from "@/lib/storage";
import { ATTACHMENTS } from "./options";
import type { Lead } from "./service";

export type Attachment = Lead["attachments"][number];

/** Checks the files of one request; nothing is stored until the whole set passes. */
export async function readAttachments(files: File[], now = new Date()): Promise<(Attachment & { body: Uint8Array })[] | null> {
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (files.length > ATTACHMENTS.maxFiles || total > ATTACHMENTS.maxBytes) return null;
  const folder = `leads/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const read = [];
  for (const file of files) {
    const body = new Uint8Array(await file.arrayBuffer());
    const type = detectFile(body);
    if (!type || type.ext === "webp" || body.byteLength === 0) return null;
    const key = `${folder}/${randomBytes(8).toString("hex")}-${slugifyName(file.name)}.${type.ext}`;
    read.push({ key, name: file.name.slice(0, 160) || `archivo.${type.ext}`, size: body.byteLength, mime: type.mime, body });
  }
  return read;
}

export async function storeAttachments(files: (Attachment & { body: Uint8Array })[]): Promise<Attachment[]> {
  const stored: Attachment[] = [];
  try {
    for (const { body, ...file } of files) {
      await storage().put(file.key, body, file.mime);
      stored.push(file);
    }
    return stored;
  } catch (error) {
    await removeAttachments(stored);
    throw error;
  }
}

/** Best effort: used when the lead itself could not be saved. */
export async function removeAttachments(files: Attachment[]) {
  await Promise.all(files.map((f) => storage().remove(f.key).catch(() => {})));
}
