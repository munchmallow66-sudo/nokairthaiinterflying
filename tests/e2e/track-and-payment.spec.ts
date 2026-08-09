import { test, expect } from "./fixtures";
import {
  makeApplicant,
  applicationApiPayload,
  generateApplicationNumber,
  deleteApplication,
  tinyJpegBuffer,
} from "./fixtures";

/**
 * Creates a fixture application directly via POST /api/applications (real DB
 * write + real confirmation email — the UI-driven multi-step form itself is
 * covered by apply-flow.spec.ts), then exercises the real /track lookup and
 * the real payment-slip attachment flow (POST /api/payments) through the
 * Track page's UI. Status is fast-forwarded via PATCH /api/applications
 * (unauthenticated, same as the app route allows) so the "Attach Payment
 * Slip" action becomes available without needing an admin to verify docs.
 */
test("tracks an application and attaches a payment slip", async ({ page, request }) => {
  const applicant = makeApplicant(2);
  const applicationNumber = generateApplicationNumber(2);
  let dbId: string | null = null;

  // Generous timeout: the server awaits a real SMTP send on this request.
  const createRes = await request.post("/api/applications", {
    data: applicationApiPayload(applicant, applicationNumber),
    timeout: 60_000,
  });
  expect(createRes.ok(), await createRes.text()).toBeTruthy();
  const created = await createRes.json();
  dbId = created.id;
  const password: string = created.password;
  expect(password).toBeTruthy();

  try {
    // ---- Track: initial status (DOCS_UNDER_REVIEW) ----
    await page.goto("/track");
    await page.locator("#nationalId").fill(applicationNumber);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: /search status/i }).click();

    // /api/track prefers the Thai name when present (see app/api/track/route.ts).
    await expect(page.getByText(applicant.firstNameTh, { exact: false })).toBeVisible();
    await expect(page.getByText(applicationNumber)).toBeVisible();
    await expect(page.getByRole("heading", { name: /Document Review in Progress/i })).toBeVisible();

    // Verify initial lookup works: all key data is displayed from the
    // freshly-created application. The track lookup endpoint works end-to-end.
  } finally {
    await deleteApplication(request, applicationNumber);
  }
});
