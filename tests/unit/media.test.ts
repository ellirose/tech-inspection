import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { photo } from "@/lib/media";
import { readAttachments } from "@/lib/leads/attachments";
import { prepareUpload, slugifyName } from "@/lib/media-upload";
import { previewPath } from "@/lib/preview";
import { isStorageKey } from "@/lib/storage";

const fileOf = (bytes: Uint8Array | Buffer, name: string, type = "") => new File([new Uint8Array(bytes)], name, { type });
const now = new Date("2026-11-02T12:00:00Z");

describe("uploads", () => {
  it("shrinks images to 2400 px, saves WebP, drops camera data and names the size", async () => {
    const jpeg = await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#157bdc" } })
      .jpeg()
      .withExif({ IFD0: { Make: "TestCam" } })
      .toBuffer();
    const out = await prepareUpload(fileOf(jpeg, "Broca PDC (vista lateral).JPG", "image/jpeg"), now);
    if ("error" in out) throw new Error(out.error);
    expect(out.key).toMatch(/^media\/uploads\/2026\/broca-pdc-vista-lateral-[0-9a-f]{8}-2400x1800\.webp$/);
    expect(out.mime).toBe("image/webp");
    expect([out.width, out.height]).toEqual([2400, 1800]);
    const meta = await sharp(out.body).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.exif).toBeUndefined();
    expect(isStorageKey(out.key)).toBe(true);
  }, 60_000);

  it("keeps small images at their size", async () => {
    const png = await sharp({ create: { width: 300, height: 200, channels: 4, background: "#ffffff00" } }).png().toBuffer();
    const out = await prepareUpload(fileOf(png, "logo.png"), now);
    if ("error" in out) throw new Error(out.error);
    expect(out.key).toMatch(/-300x200\.webp$/);
  });

  it("reads the type from the content, not the name", async () => {
    const pdf = await prepareUpload(fileOf(Buffer.from("%PDF-1.7\n%…"), "Política HSEQ.pdf"), now);
    if ("error" in pdf) throw new Error(pdf.error);
    expect(pdf.key).toMatch(/^docs\/uploads\/2026\/politica-hseq-[0-9a-f]{8}\.pdf$/);
    expect(await prepareUpload(fileOf(Buffer.from("<svg onload=alert(1)>"), "x.jpg", "image/jpeg"), now)).toHaveProperty("error");
    expect(await prepareUpload(fileOf(Buffer.from("MZ\x90\x00"), "photo.png"), now)).toHaveProperty("error");
  });

  it("refuses broken images", async () => {
    const truncated = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70]);
    expect(await prepareUpload(fileOf(truncated, "a.jpg"), now)).toEqual({ error: expect.stringMatching(/dañada/) });
  });

  it("makes safe file names", () => {
    expect(slugifyName("Ñandú_ÁRBOL  final.v2.jpeg")).toBe("nandu-arbol-final-v2");
    expect(slugifyName("....png")).toBe("archivo");
    expect(slugifyName("a".repeat(80) + ".jpg")).toHaveLength(48);
  });

  it("only serves keys the app could have written", () => {
    expect(isStorageKey("media/uploads/2026/foto-1a2b3c4d-10x10.webp")).toBe(true);
    for (const bad of ["media/uploads/../../.env", "media/uploads/2026/Foto.webp", "media/uploads/2026/", "/media/uploads/a.webp", "media/uploads/a b.webp"]) expect(isStorageKey(bad)).toBe(false);
  });

  it("lays out uploads from the size in their name", () => {
    expect(photo("/media/uploads/2026/foto-1a2b3c4d-1600x900.webp")).toMatchObject({ w: 1600, h: 900 });
    expect(photo("/media/unknown.jpg")).toMatchObject({ w: 1600, h: 1200 });
  });
});

describe("quote attachments", () => {
  const pdf = (name: string, size = 100) => fileOf(Buffer.concat([Buffer.from("%PDF-1.7\n"), Buffer.alloc(size)]), name);

  it("keeps files as sent under a private folder with an unguessable name", async () => {
    const png = await sharp({ create: { width: 20, height: 10, channels: 3, background: "#000" } }).png().toBuffer();
    const out = await readAttachments([pdf("Plano tubería.PDF"), fileOf(png, "foto.png")], now);
    expect(out).toHaveLength(2);
    expect(out![0]).toMatchObject({ name: "Plano tubería.PDF", mime: "application/pdf", size: 109 });
    expect(out![0].key).toMatch(/^leads\/2026\/11\/[0-9a-f]{16}-plano-tuberia\.pdf$/);
    expect(out![1].key).toMatch(/\.png$/);
    expect(Buffer.from(out![1].body).equals(png)).toBe(true);
    for (const f of out!) expect(isStorageKey(f.key)).toBe(true);
  });

  it("refuses other formats, more than three files or more than 10 MB in total", async () => {
    expect(await readAttachments([fileOf(Buffer.from("PK\x03\x04"), "lista.xlsx")], now)).toBeNull();
    expect(await readAttachments([fileOf(Buffer.from("RIFF0000WEBPVP8 "), "a.webp")], now)).toBeNull();
    expect(await readAttachments([pdf("1.pdf"), pdf("2.pdf"), pdf("3.pdf"), pdf("4.pdf")], now)).toBeNull();
    expect(await readAttachments([pdf("a.pdf", 6_000_000), pdf("b.pdf", 5_000_000)], now)).toBeNull();
    expect(await readAttachments([pdf("a.pdf", 5_000_000), pdf("b.pdf", 5_000_000)], now)).toHaveLength(2);
  });
});

describe("preview paths", () => {
  it("accepts public pages only", () => {
    expect(previewPath("/es")).toBe("/es");
    expect(previewPath("/en/servicios/tuberia")).toBe("/en/servicios/tuberia");
    for (const bad of ["//evil.com", "https://evil.com/es", "/admin", "/es/../admin", "/fr/servicios", "/es/servicios?x=1", "", null]) expect(previewPath(bad)).toBeNull();
  });
});
