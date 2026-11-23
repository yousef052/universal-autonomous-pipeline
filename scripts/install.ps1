# Universal Autonomous Pipeline (UAP) - Windows PowerShell Installer
Write-Host "=== Installing Universal Autonomous Pipeline (UAP) ===" -ForegroundColor Cyan

# 1. Check Node.js
$nodeVersion = $null
try {
    $nodeVersion = & node -v
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) from https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "  -> Node.js detected: $nodeVersion" -ForegroundColor Green

# 2. Check npm
try {
    $npmVersion = & npm -v
    Write-Host "  -> npm detected: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] npm not found. Continuing with npx..." -ForegroundColor Yellow
}

# 3. Launch UAP Interactive Engine
Write-Host "  -> Launching UAP Interactive Guided Experience..." -ForegroundColor Magenta
& npx universal-autonomous-pipeline@latest
