/**
 * End-to-end smoke test of the money path: browse → configure → bag →
 * checkout → confirmation, plus loyalty accrual and cart persistence.
 *
 *   node scripts/smoke.mjs [baseUrl]
 */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3100";
const browser = await chromium.launch({ channel: "msedge" });
const failures = [];
const step = (name) => console.log(`  · ${name}`);

function check(condition, message) {
  if (!condition) failures.push(message);
}

// ---------------------------------------------------------------- desktop buy
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE}/shop/ethiopia-yirgacheffe`, { waitUntil: "networkidle" });
  step("product page loaded");

  // Radios are visually hidden inside their labels, so click the label the way
  // a real user does.
  const choice = (legend, text) =>
    page.locator(`label:has(input[name="${legend}"])`).filter({ hasText: text }).first();

  await choice("Bag size", "1kg").click();
  await choice("Grind", "Filter").click();
  await page.getByRole("button", { name: /^increase/i }).first().click();
  await page.getByRole("button", { name: /add to bag/i }).click();
  step("added coffee to bag");

  await page.waitForTimeout(500);
  const badge = await page.locator("header").getByText("2", { exact: true }).count();
  check(badge > 0, "header cart badge did not show 2 items");

  // Cart must survive a reload (localStorage persistence).
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  check(
    (await page.locator("header").getByText("2", { exact: true }).count()) > 0,
    "cart did not persist across reload",
  );
  step("cart persisted across reload");

  await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });

  // The submit label depends on payment method: "Place order" or "Pay $X".
  const submit = page.getByRole("button", { name: /place order|^pay\s/i });

  // Empty-field submit must be blocked by validation.
  await submit.click();
  await page.waitForTimeout(400);
  check(
    page.url().includes("/checkout"),
    "checkout submitted with empty required fields",
  );
  check(
    (await page.locator("[role=alert], [aria-invalid=true]").count()) > 0,
    "no validation feedback on empty checkout submit",
  );
  step("checkout validation blocks empty submit");

  await page.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page.getByLabel("Mobile", { exact: true }).fill("+64 21 555 0100");
  const card = page.getByLabel("Card number", { exact: true });
  if ((await card.count()) > 0) {
    await card.fill("4242424242424242");
    await page.getByLabel("Expiry", { exact: true }).fill("12/29");
    await page.getByLabel("CVC", { exact: true }).fill("123");
  }
  await submit.click();

  await page.waitForURL(/\/orders\//, { timeout: 15000 });
  step(`confirmation reached: ${new URL(page.url()).pathname}`);

  // The confirmation greets by first name only, by design.
  const body = await page.locator("body").innerText();
  check(/thanks, ada/i.test(body), "confirmation did not greet the customer");
  check(/QT-[A-Z0-9]+/.test(body), "confirmation missing order reference");

  // Bag should be empty again after a successful order.
  await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const afterOrder = await page.locator("body").innerText();
  check(/empty|nothing in your bag/i.test(afterOrder), "cart not cleared after order");
  step("bag cleared after order");

  await context.close();
}

// ------------------------------------------------------------- mobile ordering
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE}/order`, { waitUntil: "networkidle" });

  // Advance must stay disabled until a café is chosen.
  const advance = page.getByRole("button", { name: /choose drinks/i });
  check(await advance.isDisabled(), "order flow allowed advancing with no café chosen");

  await page.locator("button[aria-pressed]").first().click();
  await page.waitForTimeout(300);
  check(await advance.isEnabled(), "advance stayed disabled after choosing a café");
  await advance.click();
  await page.waitForTimeout(500);

  check(
    /what are you having/i.test(await page.locator("body").innerText()),
    "order flow did not advance to the menu step",
  );
  step("order flow gates on café then advances to menu");
  await context.close();
}

// -------------------------------------------------------------------- loyalty
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));

  await page.goto(`${BASE}/loyalty`, { waitUntil: "networkidle" });
  const join = page.getByRole("button", { name: /open my bean card/i });

  // Joining requires a real name.
  await join.click();
  await page.waitForTimeout(300);
  check(
    (await page.locator("[role=alert]").count()) > 0,
    "loyalty join accepted an empty name",
  );

  await page.getByLabel("Your name", { exact: true }).fill("Grace Hopper");
  await join.click();
  await page.waitForTimeout(600);

  const text = await page.locator("body").innerText();
  check(/grace hopper/i.test(text), "bean card did not show the member name");
  check(/stamp/i.test(text), "loyalty card did not render after joining");
  step("loyalty validates name then opens bean card");
  await context.close();
}

await browser.close();

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}
console.log("\nCore flows pass: purchase, persistence, validation, ordering, loyalty.");
