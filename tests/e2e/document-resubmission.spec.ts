import { test, expect } from "./fixtures";
import {
  makeApplicant,
  applicationApiPayload,
  generateApplicationNumber,
  deleteApplication,
  tinyJpegBuffer,
} from "./fixtures";

/**
 * Step 3 document review failed → the applicant re-uploads their complete
 * document set from the Track page.
 *
 * The assertion that matters is the last one: the replacement files must be in
 * Postgres afterwards. The pre-fix flow uploaded to Cloudinary and rewrote React
 * state only, so the new documents looked accepted to the applicant and never
 * reached staff at all.
 *
 * The fixture applicant is female, so the military exemption is not part of the
 * set (see REQUIRED_DOC_TYPES in fixtures.ts) — five required slots, plus the two
 * optional ones the modal always offers. The criminal record check is not among
 * them any more: it became a consent tick on the application form.
 */
const REQUIRED_SLOTS = 5;
const OPTIONAL_SLOTS = 2;

test("re-uploads the whole document set after a failed document review", async ({ page, request }) => {
  const applicant = makeApplicant(4);
  const applicationNumber = generateApplicationNumber(4);

  // Generous timeout: the server awaits a real SMTP send on this request.
  const createRes = await request.post("/api/applications", {
    data: applicationApiPayload(applicant, applicationNumber),
    timeout: 60_000,
  });
  expect(createRes.ok(), await createRes.text()).toBeTruthy();
  const created = await createRes.json();
  const password: string = created.password;
  expect(password).toBeTruthy();

  try {
    // ---- Staff fail the document review ----
    const patchRes = await request.patch("/api/applications", {
      data: {
        id: applicationNumber,
        status: "REJECTED",
        remarks: "Attached documents are incomplete. Please submit a new set.",
      },
      timeout: 30_000,
    });
    expect(patchRes.ok(), await patchRes.text()).toBeTruthy();

    // ---- Applicant opens their status ----
    await page.goto("/track");
    await page.locator("#nationalId").fill(applicationNumber);
    await page.locator("#password").fill(password);
    await page.locator('form button[type="submit"]').click();

    const openBtn = page.getByRole("button", { name: /Re-upload All Documents/i });
    await expect(openBtn).toBeVisible({ timeout: 30_000 });
    await expect(openBtn).toContainText(`(${REQUIRED_SLOTS})`);
    await openBtn.click();

    const inputs = page.locator('input[type="file"]:visible');
    await expect(inputs).toHaveCount(REQUIRED_SLOTS + OPTIONAL_SLOTS);

    // Nothing can be submitted until every required slot is filled.
    const submitBtn = page.getByRole("button", { name: /Confirm & Submit All Documents/i });
    await expect(submitBtn).toBeDisabled();

    for (let i = 0; i < REQUIRED_SLOTS; i++) {
      await inputs.nth(i).setInputFiles({
        name: `document-${i}.jpg`,
        mimeType: "image/jpeg",
        buffer: tinyJpegBuffer(),
      });
    }
    await expect(submitBtn).toBeEnabled();

    const saved = page.waitForResponse(
      (r) => r.url().includes("/api/track/documents") && r.request().method() === "POST",
      { timeout: 120_000 }
    );
    page.once("dialog", (d) => d.accept());
    await submitBtn.click();

    const response = await saved;
    expect(response.status(), await response.text()).toBe(200);

    // Review is open again, so the failed-review panel is gone from the page.
    await expect(openBtn).toHaveCount(0, { timeout: 60_000 });

    // ---- The replacement really is in the database ----
    const trackRes = await request.post("/api/track", {
      data: { query: applicationNumber, password },
      timeout: 30_000,
    });
    expect(trackRes.ok(), await trackRes.text()).toBeTruthy();
    const tracked = await trackRes.json();
    const app = tracked.applications[0];

    expect(app.status).toBe("DOCS_UNDER_REVIEW");
    expect(app.documents).toHaveLength(REQUIRED_SLOTS);
    // Every placeholder the fixture seeded has been superseded by a real upload.
    expect(app.documents.some((d: any) => d.secureUrl.includes("example.invalid"))).toBeFalsy();
    // A replacement always re-enters the queue unreviewed.
    expect(app.documents.every((d: any) => !d.isVerified && !d.isRejected)).toBeTruthy();
  } finally {
    await deleteApplication(request, applicationNumber);
  }
});
