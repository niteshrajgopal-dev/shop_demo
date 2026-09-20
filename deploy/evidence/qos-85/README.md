# QOS-85 evidence pack (human-filled)

This directory is populated during the [QOS-85 isolation proof runbook](../qos-85-isolation-proof.md).

**Do not commit secret values.** JSON/Markdown snapshots from `capture-storefront-evidence.ps1` contain environment **key names only**.

Suggested subfolders:

- `01-baseline/` — pre-deploy snapshots
- `02-post-quotes-deploy/` — after Quotes-only deploy (+ diff vs baseline)
- `03-post-quotes-rollback/`
- `04-post-florea-deploy/`
- `05-post-florea-rollback/`
- `99-legacy-retired/` — Phase 8 only, after explicit approval

Generate snapshots:

```powershell
.\deploy\capture-storefront-evidence.ps1 `
  -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
  -OutputDir ".\deploy\evidence\qos-85\01-baseline"
```
