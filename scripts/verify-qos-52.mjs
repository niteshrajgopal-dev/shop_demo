/**
 * QOS-52 acceptance verification against deployed dev storefronts.
 *
 *   node scripts/verify-qos-52.mjs
 */

const API_BASE =
  process.env.QOS_API_BASE_URL ??
  "https://ca-qos-dev-api.gentleplant-cc8574e8.uaenorth.azurecontainerapps.io";
const QUOTES = "https://quotes.dev.qosapp.com";
const FLOWERS = "https://flowers.dev.qosapp.com";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchText(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  return { response, text };
}

console.log("QOS-52 verification");

{
  const { response, text } = await fetchText(`${QUOTES}/menu`);
  check(response.ok, `quotes menu expected 200, got ${response.status}`);
  check(text.includes("HBZ Stadium") || text.includes("Quotes"), "quotes menu missing tenant branding");
  console.log("  · quotes menu ok");
}

{
  const { response, text } = await fetchText(`${FLOWERS}/menu`);
  check(response.ok, `flowers menu expected 200, got ${response.status}`);
  check(text.includes("Classic Rose Bouquet"), "flowers menu missing Classic Rose Bouquet");
  check(text.includes("Flowers"), "flowers menu missing Flowers brand");
  console.log("  · flowers menu ok");
}

{
  const { response, text } = await fetchText(`${FLOWERS}/`);
  check(response.ok, `flowers home expected 200, got ${response.status}`);
  check(
    text.includes("Shop collections") || text.includes("/hero/bouquet"),
    "flowers home missing Floréa hero",
  );
  console.log("  · flowers home ok");
}

{
  const url = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  url.searchParams.set("host", "unconfigured.dev.qosapp.com");
  url.searchParams.set("contractVersion", "1");
  const response = await fetch(url);
  check(response.status === 404, `unknown manifest host expected 404, got ${response.status}`);
  console.log("  · unknown manifest host returns 404");
}

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nAll QOS-52 checks passed.");
