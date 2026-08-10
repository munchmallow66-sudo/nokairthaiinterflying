/**
 * Diagnostic for the Google Fonts loading bug.
 *
 * Reports whether the @import in globals.css actually produced a network
 * request to fonts.googleapis.com and whether Inter/Cinzel ended up in
 * document.fonts, or whether the browser dropped the rule and fell back to
 * system fonts. Used to verify the step 3 fix.
 *
 *   node tests/visual/font-audit.js [url]
 */
const { chromium } = require("@playwright/test");

const URL = process.argv[2] || "http://localhost:3000/about";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const fontRequests = [];
  page.on("request", (r) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(r.url())) fontRequests.push(r.url());
  });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const faces = [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`);
    const sheets = [...document.styleSheets].map((s) => {
      const entry = { href: s.href ? s.href.split("/").pop() : "(inline)" };
      try {
        entry.ruleCount = s.cssRules.length;
        entry.imports = [];
        for (const r of s.cssRules) {
          if (r.type === CSSRule.IMPORT_RULE) {
            entry.imports.push({ href: r.href, resolved: !!r.styleSheet });
          }
        }
      } catch {
        entry.ruleCount = "cross-origin";
      }
      return entry;
    });

    // Measure a known string in the display font. If Cinzel loaded, the width
    // differs from the generic serif fallback.
    const probe = document.createElement("span");
    probe.textContent = "THAI INTER FLYING 0123456789";
    probe.style.cssText =
      "position:absolute;visibility:hidden;white-space:nowrap;font-size:48px;";
    document.body.appendChild(probe);
    // "NoSuchFontXYZ" is the control: an unresolvable family falls back to the
    // document default. A candidate that measures the same as the control did
    // not load. Comparing against "serif"/"sans-serif" instead would give a
    // false positive whenever the default happens to differ from the generic.
    const widths = {};
    for (const f of ["Cinzel", "Inter", "NoSuchFontXYZ", "serif", "sans-serif"]) {
      probe.style.fontFamily = `"${f}"`;
      widths[f] = probe.getBoundingClientRect().width;
    }
    probe.remove();

    const h1 = document.querySelector("h1");
    return {
      documentFonts: faces,
      documentFontsCount: document.fonts.size,
      sheets,
      widths,
      h1FontFamily: h1 ? getComputedStyle(h1).fontFamily : null,
      bodyFontFamily: getComputedStyle(document.body).fontFamily,
    };
  });

  console.log(`\nURL: ${URL}`);
  console.log(`\nGoogle Fonts network requests: ${fontRequests.length}`);
  fontRequests.slice(0, 5).forEach((u) => console.log("  " + u));

  console.log(`\ndocument.fonts entries: ${info.documentFontsCount}`);
  info.documentFonts.slice(0, 10).forEach((f) => console.log("  " + f));

  console.log("\nStylesheets:");
  info.sheets.forEach((s) =>
    console.log(
      `  ${String(s.href).padEnd(28)} rules=${s.ruleCount}` +
        (s.imports && s.imports.length
          ? `  imports=${JSON.stringify(s.imports)}`
          : "")
    )
  );

  console.log(
    "\nText width probe @48px (same width as NoSuchFontXYZ => font NOT loaded):"
  );
  Object.entries(info.widths).forEach(([f, w]) =>
    console.log(`  ${f.padEnd(14)} ${Number(w).toFixed(2)}px`)
  );

  const control = info.widths.NoSuchFontXYZ;
  const cinzelLoaded = info.widths.Cinzel !== control;
  const interLoaded = info.widths.Inter !== control;
  console.log(`\nCinzel loaded: ${cinzelLoaded}`);
  console.log(`Inter  loaded: ${interLoaded}`);
  console.log(`h1   font-family: ${info.h1FontFamily}`);
  console.log(`body font-family: ${info.bodyFontFamily}\n`);

  await browser.close();
})();
