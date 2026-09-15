/**
 * QOS-41 validation — shared storefront deployment and edge route evidence.
 *
 *   node scripts/verify-qos-41.mjs
 */

const API_BASE =
  process.env.QOS_API_BASE_URL ??
  "https://ca-qos-dev-api.gentleplant-cc8574e8.uaenorth.azurecontainerapps.io";
const QUOTES = "https://quotes.dev.qosapp.com";
const FLOWERS = "https://flowers.dev.qosapp.com";

const EXPECTED_BRANCHES = ["HBZ Stadium", "HCT Academic City", "Al Ain Zoo"];

const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { response, json, text };
}

console.log("QOS-41 validation");

{
  const { response, text } = await fetchJson(`${QUOTES}/api/health`);
  check(response.ok, `quotes health expected 200, got ${response.status}`);
  check(text.includes("qos-storefront"), "quotes health missing storefront marker");
  console.log("  · quotes loads via shared storefront / health ok");
}

{
  const { response, text } = await fetchJson(`${FLOWERS}/menu`);
  check(response.ok, `flowers menu expected 200, got ${response.status}`);
  check(text.includes("Classic Rose Bouquet"), "flowers tenant missing on shared image");
  console.log("  · flowers tenant resolves on same shared image");
}

{
  const url = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  url.searchParams.set("host", "quotes.dev.qosapp.com");
  url.searchParams.set("contractVersion", "1");
  const { response, json } = await fetchJson(url);
  check(response.ok, `quotes manifest expected 200, got ${response.status}`);

  const manifest = json?.manifest;
  const branchNames = manifest?.locations?.map((location) => location.name) ?? [];
  for (const branch of EXPECTED_BRANCHES) {
    check(branchNames.includes(branch), `quotes manifest missing branch: ${branch}`);
  }

  for (const collection of manifest?.publishedCollections ?? []) {
    check(Boolean(collection.publicMenuKey), `missing publicMenuKey for ${collection.locationPublicId}`);
    const menuUrl = new URL(
      `/api/public/menus/${encodeURIComponent(collection.publicMenuKey)}`,
      `${API_BASE}/`,
    );
    menuUrl.searchParams.set("locale", "en");
    const menuResult = await fetchJson(menuUrl);
    check(menuResult.response.ok, `menu fetch failed for ${collection.locationPublicId}`);
  }

  console.log(`  · quotes manifest has ${branchNames.length} branches with published menus`);
}

{
  const url = new URL("/api/public/storefronts/manifest", `${API_BASE}/`);
  url.searchParams.set("host", "unconfigured.dev.qosapp.com");
  url.searchParams.set("contractVersion", "1");
  const { response } = await fetchJson(url);
  check(response.status === 404, `unknown host expected manifest 404, got ${response.status}`);
  console.log("  · unknown host does not resolve a tenant manifest");
}

{
  const { response, text } = await fetchJson(`${QUOTES}/menu`);
  check(response.ok, `quotes menu expected 200, got ${response.status}`);
  check(
    /English|Arabic|localeSelector|العربية|locale/i.test(text),
    "quotes EN/AR selector missing",
  );
  check(text.includes("Demo Latte") || text.includes("Menu"), "quotes published menu missing");
  console.log("  · quotes menu + locale selector present");
}

if (failures.length > 0) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("\nAll QOS-41 checks passed.");
