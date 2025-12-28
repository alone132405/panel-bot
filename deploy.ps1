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

# 3. Verify standalone build
if (-not (Test-Path ".next\standalone")) {
    Write-Error "Build failed: .next\standalone directory not found!"
    exit 1
}

# 4. Copy static assets (Required for Output: Standalone)
Write-Host "Copying static assets to standalone build..."

# Copy public folder
if (Test-Path "public") {
    Copy-Item -Path "public" -Destination ".next\standalone\public" -Recurse -Force
}

# Copy .next/static folder
if (Test-Path ".next\static") {
    New-Item -ItemType Directory -Force -Path ".next\standalone\.next\static" | Out-Null
    Copy-Item -Path ".next\static\*" -Destination ".next\standalone\.next\static" -Recurse -Force
}

Write-Host "Assets copied successfully."

# 5. Restart PM2
Write-Host "Restarting PM2 process..."
pm2 delete bot-management-dashboard
pm2 start ecosystem.config.js
pm2 save

Write-Host "Deployment complete! Application should be running." -ForegroundColor Green
Write-Host "Check logs with: pm2 logs bot-management-dashboard"
