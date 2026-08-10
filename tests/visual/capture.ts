/**
 * Visual baseline capture for the Safari/WebKit performance work.
 *
 * Captures every public route at desktop (1440px) and mobile (390px) into
 * screenshots/<phase>/. Run once per phase (before, step1, step2, step3) so
 * each change can be diffed against the previous phase.
 *
 *   npx tsx tests/visual/capture.ts before
 *
 * Two variants per page/viewport:
 *   *.png        animations disabled — Playwright fast-forwards finite
 *                animations to completion and resets infinite ones to their
 *                initial state. Deterministic, so a pixel diff between phases
 *                means a real layout/paint change, not animation phase noise.
 *   *.anim.png   animations left running, captured after a settle delay. Not
 *                deterministic, but it is the only record of what the infinite
 *                animations (orb pulse, gold shimmer, mascot float) actually
 *                look like — needed to judge the step 2 background proposals.
 */
import { chromium, type Browser, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = process.env.PLAYWRIGHT_URL || "http://localhost:3000";

const ROUTES = [
  { slug: "home", url: "/" },
  { slug: "about", url: "/about" },
  { slug: "admission", url: "/admission" },
  { slug: "contact", url: "/contact" },
  { slug: "courses", url: "/courses" },
  { slug: "gallery", url: "/gallery" },
  { slug: "pay", url: "/pay" },
  { slug: "pilot-career", url: "/pilot-career" },
  { slug: "track", url: "/track" },
  // Outside the (public) route group so it does not get the ambient background
  // layer, but it does share globals.css — so the step 3 font change hits it.
  { slug: "apply", url: "/apply" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

/**
 * The homepage opens an announcement modal on mount. It covers the page and
 * would hide everything behind it, so dismiss it before capturing.
 */
async function dismissOverlays(page: Page) {
  const closers = [
    page.getByRole("button", { name: /close|ปิด|dismiss/i }),
    page.locator("[aria-label*='lose' i]"),
  ];
  for (const c of closers) {
    try {
      const n = await c.count();
      for (let i = 0; i < n; i++) {
        const el = c.nth(i);
        if (await el.isVisible({ timeout: 500 }).catch(() => false)) {
          await el.click({ timeout: 2000 }).catch(() => {});
        }
      }
    } catch {
      /* no overlay on this page */
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function capture(browser: Browser, phase: string) {
  const outDir = path.join(process.cwd(), "screenshots", phase);
  fs.mkdirSync(outDir, { recursive: true });

  const manifest: Record<string, { bytes: number; scrollHeight: number }> = {};

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      // Pin these so text metrics can't drift between runs and get mistaken
      // for a font regression in step 3.
      locale: "en-US",
      timezoneId: "Asia/Bangkok",
      reducedMotion: "no-preference",
    });
    const page = await ctx.newPage();

    for (const route of ROUTES) {
      const label = `${route.slug}-${vp.name}`;
      try {
        await page.goto(BASE + route.url, {
          waitUntil: "networkidle",
          timeout: 60_000,
        });
      } catch {
        // networkidle can hang on a dev server with an open HMR socket; the
        // DOM is usually there anyway, so fall through and capture what exists.
      }

      await dismissOverlays(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      // Let scroll-triggered reveal animations fire and finite intro
      // animations run their course.
      await page.waitForTimeout(2500);

      // Scroll the full page once so IntersectionObserver-driven ScrollReveal
      // content is mounted, otherwise the full-page shot captures blank gaps.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);

      const scrollHeight = await page.evaluate(
        () => document.documentElement.scrollHeight
      );

      const deterministic = path.join(outDir, `${label}.png`);
      await page.screenshot({
        path: deterministic,
        fullPage: true,
        animations: "disabled",
      });

      const animated = path.join(outDir, `${label}.anim.png`);
      await page.screenshot({
        path: animated,
        fullPage: true,
        animations: "allow",
      });

      manifest[label] = {
        bytes: fs.statSync(deterministic).size,
        scrollHeight,
      };
      console.log(
        `  ${label.padEnd(26)} h=${String(scrollHeight).padStart(6)}px  ${(
          manifest[label].bytes / 1024
        ).toFixed(0)}KB`
      );
    }

    await ctx.close();
  }

  fs.writeFileSync(
    path.join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  return manifest;
}

async function main() {
  const phase = process.argv[2];
  if (!phase) {
    console.error("usage: capture.ts <phase>   e.g. before | step1 | step2");
    process.exit(1);
  }
  console.log(`Capturing phase "${phase}" against ${BASE}`);
  const browser = await chromium.launch();
  try {
    await capture(browser, phase);
  } finally {
    await browser.close();
  }
  console.log(`Done -> screenshots/${phase}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
