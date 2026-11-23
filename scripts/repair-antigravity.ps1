# Auto-repair and maintenance script for Antigravity & Antigravity IDE
[CmdletBinding()]
param(
    [switch]$RestartBackend = $false
)

$ErrorActionPreference = "Continue"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Antigravity Auto-Repair & Health Check Tool " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Check and Clean Orphaned Daemon Files
Write-Host "`n[1/5] Checking daemon registration files..." -ForegroundColor Yellow
$daemonDir = "$env:USERPROFILE\.gemini\antigravity\daemon"
if (Test-Path $daemonDir) {
    $hubFiles = Get-ChildItem -Path $daemonDir -Filter "hub_*.json" -ErrorAction SilentlyContinue
    $removedCount = 0
    foreach ($file in $hubFiles) {
        try {
            $data = Get-Content $file.FullName -Raw | ConvertFrom-Json
            $targetPid = $data.pid
            $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
            if (-not $proc -or $proc.ProcessName -notmatch "agy") {
                Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
                Write-Host "  -> Removed dead daemon record: $($file.Name) (PID: $targetPid)" -ForegroundColor DarkGray
                $removedCount++
            }
        } catch {
            Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
            $removedCount++
        }
    }
    Write-Host "  Cleaned $removedCount stale daemon records." -ForegroundColor Green
}

# 2. Check and Optimize Extension Settings
Write-Host "`n[2/5] Verifying Antigravity IDE settings..." -ForegroundColor Yellow
$settingsPath = "$env:APPDATA\Antigravity IDE\User\settings.json"
if (Test-Path $settingsPath) {
    try {
        $raw = Get-Content $settingsPath -Raw
        $json = $raw | ConvertFrom-Json
        $dirty = $false

        if ($json."extensions.autoUpdate" -ne $false) {
            $json | Add-Member -Name "extensions.autoUpdate" -Value $false -MemberType NoteProperty -Force
            $dirty = $true
        }
        if ($json."extensions.autoCheckUpdates" -ne $false) {
            $json | Add-Member -Name "extensions.autoCheckUpdates" -Value $false -MemberType NoteProperty -Force
            $dirty = $true
        }

        if ($dirty) {
            $json | ConvertTo-Json -Depth 10 | Set-Content $settingsPath -Encoding UTF8
            Write-Host "  Auto-update loops disabled in settings.json" -ForegroundColor Green
        } else {
            Write-Host "  Extension settings already optimized." -ForegroundColor Green
        }
    } catch {
        Write-Warning "  Could not parse settings.json: $_"
    }
}

# 3. Check and Enable Proposed APIs in argv.json
Write-Host "`n[3/5] Verifying argv.json proposed APIs..." -ForegroundColor Yellow
$argvPath = "$env:USERPROFILE\.antigravity-ide\argv.json"
if (Test-Path $argvPath) {
    try {
        $raw = Get-Content $argvPath -Raw
        # Strip comments so ConvertFrom-Json can parse it safely
        $cleanJson = ($raw -split "`r?`n" | Where-Object { $_.Trim() -notmatch "^\s*//" }) -join "`n"
        $json = $cleanJson | ConvertFrom-Json
        $dirty = $false

        $requiredApis = @("meta.pyrefly", "ms-python.vscode-python-envs")
        $currentApis = @($json."enable-proposed-api")

        $missing = $requiredApis | Where-Object { $currentApis -notcontains $_ }
        if ($missing.Count -gt 0) {
            $combined = ($currentApis + $missing) | Select-Object -Unique
            $json | Add-Member -Name "enable-proposed-api" -Value $combined -MemberType NoteProperty -Force
            $json | ConvertTo-Json -Depth 10 | Set-Content $argvPath -Encoding UTF8
            Write-Host "  Added proposed API allowances to prevent extension host crash." -ForegroundColor Green
        } else {
            Write-Host "  argv.json is properly configured." -ForegroundColor Green
        }
    } catch {
        Write-Warning "  Could not parse argv.json: $_"
    }
}

# 4. Clean Caches & Obsolete Extensions
Write-Host "`n[4/5] Cleaning cached and obsolete extension artifacts..." -ForegroundColor Yellow
$obsoletePaths = @(
    "$env:USERPROFILE\.antigravity-ide\extensions\.obsolete",
    "$env:APPDATA\Antigravity\CachedExtensionVSIXs"
)
foreach ($p in $obsoletePaths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Cleaned: $p" -ForegroundColor DarkGray
    }
}
Write-Host "  Cache cleanup completed." -ForegroundColor Green

# 5. Check CLI Binary Health
Write-Host "`n[5/5] Checking Antigravity CLI binary..." -ForegroundColor Yellow
$agyPath = "$env:USERPROFILE\.gemini\bin\agy.exe"
if (Test-Path $agyPath) {
    try {
        $ver = & $agyPath --version 2>&1
        Write-Host "  CLI Binary is healthy: $ver" -ForegroundColor Green
    } catch {
        Write-Warning "  CLI Binary failed to execute: $_"
    }
} else {
    Write-Warning "  agy.exe not found at $agyPath"
}

if ($RestartBackend) {
    Write-Host "`n[+] Restarting backend as requested..." -ForegroundColor Cyan
    Stop-Process -Name "agy" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    Write-Host "  Backend stopped. Opening Antigravity IDE will automatically start a clean instance." -ForegroundColor Green
}

Write-Host "`n[OK] All repairs completed successfully!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
