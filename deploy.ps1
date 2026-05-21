# Deploy Script for Windows

Write-Host "Starting deployment..." -ForegroundColor Green

# 1. Clean previous build
Write-Host "Cleaning previous build..."
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
}

# 2. Build the application
Write-Host "Building application..."
npm run build

# 3. Verify build
if (-not (Test-Path ".next")) {
    Write-Error "Build failed: .next directory not found!"
    exit 1
}

# 4. Restart PM2
Write-Host "Restarting PM2 process..."
foreach ($name in @("bot-dash", "bot-management-dashboard")) {
    pm2 delete $name 2>$null
}
pm2 start ecosystem.config.js --update-env
pm2 save

Write-Host "Deployment complete! Application should be running." -ForegroundColor Green
Write-Host "Check logs with: pm2 logs bot-dash"
