import { describe, expect, it } from "vitest";
import { readField, type Field } from "@/lib/admin/fields";
import { rebuildBlock } from "@/lib/admin/blocks";

const form = (entries: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) for (const x of [v].flat()) f.append(k, x);
  return f;
};
const exists = (p: string) => p === "/media/photos/a.jpg" || p === "/docs/a.pdf";
const read = (field: Field, entries: Record<string, string | string[]>) => readField(field, form(entries), exists);

describe("content fields", () => {
  it("requires every language once any translation is given", () => {
    const f: Field = { name: "name", label: "Nombre", type: "l10n" };
    expect(read(f, { "name.es": "Tubería", "name.pt": "Tubulação", "name.en": "Tubulars" }).value).toEqual({ es: "Tubería", pt: "Tubulação", en: "Tubulars" });
    expect(read(f, { "name.es": "Tubería", "name.pt": "", "name.en": "Tubulars" }).error).toMatch(/portugués/);
    expect(read(f, {}).error).toBeTruthy();
    expect(read({ ...f, nullable: true }, {}).value).toBeNull();
  });

  it("keeps translated lists aligned line by line", () => {
    const f: Field = { name: "scope", label: "Alcance", type: "l10nList" };
    expect(read(f, { "scope.es": "a\n\nb", "scope.pt": "a\nb", "scope.en": "a\nb\n" }).value).toEqual({ es: ["a", "b"], pt: ["a", "b"], en: ["a", "b"] });
    expect(read(f, { "scope.es": "a\nb", "scope.pt": "a", "scope.en": "a\nb" }).error).toMatch(/misma cantidad/);
  });

  it("accepts only existing files under the allowed folders", () => {
    const f: Field = { name: "image", label: "Foto", type: "path", prefixes: ["/media/"] };
    expect(read(f, { image: "/media/photos/a.jpg" }).value).toBe("/media/photos/a.jpg");
    expect(read(f, { image: "/media/photos/missing.jpg" }).error).toMatch(/No existe/);
    expect(read(f, { image: "/docs/a.pdf" }).error).toMatch(/Debe empezar/);
    expect(read(f, { image: "/media/../../.env" }).error).toBeTruthy();
  });

  it("validates slugs, numbers and options", () => {
    const slug: Field = { name: "slug", label: "Slug", type: "text", required: true, pattern: "^[a-z0-9]+(-[a-z0-9]+)*$" };
    expect(read(slug, { slug: "inspeccion-de-valvulas" }).value).toBe("inspeccion-de-valvulas");
    expect(read(slug, { slug: "Inspección" }).error).toBeTruthy();
    expect(read({ name: "v", label: "Valor", type: "int", min: 0, max: 10 }, { v: "11" }).error).toBeTruthy();
    expect(read({ name: "k", label: "Tipo", type: "select", options: [["a", "A"]] }, { k: "b" }).error).toBeTruthy();
  });

  it("drops emptied steps and requires both parts of the rest", () => {
    const f: Field = { name: "steps", label: "Pasos", type: "steps" };
    const step = (i: number, t: string) => ({ [`steps.${i}.title.es`]: t, [`steps.${i}.title.pt`]: t, [`steps.${i}.title.en`]: t, [`steps.${i}.text.es`]: t, [`steps.${i}.text.pt`]: t, [`steps.${i}.text.en`]: t });
    const ok = read(f, { "steps.count": "3", ...step(0, "Uno"), ...step(2, "Tres") });
    expect((ok.value as unknown[]).length).toBe(2);
    expect(read(f, { "steps.count": "1", "steps.0.title.es": "x", "steps.0.title.pt": "x", "steps.0.title.en": "x" }).error).toMatch(/texto/);
  });
});

describe("page block rebuild", () => {
  const stored = {
    eyebrow: { es: "Hola", pt: "Olá", en: "Hello" },
    items: [
      { key: "people", year: 2014, title: { es: "A", pt: "A", en: "A" }, image: "/media/photos/a.jpg" },
      { key: "equipment", year: 2015, title: { es: "B", pt: "B", en: "B" }, list: { es: ["x", "y"], pt: ["x", "y"], en: ["x", "y"] } },
    ],
  };

  it("changes values but never structure or internal keys", () => {
    const { value, errors } = rebuildBlock(
      stored,
      form({ "eyebrow.es": "Hola de nuevo", "items.0.year": "2013", "items.0.key": "hacked", "items.1.list.es": "x\nz", extra: "ignored" }),
      exists,
    );
    expect(errors).toEqual([]);
    expect(value).toEqual({
      eyebrow: { es: "Hola de nuevo", pt: "Olá", en: "Hello" },
      items: [
        { ...stored.items[0], year: 2013 },
        { ...stored.items[1], list: { es: ["x", "z"], pt: ["x", "y"], en: ["x", "y"] } },
      ],
    });
  });

  it("reports emptied text, wrong line counts and missing images", () => {
    const { errors } = rebuildBlock(stored, form({ "eyebrow.pt": "", "items.1.list.en": "x", "items.0.image": "/media/nope.jpg" }), exists);
    expect(errors.map((e) => e.path).sort()).toEqual(["eyebrow", "items.0.image", "items.1.list"]);
  });

  it("handles blocks that are a list at the top level", () => {
    const { value } = rebuildBlock([{ year: 2014, title: { es: "a", pt: "a", en: "a" } }], form({ "0.title.en": "b" }), exists);
    expect(value).toEqual([{ year: 2014, title: { es: "a", pt: "a", en: "b" } }]);
  });
});
