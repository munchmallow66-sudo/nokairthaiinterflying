import { test, expect } from "./fixtures";

/**
 * Logs in with the real admin bypass credential hard-coded in
 * app/api/auth/admin-login/route.ts (admin@tif.ac.th / !Admin_TIF@8649.),
 * then walks every /admin/* page to confirm middleware.ts + AdminAuthGuard
 * let an authenticated officer through instead of redirecting to /admin/login.
 */
test("admin can log in and reach every admin section", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator('input[type="email"]').fill("admin@tif.ac.th");
  await page.locator('input[type="password"]').fill("!Admin_TIF@8649.");
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("**/admin");
  await expect(page.getByText("Verifying Officer Credentials...")).toBeHidden({ timeout: 15_000 });
  await expect(page.locator('nav a[href="/admin/applications"]')).toBeVisible();

  const sections = [
    "/admin/applications",
    "/admin/payments",
    "/admin/interviews",
    "/admin/announcements",
    "/admin/settings",
  ];

  for (const path of sections) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/") + "$"));
    await expect(page.locator("h1").first()).toBeVisible();
  }

  // /admin/crm has no page of its own — it always redirects into Applications.
  await page.goto("/admin/crm");
  await expect(page).toHaveURL(/\/admin\/applications$/);
});

test("unauthenticated visitors are redirected away from admin pages", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/admin/applications");
  await expect(page).toHaveURL(/\/admin\/login$/);
});
