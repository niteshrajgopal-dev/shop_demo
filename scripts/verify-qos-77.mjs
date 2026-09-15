/**
 * QOS-77 visual verification — desktop/mobile hero + reduced-motion path.
 *
 *   node scripts/verify-qos-77.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "design/verification/qos-77";

const shots = [
  { name: "desktop-1440", width: 1440, height: 900, reducedMotion: false },
  { name: "tablet-1024", width: 1024, height: 768, reducedMotion: false },
  { name: "mobile-390", width: 390, height: 844, reducedMotion: false },
  { name: "desktop-reduced-motion", width: 1440, height: 900, reducedMotion: true },
  { name: "mobile-reduced-motion", width: 390, height: 844, reducedMotion: true },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const failures = [];

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: shot.width, height: shot.height },
    reducedMotion: shot.reducedMotion ? "reduce" : "no-preference",
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("401 (Unauthorized)")) return;
    consoleErrors.push(text);
  });
  page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(shot.reducedMotion ? 900 : 2200);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  if (overflow.scrollWidth > overflow.clientWidth + 1) {
    failures.push(`OVERFLOW ${shot.name}: ${overflow.scrollWidth} > ${overflow.clientWidth}`);
  }
  if (consoleErrors.length > 0) {
    failures.push(`CONSOLE ${shot.name}: ${consoleErrors.slice(0, 3).join(" | ")}`);
  }

  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.width >= 1024 });
  await context.close();
  console.log(`✓ ${shot.name}`);
}

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} issue(s):\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(`\nQOS-77 verification screenshots saved to ${OUT}/`);
