#Requires -Version 5.1
<#
.SYNOPSIS
  Build the qos-storefront Docker image in Azure Container Registry and push it.

.EXAMPLE
  .\deploy\build-and-push-to-acr.ps1

.EXAMPLE
  .\deploy\build-and-push-to-acr.ps1 -ImageTag "0.10.0"
#>
[CmdletBinding()]
param(
    [string] $RegistryName = "qosdevacr",
    [string] $ResourceGroup = "rg-qos-dev-core",
    [string] $ImageName = "qos-storefront",
    [string] $ImageTag = "0.10.0",
    [string] $ProjectRoot = "",
    [switch] $ShowLogs
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
    $scriptDir = $PSScriptRoot
    if (-not $scriptDir) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    if (-not $scriptDir) {
        throw "Could not resolve deploy script directory. Pass -ProjectRoot explicitly."
    }
    $ProjectRoot = (Resolve-Path (Join-Path $scriptDir "..")).Path
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

$fullImage = "${ImageName}:${ImageTag}"

Write-Host "Building and pushing $RegistryName.azurecr.io/$fullImage"
Write-Host "Project root: $ProjectRoot"

Assert-AzCli

Push-Location $ProjectRoot
try {
    $buildArgs = @(
        "acr", "build",
        "--registry", $RegistryName,
        "--image", $fullImage,
        "--resource-group", $ResourceGroup,
        "--only-show-errors"
    )

    if (-not $ShowLogs) {
        $buildArgs += "--no-logs"
    }

    $buildArgs += "."

    $previousErrorActionPreference = $ErrorActionPreference
    $previousPythonUtf8 = $env:PYTHONUTF8
    $previousPythonIoEncoding = $env:PYTHONIOENCODING

    try {
        $env:PYTHONUTF8 = "1"
        $env:PYTHONIOENCODING = "utf-8"
        $ErrorActionPreference = "Continue"

        & az @buildArgs 2>&1 |
            ForEach-Object { Write-Host $_ }

        $azExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
        $env:PYTHONUTF8 = $previousPythonUtf8
        $env:PYTHONIOENCODING = $previousPythonIoEncoding
    }

    if ($azExitCode -ne 0) {
        $latestRun = az acr task list-runs `
            --registry $RegistryName `
            --top 1 `
            -o json `
            2>$null | ConvertFrom-Json

        if ($latestRun -and $latestRun.status -eq "Succeeded") {
            Write-Warning @"
Azure CLI exited with code $azExitCode while streaming build logs, but the latest ACR run succeeded.
This is a known Windows log-encoding issue with Next.js Unicode output. The image was still published.
"@
        }
        else {
            throw "ACR build failed with exit code $azExitCode."
        }
    }

    Write-Host ""
    Write-Host "Image published: $RegistryName.azurecr.io/$fullImage"
}
finally {
    Pop-Location
}
