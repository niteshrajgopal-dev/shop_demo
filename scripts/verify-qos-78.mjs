/**
 * QOS-78 acceptance verification against deployed dev storefronts.
 *
 *   node scripts/verify-qos-78.mjs
 */

const API_BASE =
  process.env.QOS_API_BASE_URL ??
  "https://ca-qos-dev-api.gentleplant-cc8574e8.uaenorth.azurecontainerapps.io";
const QUOTES = "https://quotes.dev.qosapp.com";
const FLOWERS = "https://flowers.dev.qosapp.com";
const AFD_CNAME = "qos-dev-storefront-e7hmd5bnbrbuf7d4.z02.azurefd.net";

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { response, text, json };
}

console.log("QOS-78 verification");

{
  const { response, json } = await fetchJson(`${FLOWERS}/api/health`);
  check(response.ok, `flowers health expected 200, got ${response.status}`);
  check(json?.status === "healthy", "flowers health missing healthy status");
  check(json?.service === "qos-storefront", "flowers health missing qos-storefront service");
  console.log("  · flowers health ok");
}

{
  const { response, json } = await fetchJson(`${QUOTES}/api/health`);
  check(response.ok, `quotes health expected 200, got ${response.status}`);
  check(json?.status === "healthy", "quotes health missing healthy status");
  console.log("  · quotes health ok");
}

{
  const { response, text } = await fetchJson(`${FLOWERS}/`);
  check(response.ok, `flowers home expected 200, got ${response.status}`);
  check(
    text.includes("Shop collections") || text.includes("/hero/bouquet"),
    "flowers home missing Floréa hero",
  );
  console.log("  · flowers Floréa home ok");
}

{
  const { response, text } = await fetchJson(`${QUOTES}/`);
  check(response.ok, `quotes home expected 200, got ${response.status}`);
  check(
    text.includes("Coffee worth") || text.includes("photo-splash-cup"),
    "quotes home missing hospitality landing",
  );
  console.log("  · quotes hospitality home ok");
}

{
  const flowersManifestUrl = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  flowersManifestUrl.searchParams.set("host", "flowers.dev.qosapp.com");
  flowersManifestUrl.searchParams.set("contractVersion", "1");
  const quotesManifestUrl = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  quotesManifestUrl.searchParams.set("host", "quotes.dev.qosapp.com");
  quotesManifestUrl.searchParams.set("contractVersion", "1");

  const [flowersResult, quotesResult] = await Promise.all([
    fetchJson(flowersManifestUrl),
    fetchJson(quotesManifestUrl),
  ]);

  check(flowersResult.response.ok, "flowers manifest expected 200");
  check(quotesResult.response.ok, "quotes manifest expected 200");
  const flowersManifest = flowersResult.json?.manifest ?? flowersResult.json;
  const quotesManifest = quotesResult.json?.manifest ?? quotesResult.json;

  check(
    flowersManifest?.storefrontPublicId !== quotesManifest?.storefrontPublicId,
    "flowers and quotes must resolve to different storefront IDs",
  );
  check(
    flowersManifest?.theme?.preset === "generic_retail_baseline",
    "flowers manifest theme must be generic_retail_baseline",
  );
  check(
    quotesManifest?.theme?.preset === "hospitality_baseline",
    "quotes manifest theme must be hospitality_baseline",
  );
  console.log("  · manifest host isolation ok");
}

{
  const url = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  url.searchParams.set("host", "unconfigured.dev.qosapp.com");
  url.searchParams.set("contractVersion", "1");
  const { response } = await fetchJson(url);
  check(response.status === 404, `unknown manifest host expected 404, got ${response.status}`);
  console.log("  · unknown manifest host returns 404");
}

console.log("");
console.log("DNS note: verify CNAME manually with:");
console.log(`  Resolve-DnsName flowers.dev.qosapp.com -Type CNAME -> ${AFD_CNAME}`);
console.log(`  Image: qosdevacr.azurecr.io/qos-storefront:0.10.0 on ca-qos-dev-storefront`);

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nAll QOS-78 checks passed.");
