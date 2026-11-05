import { describe, expect, it } from "vitest";
import { breadcrumbLd, faqLd, ldScript, organizationLd, serviceLd, websiteLd } from "@/lib/jsonld";
import { faqCategories, faqs } from "@/content/faqs";
import { industries } from "@/content/industries";
import { methods } from "@/content/methods";
import { services } from "@/content/services";
import { legacyRedirects } from "@/db/seed/redirects";
import { locales } from "@/i18n/config";
import { getExtra } from "@/i18n/extra";

describe("structured data", () => {
  it("describes the company with its credentials", () => {
    const ld = organizationLd({
      lang: "es",
      company: { name: "TECH-INSPECTION S.A.S.", short: "Tech-Inspection", address: "Vía Siberia", phone: "+57 1", email: "a@b.co" },
      founded: 2014,
      methods: ["Ultrasonido"],
      certifications: [{ code: "ISO 9001", title: "Gestión de calidad", certifier: "CCS" }, { code: "DS-1", title: "Lineamientos" }],
    });
    expect(ld).toMatchObject({ "@type": "ProfessionalService", legalName: "TECH-INSPECTION S.A.S.", foundingDate: "2014" });
    expect(ld.hasCredential).toEqual([
      { "@type": "EducationalOccupationalCredential", name: "ISO 9001 · Gestión de calidad", credentialCategory: "certification", recognizedBy: { "@type": "Organization", name: "CCS" } },
      { "@type": "EducationalOccupationalCredential", name: "DS-1 · Lineamientos", credentialCategory: "certification" },
    ]);
  });

  it("builds breadcrumbs with absolute links, the current page without one", () => {
    const ld = breadcrumbLd([{ label: "Inicio", href: "/es" }, { label: "Servicios", href: "/es/servicios" }, { label: "Tubería" }]);
    const items = ld.itemListElement as { position: number; item?: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[1].item).toMatch(/^https?:\/\/.+\/es\/servicios$/);
    expect(items[2].item).toBeUndefined();
  });

  it("links services and the site to the organization", () => {
    expect(serviceLd({ lang: "en", path: "/servicios/tuberia", name: "Pipe", description: "x" })).toMatchObject({ "@type": "Service", provider: { "@id": expect.stringContaining("#organization") } });
    expect(websiteLd("pt", "Tech-Inspection")).toMatchObject({ "@type": "WebSite", inLanguage: "pt-BR" });
  });

  it("marks up questions, and nothing when there are none", () => {
    expect(faqLd("es", [])).toBeNull();
    const ld = faqLd("en", faqs.slice(0, 2))!;
    expect((ld.mainEntity as unknown[]).length).toBe(2);
    expect(ld.mainEntity).toContainEqual(expect.objectContaining({ "@type": "Question", acceptedAnswer: expect.objectContaining({ "@type": "Answer" }) }));
  });

  it("cannot close its script tag", () => {
    expect(ldScript({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

describe("seed content for the new pages", () => {
  const serviceSlugs = new Set(services.map((s) => s.slug));
  const methodKeys = new Set(methods.map((m) => m.key));

  it("links FAQs and industries only to services and methods that exist", () => {
    for (const f of faqs) {
      expect(faqCategories).toContain(f.category);
      for (const s of f.services ?? []) expect(serviceSlugs).toContain(s);
      for (const m of f.methods ?? []) expect(methodKeys).toContain(m);
    }
    for (const i of industries) {
      for (const s of i.services) expect(serviceSlugs).toContain(s);
      for (const m of i.methods) expect(methodKeys).toContain(m);
      expect(new Set(locales.map((l) => i.components[l].length)).size).toBe(1);
    }
  });

  it("has 4 to 6 home questions and translated, direct answers", () => {
    const home = faqs.filter((f) => f.home).length;
    expect(home).toBeGreaterThanOrEqual(4);
    expect(home).toBeLessThanOrEqual(6);
    for (const f of faqs)
      for (const l of locales) {
        expect(f.question[l]).toBeTruthy();
        const words = f.answer[l].split(/\s+/).length;
        expect(words, `${f.question.es} (${l})`).toBeGreaterThanOrEqual(30);
        expect(words, `${f.question.es} (${l})`).toBeLessThanOrEqual(80);
      }
  });

  it("gives every language the same legal sections", () => {
    const shape = (l: (typeof locales)[number]) => getExtra(l).privacy.sections.map((s) => ("list" in s ? "list" : "p"));
    for (const l of locales) expect(shape(l)).toEqual(shape("es"));
    for (const l of locales) expect(getExtra(l).terms.sections.length).toBe(getExtra("es").terms.sections.length);
  });

  it("redirects every old Wix PDF to a document on the site", () => {
    const pdfs = legacyRedirects.filter(([from]) => from.startsWith("/_files/"));
    expect(pdfs).toHaveLength(8);
    for (const [, to] of pdfs) expect(to).toMatch(/^\/docs\/.+\.pdf$/);
  });
});
