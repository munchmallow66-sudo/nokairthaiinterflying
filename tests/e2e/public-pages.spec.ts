import { test, expect } from "./fixtures";

// Static/informational pages: no backend calls, just verify they render.
const STATIC_PAGES: Array<{ path: string; heading: RegExp }> = [
  { path: "/", heading: /Thai Inter Flying|TIF|Nok Air|Cadet Pilot/i },
  { path: "/about", heading: /./ },
  { path: "/admission", heading: /./ },
  { path: "/courses", heading: /./ },
  { path: "/gallery", heading: /./ },
  { path: "/pilot-career", heading: /./ },
];

for (const { path } of STATIC_PAGES) {
  test(`static page loads: ${path}`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    // Every public page renders at least one heading and the shared navbar.
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator("nav").first()).toBeVisible();
  });
}

test("admission and courses pages link to /apply", async ({ page }) => {
  await page.goto("/admission");
  await expect(page.getByRole("link", { name: /begin|apply/i }).first()).toHaveAttribute(
    "href",
    "/apply"
  );

  await page.goto("/courses");
  await expect(page.getByRole("link", { name: /apply/i }).first()).toHaveAttribute("href", "/apply");
});

test("contact inquiry form: fill and submit shows client-side confirmation", async ({ page }) => {
  await page.goto("/contact");

  await page.getByPlaceholder("Somchai Jaidee").fill("Playwright Tester");
  await page.getByPlaceholder("0812345678").fill("0812345678");
  await page.getByPlaceholder("somchai@example.com").fill("watchara47114145@gmail.com");
  await page.getByPlaceholder("Type your inquiry details...").fill("Automated Playwright test inquiry.");

  await page.getByRole("button", { name: /submit inquiry/i }).click();

  await expect(page.getByText(/thank you|success/i).first()).toBeVisible();
  const resetButton = page.getByRole("button", { name: /send another inquiry/i });
  await expect(resetButton).toBeVisible();

  // Resetting clears the form back to its initial (empty) state.
  await resetButton.click();
  await expect(page.getByPlaceholder("Somchai Jaidee")).toHaveValue("");
});

test("track and apply entry pages render without submitting anything", async ({ page }) => {
  await page.goto("/track");
  await expect(page.locator("#nationalId")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();

  await page.goto("/apply");
  await expect(page.getByRole("button", { name: /next step/i })).toBeVisible();
});
