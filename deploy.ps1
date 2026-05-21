# Deploy Script for Windows

$ErrorActionPreference = "Stop"
$appDir = $PSScriptRoot

Set-Location -LiteralPath $appDir

Write-Host "Starting deployment..." -ForegroundColor Green
Write-Host "App directory: $appDir"

# 1. Clean previous build
Write-Host "Cleaning previous build..."
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# 2. Build the application
Write-Host "Building application..."
npm run build

# 3. Verify build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed: npm run build exited with code $LASTEXITCODE"
    exit $LASTEXITCODE
}

if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Error "Build failed: .next\BUILD_ID not found in $appDir. PM2 production start would fail."
    exit 1
}

# 4. Restart PM2
Write-Host "Restarting PM2 process..."
foreach ($name in @("bot-dash", "bot-dashboard", "bot-management-dashboard")) {
    pm2 delete $name 2>$null
}
pm2 start "$appDir\ecosystem.config.js" --update-env
pm2 save

Write-Host "Deployment complete! Application should be running." -ForegroundColor Green
Write-Host "Check logs with: pm2 logs bot-dash"
