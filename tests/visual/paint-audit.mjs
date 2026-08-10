/**
 * Counts the WebKit-expensive paint properties actually present in the live
 * DOM of each public route, and the on-screen area they cover. Safari pays for
 * these per frame, so total blurred/blended area is a far better proxy for
 * "Safari feels slow" than rAF cadence in a headless compositor.
 *
 *   node paint-audit.mjs <label>
 */
import { chromium } from "@playwright/test";
import * as fs from "fs";

const BASE = process.env.PLAYWRIGHT_URL || "http://localhost:3000";
const ROUTES = ["/", "/contact", "/pay", "/track", "/apply"];
const label = process.argv[2] || "run";

const AUDIT = `(function () {
  var out = {
    backdropFilter: 0, backdropArea: 0,
    blurFilter: 0, blurArea: 0, blurRadiusArea: 0,
    blendMode: 0, blendArea: 0,
    willChange: 0,
    preserve3d: 0,
    nodes: 0
  };
  var els = document.querySelectorAll("*");
  out.nodes = els.length;
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    var cs = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var area = Math.max(0, r.width) * Math.max(0, r.height);

    var bf = cs.backdropFilter || cs.webkitBackdropFilter;
    if (bf && bf !== "none") { out.backdropFilter++; out.backdropArea += area; }

    if (cs.filter && cs.filter.indexOf("blur(") !== -1) {
      out.blurFilter++;
      out.blurArea += area;
      var m = /blur\\(([0-9.]+)px\\)/.exec(cs.filter);
      // Gaussian cost scales with area * radius: a 150px blur over a 700px box
      // is orders of magnitude worse than a 4px blur over a button.
      if (m) out.blurRadiusArea += area * parseFloat(m[1]);
    }

    if (cs.mixBlendMode && cs.mixBlendMode !== "normal") { out.blendMode++; out.blendArea += area; }
    if (cs.willChange && cs.willChange !== "auto") out.willChange++;
    if (cs.transformStyle === "preserve-3d") out.preserve3d++;
  }
  return out;
})()`;

const DEVICES = [
  { name: "desktop", viewport: { width: 1440, height: 900 }, hasTouch: false, isMobile: false },
  { name: "mobile", viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
];

const browser = await chromium.launch();
const results = {};

for (const dev of DEVICES) {
  const ctx = await browser.newContext(dev);
  const page = await ctx.newPage();
  console.log(`\n[${dev.name}]`);

  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load", timeout: 90_000 }).catch(() => {});
    await page.waitForTimeout(3000);
    await page.keyboard.press("Escape").catch(() => {});
    // Scroll the whole page so every ScrollReveal has settled: will-change that
    // is still set after the reveal finished is a layer kept alive for nothing.
    await page.evaluate(`(async function () {
      var step = window.innerHeight;
      for (var y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise(function (r) { setTimeout(r, 150); });
      }
      window.scrollTo(0, 0);
    })()`);
    await page.waitForTimeout(1500);

    const a = await page.evaluate(AUDIT);
    results[`${route} ${dev.name}`] = a;
    console.log(
      `${route.padEnd(10)} backdrop=${String(a.backdropFilter).padStart(2)} (${(a.backdropArea / 1e6).toFixed(2)}Mpx)  ` +
        `blur=${String(a.blurFilter).padStart(2)} (${(a.blurArea / 1e6).toFixed(2)}Mpx, cost=${(a.blurRadiusArea / 1e6).toFixed(0)})  ` +
        `blend=${String(a.blendMode).padStart(2)} (${(a.blendArea / 1e6).toFixed(2)}Mpx)  ` +
        `willChange=${String(a.willChange).padStart(3)}  preserve3d=${String(a.preserve3d).padStart(3)}`
    );
  }

  await ctx.close();
}

const outDir = `${process.cwd()}/screenshots/${label}`;
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/paint-audit.json`, JSON.stringify(results, null, 2) + "\n");
await browser.close();
