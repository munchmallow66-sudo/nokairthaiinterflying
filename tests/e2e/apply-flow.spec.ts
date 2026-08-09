import { test, expect } from "./fixtures";
import { makeApplicant, tinyJpegBuffer, REQUIRED_DOC_TYPES, deleteApplication } from "./fixtures";

/**
 * Drives the real 8-step /apply form end to end: real Cloudinary uploads via
 * /api/upload, then a real POST /api/applications that writes to the Neon DB
 * and sends a real confirmation email. The created record is deleted via
 * DELETE /api/applications in the finally-block below either way.
 */
test("submits a complete application through the 8-step form", async ({ page, request }) => {
  const applicant = makeApplicant(1);
  let applicationNumber: string | null = null;

  try {
    await page.goto("/apply");

    // ---- Step 1: Personal Information ----
    await page.locator('select[name="title"]').selectOption("Ms.");
    await page.locator('input[name="firstNameTh"]').fill(applicant.firstNameTh);
    await page.locator('input[name="lastNameTh"]').fill(applicant.lastNameTh);
    await page.locator('input[name="firstNameEn"]').fill(applicant.firstNameEn);
    await page.locator('input[name="lastNameEn"]').fill(applicant.lastNameEn);
    await page.locator('input[name="nickname"]').fill(applicant.nickname);
    await page.locator('select[name="gender"]').selectOption("Female");
    await page.locator('input[name="birthday"]').fill(applicant.birthday);
    await page.locator('input[name="age"]').fill(applicant.age);
    await page.locator('input[name="nationalId"]').fill(applicant.nationalId);
    await page.locator('input[name="phone"]').fill(applicant.phone);
    await page.locator('input[name="email"]').fill(applicant.email);

    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 2: Address ----
    await expect(page.getByRole("heading", { name: /Step 2/ })).toBeVisible();
    await page.locator('textarea[name="currentAddress"]').fill(applicant.currentAddress);
    await page.locator('input[name="province"]').fill(applicant.province);
    await page.locator('input[name="district"]').fill(applicant.district);
    await page.locator('input[name="subdistrict"]').fill(applicant.subdistrict);
    await page.locator('input[name="postalCode"]').fill(applicant.postalCode);
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 3: Education ----
    await expect(page.getByRole("heading", { name: /Step 3/ })).toBeVisible();
    await page.locator('input[name="university"]').fill(applicant.university);
    await page.locator('input[name="degree"]').fill(applicant.degree);
    await page.locator('input[name="gpax"]').fill(applicant.gpax);
    await page.locator('input[name="graduationYear"]').fill(applicant.graduationYear);
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 4: Emergency Contact ----
    await expect(page.getByRole("heading", { name: /Step 4/ })).toBeVisible();
    await page.locator('input[name="emergencyName"]').fill(applicant.emergencyName);
    await page.locator('input[name="relationship"]').fill(applicant.relationship);
    await page.locator('input[name="emergencyPhone"]').fill(applicant.emergencyPhone);
    await page.locator('textarea[name="emergencyAddress"]').fill(applicant.emergencyAddress);
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 5: Aviation Medical ----
    await expect(page.getByRole("heading", { name: /Step 5/ })).toBeVisible();
    await page.locator('input[name="height"]').fill(applicant.height);
    await page.locator('input[name="weight"]').fill(applicant.weight);
    await page.locator('select[name="bloodType"]').selectOption(applicant.bloodType);
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 6: English / Certificates (all optional) ----
    await expect(page.getByRole("heading", { name: /Step 6/ })).toBeVisible();
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 7: Employment (optional) ----
    await expect(page.getByRole("heading", { name: /Step 7/ })).toBeVisible();
    await page.getByRole("button", { name: /next step/i }).click();

    // ---- Step 8: Document Upload ----
    await expect(page.getByRole("heading", { name: /Step 8/ })).toBeVisible();
    const fileInputs = page.locator('input[type="file"]');
    await expect(fileInputs).toHaveCount(REQUIRED_DOC_TYPES.length + 1); // +1 for the optional "Other" slot

    for (let i = 0; i < REQUIRED_DOC_TYPES.length; i++) {
      const remainingBefore = REQUIRED_DOC_TYPES.length + 1 - i;
      const uploadResponse = page.waitForResponse(
        (res) => res.url().includes("/api/upload") && res.request().method() === "POST"
      );
      await fileInputs.first().setInputFiles({
        name: `${REQUIRED_DOC_TYPES[i].toLowerCase()}.jpg`,
        mimeType: "image/jpeg",
        buffer: tinyJpegBuffer(),
      });
      await uploadResponse;
      await expect(fileInputs).toHaveCount(remainingBefore - 1);
    }

    await expect(page.getByText(/All 6 documents uploaded successfully/i)).toBeVisible();

    const submitButton = page.getByRole("button", { name: /submit complete application/i });
    await expect(submitButton).toBeEnabled();

    // Generous timeout: the server awaits a real SMTP send on this request.
    const applicationResponse = page.waitForResponse(
      (res) => res.url().includes("/api/applications") && res.request().method() === "POST",
      { timeout: 60_000 }
    );
    await submitButton.click();
    const res = await applicationResponse;
    expect(res.ok()).toBeTruthy();

    // ---- Success screen ----
    await expect(page.getByText(/Application Submitted Successfully/i)).toBeVisible();
    const appNumberLocator = page.getByText(/^TIF-\d{4}-\d+$/);
    await expect(appNumberLocator).toBeVisible();
    applicationNumber = await appNumberLocator.textContent();

    await expect(page.getByRole("button", { name: /track application status/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /back to home/i })).toBeVisible();
  } finally {
    if (applicationNumber) {
      await deleteApplication(request, applicationNumber.trim());
    }
  }
});
