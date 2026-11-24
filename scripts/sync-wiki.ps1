# Sync Local Wiki files to GitHub Wiki Repository
$ErrorActionPreference = "Stop"

$repoName = "universal-autonomous-pipeline"
$wikiUrl = "https://github.com/yousef052/$repoName.wiki.git"
$tempDir = Join-Path $env:TEMP "uap-wiki-sync"
$wikiSource = Join-Path $PSScriptRoot "..\wiki"

Write-Host "⚡ Syncing UAP Wiki to GitHub..." -ForegroundColor Cyan

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

try {
    Write-Host "Cloning wiki repository from $wikiUrl..." -ForegroundColor Gray
    git clone $wikiUrl $tempDir
} catch {
    Write-Host "⚠️ Notice: If cloning failed, ensure you have clicked 'Create the first page' once at:" -ForegroundColor Yellow
    Write-Host "   https://github.com/yousef052/$repoName/wiki" -ForegroundColor Yellow
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
        Write-Host "✅ Wiki successfully synchronized with GitHub!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Wiki is already up to date. No changes to push." -ForegroundColor Yellow
    }
} finally {
    Pop-Location
    Remove-Item -Recurse -Force $tempDir
}
