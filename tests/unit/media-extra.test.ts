import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { altFor, describe as describePhotos, photos } from "@/lib/media";
import { detectFile, prepareUpload } from "@/lib/media-upload";
import { parseRange, serveUpload } from "@/lib/serve-upload";

const fileOf = (bytes: Uint8Array, name: string) => new File([new Uint8Array(bytes)], name);
const ascii = (s: string) => new TextEncoder().encode(s);
// An MP4 begins with an "ftyp" box: size, "ftyp", major brand.
const mp4 = new Uint8Array([0, 0, 0, 0x18, ...ascii("ftypisom"), 0, 0, 2, 0, ...ascii("isomiso2"), ...new Uint8Array(64)]);
const mov = new Uint8Array([0, 0, 0, 0x14, ...ascii("ftypqt  "), 0, 0, 2, 0, ...ascii("qt  "), ...new Uint8Array(64)]);
const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0x82, 0x84, ...ascii("webm"), ...new Uint8Array(64)]);

describe("video uploads", () => {
  it("recognises MP4 and WebM by their first bytes and refuses QuickTime", () => {
    expect(detectFile(mp4)).toEqual({ ext: "mp4", mime: "video/mp4" });
    expect(detectFile(webm)).toEqual({ ext: "webm", mime: "video/webm" });
    expect(detectFile(mov)).toBeNull();
  });

  it("stores videos as uploaded, under media/uploads", async () => {
    const out = await prepareUpload(fileOf(mp4, "Inspección UT (campo).mp4"), new Date("2026-11-05T12:00:00Z"));
    if ("error" in out) throw new Error(out.error);
    expect(out.key).toMatch(/^media\/uploads\/2026\/inspeccion-ut-campo-[0-9a-f]{8}\.mp4$/);
    expect(out.mime).toBe("video/mp4");
    expect(out.body.byteLength).toBe(mp4.byteLength);
  });
});

describe("byte ranges", () => {
  it("reads one range and refuses the rest", () => {
    expect(parseRange("bytes=0-")).toEqual({ start: 0, end: undefined });
    expect(parseRange("bytes=100-199")).toEqual({ start: 100, end: 199 });
    expect(parseRange("bytes=200-100")).toBeNull();
    expect(parseRange("bytes=0-1,5-9")).toBeNull();
    expect(parseRange("bytes=-500")).toBeNull();
    expect(parseRange(null)).toBeNull();
  });

  const key = "media/uploads/2099/rango-test-0000.mp4";
  const file = path.resolve(".data/uploads", ...key.split("/"));
  afterAll(() => rm(path.dirname(file), { recursive: true, force: true }));

  it("answers a range with 206 and the part asked for (local storage)", async () => {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, ascii("0123456789"));
    const segments = key.split("/").slice(2);
    const part = await serveUpload("media/uploads", segments, new Request("http://x/", { headers: { range: "bytes=2-5" } }));
    expect(part.status).toBe(206);
    expect(part.headers.get("content-range")).toBe("bytes 2-5/10");
    expect(part.headers.get("content-type")).toBe("video/mp4");
    expect(await part.text()).toBe("2345");
    const open = await serveUpload("media/uploads", segments, new Request("http://x/", { headers: { range: "bytes=7-" } }));
    expect(await open.text()).toBe("789");
    const past = await serveUpload("media/uploads", segments, new Request("http://x/", { headers: { range: "bytes=50-" } }));
    expect(past.status).toBe(416);
    const whole = await serveUpload("media/uploads", segments, new Request("http://x/"));
    expect(whole.status).toBe(200);
    expect(whole.headers.get("accept-ranges")).toBe("bytes");
    expect(await whole.text()).toBe("0123456789");
  });
});

describe("Medios descriptions as alt text", () => {
  const alts = { "/media/uploads/2026/broca-1a2b3c4d-1600x1200.webp": "Inspector midiendo una broca PDC" };
  it("uses the description on Spanish pages only", () => {
    const items = photos(["/media/uploads/2026/broca-1a2b3c4d-1600x1200.webp", "/media/photos/pdc-bit.jpg"]);
    expect(describePhotos(items, alts, "es").map((p) => p.alt)).toEqual(["Inspector midiendo una broca PDC", undefined]);
    expect(describePhotos(items, alts, "en").map((p) => p.alt)).toEqual([undefined, undefined]);
    expect(altFor("/media/uploads/2026/broca-1a2b3c4d-1600x1200.webp", alts, "es", "Broca")).toBe("Inspector midiendo una broca PDC");
    expect(altFor("/media/uploads/2026/broca-1a2b3c4d-1600x1200.webp", alts, "pt", "Broca")).toBe("Broca");
    expect(altFor(null, alts, "es", "Broca")).toBe("Broca");
  });
});
