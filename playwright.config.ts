import { defineConfig, devices } from "@playwright/test";

/**
 * These tests run against the REAL dev server: real Neon Postgres DB, real
 * Cloudinary uploads, and real Office365 SMTP email sends. Every spec that
 * creates data cleans it up via DELETE /api/applications in its own teardown.
 * workers=1 because /api/auth/admin-login, /api/applications, and /api/track
 * share a single in-memory rate-limit bucket per client IP (see lib/rate-limit.ts).
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Generous: /api/applications awaits a real Office365 SMTP send on every
  // create, which can take well over the Playwright defaults on its own.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 45_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
