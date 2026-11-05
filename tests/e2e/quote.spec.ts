import { expect, test } from "@playwright/test";

// Stores a real lead (name "Prueba E2E"), so it runs only when asked: E2E_WRITE=1. Needs Turnstile test keys
// (or none) on the target site. Delete the lead afterwards from Leads.
test.skip(!process.env.E2E_WRITE, "set E2E_WRITE=1 to send a test quote request");

test("a visitor sends a quote request and gets a reference", async ({ page }) => {
  await page.goto("/es/cotizar");
  const form = page.locator("form").filter({ hasText: "Enviar solicitud" }).or(page.locator("form").filter({ hasText: "Continuar" })).first();
  await form.getByRole("button", { name: /Tubería/ }).first().click();
  await form.getByRole("button", { name: "Continuar" }).click();
  await form.getByRole("button", { name: "1–10" }).click();
  await form.getByRole("button", { name: /En nuestra base/ }).click();
  await form.getByRole("button", { name: "Continuar" }).click();
  await form.getByLabel(/Nombre y apellido/).fill("Prueba E2E");
  await form.getByLabel(/Correo electrónico/).fill("prueba-e2e@example.com");
  await form.getByRole("checkbox").check();
  // Turnstile's test key passes on its own after a moment.
  await page.waitForTimeout(3000);
  await form.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page).toHaveURL(/\/es\/gracias$/, { timeout: 30_000 });
  await expect(page.getByText("¡Solicitud recibida!").first()).toBeVisible();
  await expect(page.getByText(/TI-[A-Z0-9]{8}/).first()).toBeVisible();
});
