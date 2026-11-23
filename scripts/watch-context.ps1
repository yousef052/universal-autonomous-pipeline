# Antigravity Context & Latency Watcher Daemon
[CmdletBinding()]
param(
    [int]$ThresholdMB = 15
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Antigravity Context & Memory Watcher Tool                " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$convoDir = "$env:USERPROFILE\.gemini\antigravity\conversations"
$archiveDir = Join-Path $convoDir "archive"
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

# 1. Sweep for oversized active conversations (> 15 MB)
Write-Host "`n[1/4] Checking conversation database sizes..." -ForegroundColor Yellow
$heavyFiles = Get-ChildItem -Path $convoDir -Filter "*.db" | Where-Object { 
    $_.DirectoryName -notmatch "archive" -and $_.Length -gt ($ThresholdMB * 1MB) 
}

$archivedCount = 0
foreach ($f in $heavyFiles) {
    try {
        $dest = Join-Path $archiveDir $f.Name
        Move-Item -Path $f.FullName -Destination $dest -Force
        Write-Host "  -> Safely archived bloated conversation: $($f.Name) ($([math]::Round($f.Length/1MB,1)) MB)" -ForegroundColor Green
        $archivedCount++
    } catch {
        Write-Warning "  File locked (currently active in IDE): $($f.Name)"
    }
}
Write-Host "  Archived $archivedCount oversized conversations." -ForegroundColor Green

# 2. Prune dead hub records
Write-Host "`n[2/4] Pruning dead daemon hub records..." -ForegroundColor Yellow
$daemonDir = "$env:USERPROFILE\.gemini\antigravity\daemon"
if (Test-Path $daemonDir) {
    $hubFiles = Get-ChildItem -Path $daemonDir -Filter "hub_*.json"
    foreach ($h in $hubFiles) {
        try {
            $data = Get-Content $h.FullName -Raw | ConvertFrom-Json
            $p = Get-Process -Id $data.pid -ErrorAction SilentlyContinue
            if (-not $p -or $p.ProcessName -notmatch "agy") {
                Remove-Item $h.FullName -Force -ErrorAction SilentlyContinue
                Write-Host "  -> Removed dead hub record: $($h.Name)" -ForegroundColor DarkGray
            }
        } catch {}
    }
}
Write-Host "  Daemon records validated." -ForegroundColor Green

# 3. Clean temporary download & cache artifacts
Write-Host "`n[3/4] Cleaning temporary staging artifacts..." -ForegroundColor Yellow
$cleanPaths = @(
    "$env:LOCALAPPDATA\Temp\vscode-update*",
    "$env:LOCALAPPDATA\Temp\*.vsix",
    "$env:APPDATA\Antigravity\CachedExtensionVSIXs\*"
)
foreach ($cp in $cleanPaths) {
    Remove-Item $cp -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "  Staging artifacts cleaned." -ForegroundColor Green

# 4. Database Summaries Vacuum
Write-Host "`n[4/4] Optimizing conversation summaries index..." -ForegroundColor Yellow
$summariesDb = "$env:USERPROFILE\.gemini\antigravity\conversation_summaries.db"
if (Test-Path $summariesDb) {
    try {
        python -c "import sqlite3; con = sqlite3.connect(r'$summariesDb'); con.execute('VACUUM;'); con.execute('PRAGMA optimize;'); con.close()"
        $newSize = (Get-Item $summariesDb).Length
        Write-Host "  Summaries database optimized: $([math]::Round($newSize/1MB,2)) MB" -ForegroundColor Green
    } catch {
        Write-Warning "  Could not vacuum database: $_"
    }
}

Write-Host "`n[OK] Memory and context health check completed!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
