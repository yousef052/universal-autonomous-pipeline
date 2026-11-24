# Sync Local Wiki files to GitHub Wiki Repository
$ErrorActionPreference = "Stop"

$repoName = "universal-autonomous-pipeline"
$wikiUrl = "https://github.com/yousef052/$repoName.wiki.git"
$tempDir = Join-Path $env:TEMP "uap-wiki-sync"
$wikiSource = Join-Path $PSScriptRoot "..\wiki"

Write-Host "[SYNC] Syncing UAP Wiki to GitHub..." -ForegroundColor Cyan

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

try {
    Write-Host "Cloning wiki repository from $wikiUrl..." -ForegroundColor Gray
    git clone $wikiUrl $tempDir
} catch {
    Write-Host "[NOTICE] The GitHub Wiki repository has not been initialized yet." -ForegroundColor Yellow
    Write-Host "Please open https://github.com/yousef052/$repoName/wiki and click 'Create the first page' once." -ForegroundColor Yellow
    exit 1
}

# Copy all markdown files
Copy-Item -Path "$wikiSource\*" -Destination $tempDir -Recurse -Force

# Commit and push
Push-Location $tempDir
try {
    git add .
    $status = git status --porcelain
    if ($status) {
        git commit -m "docs(wiki): update wiki documentation pages"
        git push origin master
        Write-Host "[OK] Wiki successfully synchronized with GitHub!" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Wiki is already up to date. No changes to push." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
    Remove-Item -Recurse -Force $tempDir
}
