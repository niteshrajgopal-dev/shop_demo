#Requires -Version 5.1
<#
.SYNOPSIS
  Deploy the qos-storefront image from ACR to an explicit Azure Container App target.

.DESCRIPTION
  Updates exactly one storefront Container App revision. The shared legacy app
  ca-qos-dev-storefront is not an approved target under ADR-SF-01 (QOS-80) v8
  isolation topology.

  Approved target pattern:
    ca-qos-dev-storefront-<instance>

  Dev instances:
    ca-qos-dev-storefront-quotes   -> quotes.dev.qosapp.com
    ca-qos-dev-storefront-florea   -> flowers.dev.qosapp.com

  Build once with deploy\build-and-push-to-acr.ps1, then deploy the same image
  tag to each instance explicitly. Deploying one target never changes another app.

  Rollback (target-specific): redeploy a prior tag to the same -ContainerAppName:
    .\deploy\deploy-to-acr.ps1 -ContainerAppName "ca-qos-dev-storefront-quotes" -ImageTag "0.9.0"

  API deploy (ca-qos-dev-api) is owned by qos-app; this script is storefront-only.

.PARAMETER ContainerAppName
  Required. Existing Azure Container App for one storefront instance.
  Must match ca-qos-dev-storefront-<instance> (e.g. -quotes, -florea).

.EXAMPLE
  .\deploy\deploy-to-acr.ps1 -ContainerAppName "ca-qos-dev-storefront-quotes" -ImageTag "0.10.0" -WaitForHealth

.EXAMPLE
  .\deploy\deploy-to-acr.ps1 -ContainerAppName "ca-qos-dev-storefront-florea" -ImageTag "0.10.0" -WaitForHealth
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string] $ContainerAppName,

    [string] $RegistryName = "qosdevacr",
    [string] $ResourceGroup = "rg-qos-dev-core",
    [string] $ImageName = "qos-storefront",
    [string] $ImageTag = "0.10.0",
    [string] $HealthPath = "/api/health",
    [switch] $WaitForHealth,
    [int] $HealthTimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

$ApprovedStorefrontAppPattern = '^ca-qos-dev-storefront-[a-z][a-z0-9-]*$'
$LegacySharedStorefrontApp = "ca-qos-dev-storefront"

function Assert-StorefrontDeployTarget {
    param([string] $TargetAppName)

    if ([string]::IsNullOrWhiteSpace($TargetAppName)) {
        throw @"
Storefront deploy target is required.
Pass -ContainerAppName with an explicit instance app, e.g.:
  -ContainerAppName "ca-qos-dev-storefront-quotes"
  -ContainerAppName "ca-qos-dev-storefront-florea"
"@
    }

    if ($TargetAppName -eq $LegacySharedStorefrontApp) {
        throw @"
Legacy shared storefront '$LegacySharedStorefrontApp' is not an approved deploy target.
Use an explicit instance app under the v8 isolation pattern ca-qos-dev-storefront-<instance>, e.g.:
  -ContainerAppName "ca-qos-dev-storefront-quotes"
  -ContainerAppName "ca-qos-dev-storefront-florea"
"@
    }

    if ($TargetAppName -notmatch $ApprovedStorefrontAppPattern) {
        throw @"
Storefront deploy target '$TargetAppName' does not match the approved pattern:
  ca-qos-dev-storefront-<instance>
Examples:
  ca-qos-dev-storefront-quotes
  ca-qos-dev-storefront-florea
No Azure changes were made.
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
        $commit = git -C $PSScriptRoot rev-parse HEAD 2>$null
        if ($LASTEXITCODE -eq 0 -and $commit) {
            return $commit.Trim()
        }
    }
    catch {
        return $null
    }

    return $null
}

function Get-ImageDigest {
    param(
        [string] $Registry,
        [string] $Repository,
        [string] $Tag
    )

    try {
        $digest = az acr repository show `
            --name $Registry `
            --image "${Repository}:${Tag}" `
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

function Wait-ForHealthyRevision {
    param(
        [string] $HealthUrl,
        [int] $TimeoutSeconds
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    Write-Host "Waiting for health endpoint (timeout: ${TimeoutSeconds}s)..."

    while ((Get-Date) -lt $deadline) {
        try {
            $health = Invoke-RestMethod -Uri $HealthUrl -TimeoutSec 15
            if ($health.status -eq "healthy") {
                Write-Host "Health check passed."
                return $health
            }

            Write-Host "Health status: $($health.status)"
        }
        catch {
            Write-Host "Health endpoint not ready yet..."
        }

        Start-Sleep -Seconds 5
    }

    throw "Timed out waiting for a healthy deployment at $HealthUrl"
}

Assert-StorefrontDeployTarget -TargetAppName $ContainerAppName

$image = "$RegistryName.azurecr.io/${ImageName}:${ImageTag}"
$sourceCommit = Get-SourceCommit

Write-Host "Deploying $image to container app '$ContainerAppName'"
if ($sourceCommit) {
    Write-Host "Source commit: $sourceCommit"
}

Assert-AzCli

$existingApp = az containerapp show `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    -o json `
    2>$null

if ($LASTEXITCODE -ne 0 -or -not $existingApp) {
    throw "Container app '$ContainerAppName' was not found in '$ResourceGroup'. No Azure changes were made."
}

$imageDigest = Get-ImageDigest `
    -Registry $RegistryName `
    -Repository $ImageName `
    -Tag $ImageTag

& az containerapp update `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    --image $image

if ($LASTEXITCODE -ne 0) {
    throw "Container App update failed."
}

$app = az containerapp show `
    --name $ContainerAppName `
    --resource-group $ResourceGroup `
    -o json `
    | ConvertFrom-Json

$fqdn = $app.properties.configuration.ingress.fqdn
$healthUrl = "https://$fqdn$HealthPath"

Write-Host ""
Write-Host "Container App: $ContainerAppName"
Write-Host "URL:           https://$fqdn"
Write-Host "Health:        $healthUrl"

if ($WaitForHealth) {
    $result = Wait-ForHealthyRevision `
        -HealthUrl $healthUrl `
        -TimeoutSeconds $HealthTimeoutSeconds

    $result | ConvertTo-Json -Depth 5 | Write-Host
}

Write-Host ""
Write-Host "=== Release evidence ==="
Write-Host "Target app:     $ContainerAppName"
Write-Host "Resource group: $ResourceGroup"
Write-Host "Image:          $image"
if ($imageDigest) {
    Write-Host "Image digest:   $imageDigest"
}
else {
    Write-Host "Image digest:   (unavailable from ACR for ${ImageName}:${ImageTag})"
}
if ($sourceCommit) {
    Write-Host "Source commit:  $sourceCommit"
}
else {
    Write-Host "Source commit:  (git unavailable)"
}
Write-Host ""
Write-Host "Rollback this target only:"
Write-Host "  .\deploy\deploy-to-acr.ps1 -ContainerAppName `"$ContainerAppName`" -ImageTag `"<prior-tag>`""
