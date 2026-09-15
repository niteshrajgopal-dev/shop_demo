/**
 * Screenshots every surface across the viewport matrix in DESIGN-MANIFEST.json
 * and fails if any page overflows horizontally or logs a console error.
 *
 *   node scripts/shots.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "design/verification";

const VIEWPORTS = [
  { name: "mobile-compact", width: 360, height: 800 },
  { name: "mobile-standard", width: 390, height: 844 },
  { name: "mobile-large", width: 430, height: 932 },
  { name: "foldable", width: 600, height: 960 },
  { name: "tablet-portrait", width: 820, height: 1180 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1366, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

const ROUTES = [
  ["home", "/"],
  ["shop", "/shop"],
  ["product", "/shop/ethiopia-yirgacheffe"],
  ["menu", "/menu"],
  ["order", "/order"],
  ["loyalty", "/loyalty"],
  ["journal", "/journal"],
  ["article", "/journal/the-second-cup-rule"],
  ["locations", "/locations"],
  ["checkout", "/checkout"],
  ["ds-overview", "/design-system"],
  ["ds-foundations", "/design-system/foundations"],
  ["ds-components", "/design-system/components"],
  ["ds-patterns", "/design-system/patterns"],
];

// Full matrix only where layout risk is highest; the rest get key breakpoints.
const FULL_MATRIX = new Set(["home", "menu", "product", "order"]);
const KEY = new Set(["mobile-standard", "tablet-portrait", "desktop"]);

const failures = [];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });

for (const [label, route] of ROUTES) {
  const viewports = FULL_MATRIX.has(label)
    ? VIEWPORTS
    : VIEWPORTS.filter((viewport) => KEY.has(viewport.name));

  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(350);

    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      const offenders = [];
      if (doc.scrollWidth > doc.clientWidth + 1) {
        for (const element of document.querySelectorAll("body *")) {
          const rect = element.getBoundingClientRect();
          if (rect.width === 0) continue;
          if (rect.right > doc.clientWidth + 1 || rect.left < -1) {
            const style = getComputedStyle(element);
            // Horizontal rails are intentionally scrollable.
            if (style.overflowX === "auto" || style.overflowX === "scroll") continue;
            offenders.push(
              `${element.tagName.toLowerCase()}.${String(element.className).slice(0, 60)} → ${Math.round(rect.left)}..${Math.round(rect.right)}`,
            );
          }
        }
      }
      return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders: offenders.slice(0, 5) };
    });

    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      failures.push(
        `OVERFLOW ${label} @ ${viewport.name}: ${overflow.scrollWidth} > ${overflow.clientWidth}\n    ${overflow.offenders.join("\n    ")}`,
      );
    }
    if (consoleErrors.length > 0) {
      failures.push(`CONSOLE ${label} @ ${viewport.name}: ${consoleErrors.slice(0, 3).join(" | ")}`);
    }

    await page.screenshot({
      path: `${OUT}/${label}--${viewport.name}.png`,
      fullPage: viewport.name === "desktop",
    });
    await context.close();
  }
  console.log(`✓ ${label}`);
}

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} issue(s):\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("\nNo horizontal overflow and no console errors across the matrix.");
