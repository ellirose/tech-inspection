// Checks and prepares an uploaded image or PDF for the media library. The file type is read from its
// first bytes, not from its name. Images are turned upright, stripped of camera data (GPS included),
// reduced to at most 2400 px on the long side and saved as WebP; the size goes into the file name so
// pages can lay the image out without looking it up (see photo() in media.ts).
import "server-only";
import { randomBytes } from "node:crypto";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const MAX_PDF_BYTES = 20 * 1024 * 1024;
const LONG_EDGE = 2400;

export type PreparedUpload = { key: string; mime: string; body: Uint8Array; width: number | null; height: number | null };

type Kind = "image" | "pdf";

function sniff(b: Uint8Array): Kind | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...b.subarray(from, to));
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image"; // JPEG
  if (b[0] === 0x89 && ascii(1, 4) === "PNG") return "image";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image";
  if (ascii(0, 5) === "%PDF-") return "pdf";
  return null;
}

/** A file-name fragment from the original name: lowercase, no accents, dashes only. */
export function slugifyName(name: string) {
  return (
    name
      .replace(/\.[^.]*$/, "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48)
      .replace(/-+$/, "") || "archivo"
  );
}

export async function prepareUpload(file: File, now = new Date()): Promise<PreparedUpload | { error: string }> {
  const input = new Uint8Array(await file.arrayBuffer());
  const kind = sniff(input);
  if (!kind) return { error: "Formato no admitido. Use JPG, PNG o WebP para imágenes y PDF para documentos (las fotos HEIC del iPhone se pueden exportar como JPG)." };
  const name = `${slugifyName(file.name)}-${randomBytes(4).toString("hex")}`;
  const year = now.getUTCFullYear();

  if (kind === "pdf") {
    if (input.byteLength > MAX_PDF_BYTES) return { error: "El PDF supera 20 MB." };
    return { key: `docs/uploads/${year}/${name}.pdf`, mime: "application/pdf", body: input, width: null, height: null };
  }

  if (input.byteLength > MAX_IMAGE_BYTES) return { error: "La imagen supera 15 MB." };
  try {
    const { data, info } = await sharp(input, { limitInputPixels: 100_000_000 })
      .rotate()
      .resize({ width: LONG_EDGE, height: LONG_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { key: `media/uploads/${year}/${name}-${info.width}x${info.height}.webp`, mime: "image/webp", body: new Uint8Array(data), width: info.width, height: info.height };
  } catch {
    return { error: "No se pudo leer la imagen; puede estar dañada." };
  }
}
