import { expect, test } from "@playwright/test";

const pages = [
  "/es",
  "/es/nosotros",
  "/es/metodos/ultrasonido",
  "/es/servicios/tuberia",
  "/es/industrias",
  "/es/industrias/perforacion-petroleo-y-gas",
  "/es/certificaciones",
  "/es/clientes",
  "/es/hseq",
  "/es/plataforma",
  "/es/preguntas-frecuentes",
  "/es/cotizar",
  "/es/contacto",
  "/es/portafolio",
  "/es/politica-de-privacidad",
  "/pt",
  "/en/servicios",
];

test.describe("pages and SEO basics", () => {
  for (const path of pages) {
    test(`${path} has one h1, a title, a description, a canonical and valid structured data`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      expect((await page.title()).length).toBeGreaterThan(10);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      expect(await page.locator('link[rel="canonical"]').getAttribute("href")).toContain(path === "/es" ? "/es" : path);
      for (const script of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(() => JSON.parse(script)).not.toThrow();
      expect(errors).toEqual([]);
    });
  }

  test("robots, sitemap and llms.txt are served", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/es/preguntas-frecuentes");
    expect(sitemap).toContain("/es/industrias/");
    expect(await (await request.get("/llms.txt")).text()).toMatch(/^# TECH-INSPECTION/);
  });

  test("security headers are sent", async ({ request }) => {
    const h = (await request.get("/es")).headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["permissions-policy"]).toBeTruthy();
  });
});

test.describe("redirects and not found", () => {
  test("old Wix pages and PDFs move permanently", async ({ request }) => {
    const page = await request.get("/tecnicas-de-inspeccion", { maxRedirects: 0 });
    expect(page.status()).toBe(308);
    expect(page.headers().location).toMatch(/\/es\/metodos$/);
    const pdf = await request.get("/_files/ugd/0b1bae_1030230d1a2c45a793871295f11bce04.pdf", { maxRedirects: 0 });
    expect(pdf.status()).toBe(308);
    expect(pdf.headers().location).toMatch(/\/docs\/PL-09-1-Politica-Proteccion-de-Datos\.pdf$/);
  });

  test("unknown addresses get the site's 404 page", async ({ page }) => {
    for (const path of ["/pagina-que-no-existe", "/es/pagina-que-no-existe"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByText("ERROR 404")).toBeVisible();
    }
  });
});

test.describe("navigation", () => {
  test("the Empresa menu opens and leads to the new pages", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: "Empresa" }).click();
    await page.getByRole("link", { name: /Industrias/ }).first().click();
    await expect(page).toHaveURL(/\/es\/industrias$/);
    await expect(page.getByRole("heading", { level: 1, name: /Industrias/ })).toBeVisible();
  });

  test("FAQ answers are in the page and open on click", async ({ page }) => {
    await page.goto("/es/preguntas-frecuentes");
    const first = page.locator("details").first();
    await expect(first).not.toHaveAttribute("open");
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open");
  });

  test("the phone menu lists every page @phone", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: "Menú" }).click();
    for (const name of ["Industrias", "Certificaciones", "Clientes", "Preguntas frecuentes", "Contacto"]) await expect(page.locator("aside nav").getByRole("link", { name })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test("the chat launcher opens the assistant", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("button", { name: "Abrir asistente" }).click();
    await expect(page.getByRole("dialog", { name: "Asistente Tech-Inspection" })).toBeVisible();
    await expect(page.getByText("Soy el asistente de Tech-Inspection")).toBeVisible();
  });
});
