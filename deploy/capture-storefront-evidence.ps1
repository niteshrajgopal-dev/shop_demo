#Requires -Version 5.1
<#
.SYNOPSIS
  Capture a read-only evidence snapshot for one or more isolated storefront Container Apps.

.DESCRIPTION
  Used by the QOS-85 isolation proof runbook. Writes JSON and Markdown snapshots with
  image, revision, scale, ingress FQDN, and non-secret environment key names only.
  Never prints secret values.

  Fail-closed target validation matches deploy\deploy-to-acr.ps1 (QOS-82):
    - Requires ca-qos-dev-storefront-<instance>
    - Rejects legacy shared app ca-qos-dev-storefront

.PARAMETER ContainerAppName
  Required. One or more storefront Container App names to snapshot.

.PARAMETER OutputDir
  Directory for snapshot files. Defaults to deploy\evidence\qos-85\<timestamp>.

.PARAMETER CompareToDir
  Optional baseline directory. When set, diffs each captured app against
  <CompareToDir>\<app-name>.json and writes <app-name>.diff.md.

.PARAMETER ResourceGroup
  Azure resource group. Defaults to rg-qos-dev-core.

.EXAMPLE
  .\deploy\capture-storefront-evidence.ps1 `
    -ContainerAppName "ca-qos-dev-storefront-quotes","ca-qos-dev-storefront-florea" `
    -OutputDir ".\deploy\evidence\qos-85\01-baseline"

.EXAMPLE
  .\deploy\capture-storefront-evidence.ps1 `
    -ContainerAppName "ca-qos-dev-storefront-florea" `
    -OutputDir ".\deploy\evidence\qos-85\03-post-quotes-deploy" `
    -CompareToDir ".\deploy\evidence\qos-85\01-baseline"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]] $ContainerAppName,

    [string] $OutputDir = "",
    [string] $CompareToDir = "",
    [string] $ResourceGroup = "rg-qos-dev-core",
    [string] $RegistryName = "qosdevacr",
    [string] $ImageName = "qos-storefront",
    [string] $HealthPath = "/api/health"
)

$ErrorActionPreference = "Stop"

$ApprovedStorefrontAppPattern = '^ca-qos-dev-storefront-[a-z][a-z0-9-]*$'
$LegacySharedStorefrontApp = "ca-qos-dev-storefront"

$ForbiddenEnvKeyPatterns = @(
    '^POSTGRES',
    '^DATABASE_',
    '^ConnectionStrings',
    '^ADMIN_VAULT',
    '^AZURE_POSTGRESQL',
    '_SECRET$',
    '_PASSWORD$',
    '_CONNECTION_STRING$'
)

function Assert-StorefrontEvidenceTarget {
    param([string] $TargetAppName)

    if ([string]::IsNullOrWhiteSpace($TargetAppName)) {
        throw @"
Storefront evidence target is required.
Pass -ContainerAppName with an explicit instance app, e.g.:
  -ContainerAppName "ca-qos-dev-storefront-quotes"
  -ContainerAppName "ca-qos-dev-storefront-florea"
"@
    }

    if ($TargetAppName -eq $LegacySharedStorefrontApp) {
        throw @"
Legacy shared storefront '$LegacySharedStorefrontApp' is not an approved evidence target.
Use an explicit instance app under ca-qos-dev-storefront-<instance>, e.g.:
  -ContainerAppName "ca-qos-dev-storefront-quotes"
  -ContainerAppName "ca-qos-dev-storefront-florea"
"@
    }

    if ($TargetAppName -notmatch $ApprovedStorefrontAppPattern) {
        throw @"
Storefront evidence target '$TargetAppName' does not match the approved pattern:
  ca-qos-dev-storefront-<instance>
Examples:
  ca-qos-dev-storefront-quotes
  ca-qos-dev-storefront-florea
No Azure queries were made.
"@
    }
}

function Assert-AzCli {
    if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
        throw "Azure CLI (az) is not installed or not on PATH."
    }

    $account = az account show -o json 2>$null | ConvertFrom-Json
    if (-not $account) {
        throw "Not logged in to Azure. Run 'az login' first."
    }

    Write-Host "Subscription: $($account.name) ($($account.id))"
}

function Get-SourceCommit {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        return $null
    }

    try {
        $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
        $commit = git -C $repoRoot rev-parse HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $commit) {
            return $commit.Trim()
        }
    }
    catch {
        return $null
    }

    return $null
}

function Get-ImageDigestFromAcr {
    param(
        [string] $ImageReference
    )

    if (-not $ImageReference -or $ImageReference -notmatch '^([^/]+)\.azurecr\.io/([^:]+):(.+)$') {
        return $null
    }

    $registry = $Matches[1]
    $repository = $Matches[2]
    $tag = $Matches[3]

    try {
        $digest = az acr repository show `
            --name $registry `
            --image "${repository}:${tag}" `
            --query "digest" `
            -o tsv `
            2>$null

        if ($LASTEXITCODE -eq 0 -and $digest) {
            return $digest.Trim()
        }
    }
    catch {
        return $null
    }

    return $null
}

function Get-EnvKeySummary {
    param($EnvEntries)

    $keys = @()
    $secretRefs = @()
    $forbiddenHits = @()

    foreach ($entry in @($EnvEntries)) {
        if ($entry.name) {
            $keys += $entry.name

            foreach ($pattern in $ForbiddenEnvKeyPatterns) {
                if ($entry.name -match $pattern) {
                    $forbiddenHits += $entry.name
                    break
                }
            }
        }

        if ($entry.secretRef) {
            $secretRefs += $entry.secretRef
        }
    }

    return [ordered]@{
        keyNames = @($keys | Sort-Object -Unique)
        secretRefNames = @($secretRefs | Sort-Object -Unique)
        forbiddenKeyHits = @($forbiddenHits | Sort-Object -Unique)
    }
}

function Get-StorefrontSnapshot {
    param(
        [string] $AppName,
        [string] $Group
    )

    $appJson = az containerapp show `
        --name $AppName `
        --resource-group $Group `
        -o json `
        2>$null

    if ($LASTEXITCODE -ne 0 -or -not $appJson) {
        throw "Container app '$AppName' was not found in '$Group'."
    }

    $app = $appJson | ConvertFrom-Json
    $container = $app.properties.template.containers[0]
    $image = $container.image
    $imageDigest = Get-ImageDigestFromAcr -ImageReference $image

    $revisions = az containerapp revision list `
        --name $AppName `
        --resource-group $Group `
        -o json `
        2>$null | ConvertFrom-Json

    $activeRevision = $null
    if ($revisions) {
        $activeRevision = @($revisions | Where-Object { $_.properties.active -eq $true } | Select-Object -First 1)
        if (-not $activeRevision) {
            $activeRevision = @($revisions | Select-Object -First 1)
        }
    }

    $fqdn = $app.properties.configuration.ingress.fqdn
    $healthUrl = if ($fqdn) { "https://$fqdn$HealthPath" } else { $null }
    $envSummary = Get-EnvKeySummary -EnvEntries $container.env

    return [ordered]@{
        capturedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
        containerAppName = $AppName
        resourceGroup = $Group
        sourceCommit = Get-SourceCommit
        image = $image
        imageDigest = $imageDigest
        activeRevisionName = $activeRevision.name
        revisionCreatedTime = $activeRevision.properties.createdTime
        scale = [ordered]@{
            minReplicas = $app.properties.template.scale.minReplicas
            maxReplicas = $app.properties.template.scale.maxReplicas
        }
        ingress = [ordered]@{
            fqdn = $fqdn
            external = $app.properties.configuration.ingress.external
            targetPort = $app.properties.configuration.ingress.targetPort
            customDomainNames = @(
                $app.properties.configuration.ingress.customDomains |
                    ForEach-Object { $_.name } |
                    Where-Object { $_ } |
                    Sort-Object -Unique
            )
        }
        healthUrl = $healthUrl
        environment = $envSummary
    }
}

function Write-SnapshotMarkdown {
    param(
        [object] $Snapshot,
        [string] $Path
    )

    $lines = @(
        "# Storefront evidence: $($Snapshot.containerAppName)",
        "",
        "| Field | Value |",
        "|---|---|",
        "| Captured (UTC) | $($Snapshot.capturedAtUtc) |",
        "| Resource group | $($Snapshot.resourceGroup) |",
        "| Image | $($Snapshot.image) |",
        "| Image digest | $(if ($Snapshot.imageDigest) { $Snapshot.imageDigest } else { '(unavailable)' }) |",
        "| Active revision | $($Snapshot.activeRevisionName) |",
        "| Revision created | $($Snapshot.revisionCreatedTime) |",
        "| Scale min/max | $($Snapshot.scale.minReplicas) / $($Snapshot.scale.maxReplicas) |",
        "| Ingress FQDN | $($Snapshot.ingress.fqdn) |",
        "| Health URL | $($Snapshot.healthUrl) |",
        "| Source commit | $(if ($Snapshot.sourceCommit) { $Snapshot.sourceCommit } else { '(git unavailable)' }) |",
        "",
        "## Environment key names (values not captured)",
        "",
        $(if ($Snapshot.environment.keyNames.Count -gt 0) {
            ($Snapshot.environment.keyNames | ForEach-Object { "- $_" }) -join "`n"
        } else {
            "- (none)"
        }),
        "",
        "## Secret references (names only)",
        "",
        $(if ($Snapshot.environment.secretRefNames.Count -gt 0) {
            ($Snapshot.environment.secretRefNames | ForEach-Object { "- $_" }) -join "`n"
        } else {
            "- (none)"
        }),
        "",
        "## Forbidden key pattern hits",
        "",
        $(if ($Snapshot.environment.forbiddenKeyHits.Count -gt 0) {
            ($Snapshot.environment.forbiddenKeyHits | ForEach-Object { "- FAIL: $_" }) -join "`n"
        } else {
            "- (none — pass)"
        }),
        ""
    )

    $lines | Set-Content -Path $Path -Encoding UTF8
}

function Compare-Snapshots {
    param(
        [object] $Baseline,
        [object] $Current
    )

    $fields = @(
        @{ Name = "image"; Baseline = $Baseline.image; Current = $Current.image },
        @{ Name = "imageDigest"; Baseline = $Baseline.imageDigest; Current = $Current.imageDigest },
        @{ Name = "activeRevisionName"; Baseline = $Baseline.activeRevisionName; Current = $Current.activeRevisionName },
        @{ Name = "scale.minReplicas"; Baseline = $Baseline.scale.minReplicas; Current = $Current.scale.minReplicas },
        @{ Name = "scale.maxReplicas"; Baseline = $Baseline.scale.maxReplicas; Current = $Current.scale.maxReplicas },
        @{ Name = "ingress.fqdn"; Baseline = $Baseline.ingress.fqdn; Current = $Current.ingress.fqdn }
    )

    $unchanged = @()
    $changed = @()

    foreach ($field in $fields) {
        if ("$($field.Baseline)" -eq "$($field.Current)") {
            $unchanged += $field.Name
        }
        else {
            $changed += [ordered]@{
                field = $field.Name
                baseline = $field.Baseline
                current = $field.Current
            }
        }
    }

    $baselineKeys = @($Baseline.environment.keyNames)
    $currentKeys = @($Current.environment.keyNames)
    $addedKeys = @($currentKeys | Where-Object { $_ -notin $baselineKeys })
    $removedKeys = @($baselineKeys | Where-Object { $_ -notin $currentKeys })

    return [ordered]@{
        unchanged = $true
        unchangedFields = $unchanged
        changedFields = $changed
        addedEnvironmentKeys = $addedKeys
        removedEnvironmentKeys = $removedKeys
    }
}

function Write-DiffMarkdown {
    param(
        [string] $AppName,
        [object] $Diff,
        [string] $BaselinePath,
        [string] $CurrentPath,
        [string] $Path
    )

    if ($Diff.changedFields.Count -gt 0 -or $Diff.addedEnvironmentKeys.Count -gt 0 -or $Diff.removedEnvironmentKeys.Count -gt 0) {
        $Diff.unchanged = $false
    }

    $lines = @(
        "# Unchanged proof: $AppName",
        "",
        "**Result:** $(if ($Diff.unchanged) { 'UNCHANGED (pass)' } else { 'CHANGED (review required)' })",
        "",
        "- Baseline: ``$BaselinePath``",
        "- Current: ``$CurrentPath``",
        "",
        "## Compared fields",
        ""
    )

    foreach ($field in $Diff.changedFields) {
        $lines += "- **$($field.field)**: ``$($field.baseline)`` -> ``$($field.current)``"
    }

    if ($Diff.changedFields.Count -eq 0) {
        $lines += "- (no differences in image, digest, revision, scale, or ingress FQDN)"
    }

    $lines += ""
    $lines += "## Environment key delta (names only)"
    $lines += ""

    if ($Diff.addedEnvironmentKeys.Count -eq 0 -and $Diff.removedEnvironmentKeys.Count -eq 0) {
        $lines += "- (no key name changes)"
    }
    else {
        foreach ($key in $Diff.addedEnvironmentKeys) {
            $lines += "- added: ``$key``"
        }
        foreach ($key in $Diff.removedEnvironmentKeys) {
            $lines += "- removed: ``$key``"
        }
    }

    $lines += ""
    $lines | Set-Content -Path $Path -Encoding UTF8
}

foreach ($appName in $ContainerAppName) {
    Assert-StorefrontEvidenceTarget -TargetAppName $appName
}

if (-not $OutputDir) {
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
    $OutputDir = Join-Path $PSScriptRoot "evidence\qos-85\$timestamp"
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$OutputDir = (Resolve-Path $OutputDir).Path

Assert-AzCli

Write-Host "Writing evidence to: $OutputDir"

$capturedApps = @()

foreach ($appName in $ContainerAppName) {
    Write-Host "Capturing $appName..."
    $snapshot = Get-StorefrontSnapshot -AppName $appName -Group $ResourceGroup

    $jsonPath = Join-Path $OutputDir "$appName.json"
    $mdPath = Join-Path $OutputDir "$appName.md"

    $snapshot | ConvertTo-Json -Depth 8 | Set-Content -Path $jsonPath -Encoding UTF8
    Write-SnapshotMarkdown -Snapshot $snapshot -Path $mdPath

    Write-Host "  JSON: $jsonPath"
    Write-Host "  Markdown: $mdPath"

    if ($snapshot.environment.forbiddenKeyHits.Count -gt 0) {
        Write-Warning "Forbidden env key pattern hits on $appName: $($snapshot.environment.forbiddenKeyHits -join ', ')"
    }

    if ($CompareToDir) {
        $baselinePath = Join-Path $CompareToDir "$appName.json"
        if (-not (Test-Path $baselinePath)) {
            throw "Baseline snapshot not found for diff: $baselinePath"
        }

        $baseline = Get-Content -Path $baselinePath -Raw | ConvertFrom-Json
        $diff = Compare-Snapshots -Baseline $baseline -Current $snapshot
        $diffPath = Join-Path $OutputDir "$appName.diff.md"
        Write-DiffMarkdown `
            -AppName $appName `
            -Diff $diff `
            -BaselinePath $baselinePath `
            -CurrentPath $jsonPath `
            -Path $diffPath

        Write-Host "  Diff: $diffPath ($(if ($diff.unchanged) { 'UNCHANGED' } else { 'CHANGED' }))"
    }

    $capturedApps += $snapshot.containerAppName
}

$manifest = [ordered]@{
    capturedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
    resourceGroup = $ResourceGroup
    outputDir = $OutputDir
    containerApps = @($capturedApps)
    compareToDir = $(if ($CompareToDir) { (Resolve-Path $CompareToDir).Path } else { $null })
    sourceCommit = Get-SourceCommit
}

$manifestPath = Join-Path $OutputDir "manifest.json"
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host ""
Write-Host "Manifest: $manifestPath"
Write-Host "Done."
