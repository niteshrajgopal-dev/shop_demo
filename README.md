# shop_demo — QOS Storefront Renderer

Multi-tenant Next.js storefront for the QOS Storefront Platform. One image serves both dev tenants on the shared runtime (`ca-qos-dev-storefront`):

| Host | Theme preset | Home experience |
|---|---|---|
| `flowers.dev.qosapp.com` | `generic_retail_baseline` | Floréa animated hero |
| `quotes.dev.qosapp.com` | `hospitality_baseline` | Hospitality landing |

This repository is self-contained — it has **no runtime or build dependency on the `quotes` project**. Hospitality UI/routes were copied in-repo where needed for the shared image contract.

## Features

- Host-based tenant resolution via QOS manifest API
- Manifest-driven theme preset selection (`manifest.theme.preset`)
- Published shop menu, basket, customer auth, and checkout
- Floréa flower shop + Quotes hospitality experiences from one renderer

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Localhost uses the flowers tenant IDs from `.env` when hostname resolution is unavailable.

## Environment

| Variable | Purpose |
|---|---|
| `QOS_API_BASE_URL` | QOS API base URL (required in production) |
| `QOS_STOREFRONT_PUBLIC_ID` | Flowers tenant fallback for localhost |
| `QOS_LOCATION_PUBLIC_ID` | Default branch for localhost |
| `QOS_TEST_PRODUCT_PUBLIC_ID` | Optional sandbox checkout demo product |
| `QOS_CUSTOMER_OAUTH_PROVIDERS` | OAuth providers on sign-in page |

No database credentials or admin secrets belong on the storefront Container App.

## Verify against QOS

```bash
npm run verify:qos-52   # menu + flowers home smoke checks
npm run verify:qos-41   # shared-image + manifest checks
npm run verify:qos-78   # full flowers/quotes host isolation + health
npm run verify:qos-77   # Floréa hero screenshots (local Playwright)
```

## Deploy (shared dev runtime)

Builds as a Next.js standalone app (`output: "standalone"`) — see `Dockerfile`.

```powershell
.\deploy\build-and-push-to-acr.ps1 -ImageTag "0.10.0"
.\deploy\deploy-to-acr.ps1 -ImageTag "0.10.0" -WaitForHealth
```

Defaults target `qosdevacr.azurecr.io/qos-storefront` → `ca-qos-dev-storefront` in `rg-qos-dev-core`.

Remove `.next` before ACR upload if a local dev server holds a lock (or rely on `.dockerignore`).
