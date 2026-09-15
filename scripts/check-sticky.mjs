/**
 * Verifies the sticky header and mobile tab bar stay pinned after scrolling.
 * `overflow-x: hidden` on body can silently break `position: sticky`, so this
 * asserts the behaviour rather than trusting it.
 *
 *   node scripts/check-sticky.mjs [baseUrl]
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch({ channel: "msedge" });
const failures = [];

for (const viewport of [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });

  const header = page.locator("header").first();
  const before = await header.boundingBox();
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(400);
  const after = await header.boundingBox();

  const scrolled = await page.evaluate(() => window.scrollY);
  if (scrolled < 500) failures.push(`${viewport.name}: page did not scroll (scrollY=${scrolled})`);
  if (!after || Math.abs(after.y - (before?.y ?? 0)) > 2) {
    failures.push(
      `${viewport.name}: header not sticky — y ${before?.y} → ${after?.y}`,
    );
  }

  if (viewport.name === "mobile") {
    const bar = page.locator('nav[aria-label="Quick access"]');
    if ((await bar.count()) > 0) {
      const box = await bar.boundingBox();
      const height = viewport.height;
      if (!box || box.y + box.height < height - 2) {
        failures.push(`mobile: tab bar not pinned to bottom (y=${box?.y})`);
      }
    } else {
      failures.push("mobile: tab bar not found");
    }
  }

  console.log(`✓ ${viewport.name}`);
  await context.close();
}

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} issue(s):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}
console.log("\nSticky header and mobile tab bar hold after scroll.");
