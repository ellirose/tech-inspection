// End-to-end tests (design document §19.4): navigation, redirects, SEO basics and the quote form, run in
// a real browser against a running site. E2E_BASE_URL picks it (default: local `npm run start`).
// `npm run test:e2e`; the quote test stores a lead, so it runs only with E2E_WRITE=1.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }, grepInvert: /@phone/ },
    { name: "phone", use: { ...devices["Pixel 7"] }, grep: /@phone/ },
  ],
});
