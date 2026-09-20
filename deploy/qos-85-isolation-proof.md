# QOS-85 — Independent storefront deploy/rollback proof

**Linear:** [QOS-85](https://linear.app/qosapp/issue/QOS-85/prove-independent-storefront-deployrollback-and-retire-the-legacy)  
**Parent:** QOS-80 / ADR-SF-01 (v8 isolated storefront topology)  
**Preconditions:** QOS-82 (explicit deploy target), QOS-83, QOS-84 — Done

This runbook proves that Quotes and Floréa storefront Container Apps deploy and roll back independently, continue to reach QOS APIs on their own domains, and that the legacy shared app `ca-qos-dev-storefront` can be retired in a separate gated phase.

**Scope:** documentation and evidence capture only in this repo. Humans execute Azure changes from an authenticated workstation.

---

## Targets (dev)

| Instance | Container App | Public host | Dedicated origin (Front Door) |
|---|---|---|---|
| Quotes | `ca-qos-dev-storefront-quotes` | `quotes.dev.qosapp.com` | Quotes origin group only |
| Floréa | `ca-qos-dev-storefront-florea` | `flowers.dev.qosapp.com` | Floréa origin group only |
| QOS API (control) | `ca-qos-dev-api` | (internal ingress FQDN) | n/a |
| Legacy (do not deploy) | `ca-qos-dev-storefront` | *(must not receive traffic)* | retire only after Phase 2 gate |

Resource group: `rg-qos-dev-core`  
Image registry: `qosdevacr.azurecr.io/qos-storefront:<tag>`

---

## Tools in this repo

| Script | Purpose |
|---|---|
| `deploy/build-and-push-to-acr.ps1` | Build and push a reusable image tag to ACR |
| `deploy/deploy-to-acr.ps1` | Deploy one tag to **one** explicit `-ContainerAppName` (QOS-82 fail-closed) |
| `deploy/capture-storefront-evidence.ps1` | Read-only snapshot + optional unchanged diff |
| `scripts/verify-qos-78.mjs` | Post-deploy host/manifest smoke checks |

Evidence output directory (created by humans during proof): `deploy/evidence/qos-85/`

---

## Phase 0 — Prerequisites

1. `az login` with rights on `rg-qos-dev-core`.
2. Record the **current production image tag** on each instance (baseline).
3. Choose a **harmless proof tag** — a new semver (e.g. `0.10.1-qos85`) built from this repo or an existing tag already in ACR. Do not use a tag that changes tenant behaviour unless intentional.
4. Keep the **prior tag** for rollback (from baseline snapshots).

```powershell
# Baseline — both instances, no deploy yet
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\01-baseline"
```

Capture QOS API health once (manual note in evidence pack):

```powershell
$apiFqdn = az containerapp show -n ca-qos-dev-api -g rg-qos-dev-core --query "properties.configuration.ingress.fqdn" -o tsv
Invoke-RestMethod "https://$apiFqdn/api/health"
```

Expected: `status: healthy` (record URL and response in `deploy/evidence/qos-85/01-baseline/api-health.json`).

---

## Phase 1 — Quotes-only deploy (Floréa must stay unchanged)

### 1.1 Build (if new tag)

```powershell
.\deploy\build-and-push-to-acr.ps1 -ImageTag "0.10.1-qos85"
```

### 1.2 Deploy Quotes only

```powershell
.\deploy\deploy-to-acr.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes" `
  -ImageTag "0.10.1-qos85" `
  -WaitForHealth
```

### 1.3 Evidence — Quotes changed, Floréa unchanged

```powershell
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\02-post-quotes-deploy" `
  -CompareToDir ".\deploy\evidence\qos-85\01-baseline"
```

**Pass criteria**

- `ca-qos-dev-storefront-quotes.diff.md` — **CHANGED** (image and/or revision updated).
- `ca-qos-dev-storefront-florea.diff.md` — **UNCHANGED** (image, digest, revision, scale, ingress FQDN).
- `https://quotes.dev.qosapp.com/api/health` — `healthy`.
- `https://flowers.dev.qosapp.com/api/health` — still `healthy` (unchanged revision).
- QOS API health — still `healthy`.

```bash
node scripts/verify-qos-78.mjs
```

---

## Phase 2 — Quotes rollback (Floréa still unchanged)

Redeploy the **baseline tag** to Quotes only:

```powershell
.\deploy\deploy-to-acr.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes" `
  -ImageTag "<baseline-tag-from-01-baseline>" `
  -WaitForHealth
```

```powershell
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\03-post-quotes-rollback" `
  -CompareToDir ".\deploy\evidence\qos-85\01-baseline"
```

**Pass criteria**

- Quotes snapshot matches baseline (image/revision restored).
- Floréa diff vs baseline — **UNCHANGED** throughout Phases 1–2.

---

## Phase 3 — Floréa-only deploy (Quotes must stay unchanged)

```powershell
.\deploy\deploy-to-acr.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-florea" `
  -ImageTag "0.10.1-qos85" `
  -WaitForHealth
```

```powershell
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\04-post-florea-deploy" `
  -CompareToDir ".\deploy\evidence\qos-85\01-baseline"
```

**Pass criteria**

- Floréa diff — **CHANGED**.
- Quotes diff vs baseline — **UNCHANGED** (or matches post-rollback baseline).

---

## Phase 4 — Floréa rollback

```powershell
.\deploy\deploy-to-acr.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-florea" `
  -ImageTag "<baseline-tag-from-01-baseline>" `
  -WaitForHealth
```

```powershell
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\05-post-florea-rollback" `
  -CompareToDir ".\deploy\evidence\qos-85\01-baseline"
```

**Pass criteria:** both instances match `01-baseline` for image/revision/scale/ingress FQDN.

---

## Phase 5 — QOS API + domain binding checks

Run after any deploy step (or once at end):

| Check | Command / URL | Expected |
|---|---|---|
| Quotes health | `https://quotes.dev.qosapp.com/api/health` | `status: healthy`, `service: qos-storefront` |
| Floréa health | `https://flowers.dev.qosapp.com/api/health` | `status: healthy`, `service: qos-storefront` |
| QOS API health | `https://<ca-qos-dev-api-fqdn>/api/health` | `healthy` throughout proof |
| Manifest isolation | `node scripts/verify-qos-78.mjs` | all checks pass |
| Quotes tenant | manifest host `quotes.dev.qosapp.com` | `hospitality_baseline` preset |
| Floréa tenant | manifest host `flowers.dev.qosapp.com` | `generic_retail_baseline` preset |

Each storefront must resolve its tenant via QOS manifest API (host header), not via a shared legacy app.

---

## Phase 6 — Secret surface checklist (storefront apps only)

Evidence script lists **key names only** and flags forbidden patterns. Manually confirm no PostgreSQL or admin-vault credentials on storefront Container Apps.

### Must be absent (env key name or secretRef name)

- `POSTGRES_*`, `DATABASE_URL`, `DATABASE_*`
- `ConnectionStrings__*` (any database connection string)
- `ADMIN_VAULT_*`, `AZURE_POSTGRESQL_*`
- `*_SECRET`, `*_PASSWORD`, `*_CONNECTION_STRING`
- Any secret reference whose name suggests admin vault or database admin access

### Allowed (examples — instance-specific values are not secrets)

- `QOS_API_BASE_URL`
- `QOS_STOREFRONT_PUBLIC_ID`, `QOS_LOCATION_PUBLIC_ID` (tenant binding)
- `QOS_TEST_PRODUCT_PUBLIC_ID`, `QOS_CUSTOMER_OAUTH_PROVIDERS`
- Container platform vars (`PORT`, `NODE_ENV`, etc.)

```powershell
# Quick manual review (names only — never paste values into tickets)
az containerapp show -n ca-qos-dev-storefront-quotes -g rg-qos-dev-core `
  --query "properties.template.containers[0].env[].name" -o tsv
az containerapp show -n ca-qos-dev-storefront-florea -g rg-qos-dev-core `
  --query "properties.template.containers[0].env[].name" -o tsv
```

**Pass:** forbidden list empty; `capture-storefront-evidence.ps1` reports `(none — pass)` under forbidden key hits.

---

## Phase 7 — Azure Front Door routing (no silent legacy fallback)

Confirm each public domain routes to **exactly one dedicated origin group** for its instance Container App — not to `ca-qos-dev-storefront`.

Document in evidence (portal export or CLI):

```powershell
# List Front Door profiles in the subscription (adjust name if multiple)
az afd profile list -o table

# For each custom domain, record: domain -> route -> origin group -> origin hostname
# Quotes: quotes.dev.qosapp.com -> ... -> ca-qos-dev-storefront-quotes ingress FQDN
# Floréa: flowers.dev.qosapp.com -> ... -> ca-qos-dev-storefront-florea ingress FQDN
```

DNS CNAME sanity (from QOS-78):

```powershell
Resolve-DnsName flowers.dev.qosapp.com -Type CNAME
Resolve-DnsName quotes.dev.qosapp.com -Type CNAME
# Both should point at the dev Front Door endpoint (e.g. *.azurefd.net), not at the legacy app FQDN.
```

**Pass criteria**

- Each domain → one origin group → one dedicated Container App origin.
- No route, origin group, or failover rule still targets the legacy `ca-qos-dev-storefront` FQDN.
- No weighted/multi-origin group silently serving legacy as backup.

---

## Phase 8 — Legacy retirement (separate gated phase — NOT part of deploy proof)

> **NEVER delete-first.** Retire `ca-qos-dev-storefront` only after explicit human greenlight and a completed observation window.

### Gate A — Observation window (minimum 7 days recommended)

- [ ] Phases 1–7 evidence pack attached to QOS-85.
- [ ] Both domains served only from dedicated apps for full window.
- [ ] No deploy script invocations targeting `ca-qos-dev-storefront` (script rejects this by design).
- [ ] Monitoring: no 5xx spike on either domain; QOS API health stable.

### Gate B — Disable traffic first

1. Remove or disable Front Door routes/origins pointing at legacy app (if any remain).
2. Scale legacy app to zero **or** disable ingress — do **not** delete the Container App yet.
3. Retain Log Analytics / Container Apps logs for the observation period.

### Gate C — Human greenlight required

Record approver name, date, and Linear comment before deletion:

- [ ] Platform owner sign-off (Nitesh/Davy).
- [ ] Confirm **no** custom domain, certificate, or secret still references `ca-qos-dev-storefront`.
- [ ] Final evidence snapshot of legacy app (revision, zero traffic) saved under `deploy/evidence/qos-85/99-legacy-retired/`.

### Gate D — Retire resource (only after B + C)

```powershell
# Example — run only after explicit approval
# az containerapp delete -n ca-qos-dev-storefront -g rg-qos-dev-core
```

Do not run delete commands during the isolation proof — only during the retirement phase with approval.

---

## Evidence pack layout

```
deploy/evidence/qos-85/
  01-baseline/
    manifest.json
    ca-qos-dev-storefront-quotes.json
    ca-qos-dev-storefront-quotes.md
    ca-qos-dev-storefront-florea.json
    ca-qos-dev-storefront-florea.md
    api-health.json                 # manual
  02-post-quotes-deploy/
    *.json, *.md, *.diff.md
  03-post-quotes-rollback/
  04-post-florea-deploy/
  05-post-florea-rollback/
  front-door-routing.md             # manual Phase 7 notes
  99-legacy-retired/                # Phase 8 only, after approval
```

Commit evidence JSON/Markdown to the PR or attach to Linear QOS-85 — **never commit secret values**.

---

## Acceptance summary

| Step | Quotes | Floréa | QOS API | Legacy app |
|---|---|---|---|---|
| Baseline captured | snapshot | snapshot | healthy | not used |
| Quotes deploy | updated | **unchanged** | healthy | untouched |
| Quotes rollback | restored | **unchanged** | healthy | untouched |
| Floréa deploy | **unchanged** | updated | healthy | untouched |
| Floréa rollback | restored | restored | healthy | untouched |
| Front Door | dedicated origin | dedicated origin | n/a | no route |
| Secrets | no DB/admin vault keys | no DB/admin vault keys | n/a | n/a |
| Retirement | n/a | n/a | n/a | gated Phase 8 only |

When all rows pass, attach the evidence pack to QOS-85 and mark the ticket Done. Schedule Phase 8 legacy retirement separately.
