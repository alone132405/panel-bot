---
description: Deploy Next.js app to Windows VPS with IIS and domain setup
---

# VPS Deployment Guide for konohabazar.store

## Prerequisites
- Windows VPS with RDP access
- Node.js installed
- PostgreSQL running on VPS
- Domain: konohabazar.store

---

## Step 1: Point Domain DNS to VPS

1. Go to your domain registrar (where you bought konohabazar.store)
2. Find **DNS Settings** or **DNS Management**
3. Add/Update these DNS records:
   - **Type**: A Record
   - **Name**: @ (or leave blank)
   - **Value**: Your VPS IP address (e.g., 123.456.789.10)
   - **TTL**: 3600 (or default)
4. Add another A record for www:
   - **Type**: A Record
   - **Name**: www
   - **Value**: Same VPS IP address
   - **TTL**: 3600
5. Wait 5-30 minutes for DNS propagation

To check if DNS is working, run in PowerShell:
```powershell
nslookup konohabazar.store
```

---

## Step 2: Clone Repository on VPS

Connect to VPS via RDP, then open PowerShell as Administrator:

```powershell
# Navigate to where you want the project
cd C:\

# Clone the repository
git clone https://github.com/alone132405/panel-bot.git

# Enter the project folder
cd panel-bot
```

---

## Step 3: Configure Environment Variables

Create or update the `.env` file:

```powershell
# Copy example env if exists, or create new
notepad .env
```

Add these variables (update with your actual values):
```
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
NEXTAUTH_SECRET="your-super-secret-key-here-make-it-long-and-random"
NEXTAUTH_URL="https://konohabazar.store"
```

---

## Step 4: Install Dependencies and Build

```powershell
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate deploy

# Build the production version
npm run build
```

---

## Step 5: Install PM2 (Process Manager)

PM2 keeps your app running after you close RDP:

```powershell
# Install PM2 globally
npm install -g pm2

# Install PM2 Windows service
npm install -g pm2-windows-startup
pm2-startup install

# Start the app with PM2
pm2 start npm --name "panel-bot" -- start

# Save the PM2 process list
pm2 save
```

To check status:
```powershell
pm2 status
pm2 logs panel-bot
```

---

## Step 6: Install and Configure IIS

### 6.1 Install IIS with URL Rewrite

1. Open **Server Manager** → **Add Roles and Features**
2. Select **Web Server (IIS)**
3. Install with default options

Download and install:
- **URL Rewrite Module**: https://www.iis.net/downloads/microsoft/url-rewrite
- **Application Request Routing (ARR)**: https://www.iis.net/downloads/microsoft/application-request-routing

### 6.2 Enable ARR Proxy

1. Open **IIS Manager**
2. Click on server name (root level)
3. Double-click **Application Request Routing Cache**
4. Click **Server Proxy Settings** on right panel
5. Check **Enable proxy**
6. Click **Apply**

---

## Step 7: Create IIS Website for Reverse Proxy

### 7.1 Create website folder and web.config

```powershell
# Create folder for IIS website
mkdir C:\inetpub\konohabazar

# Create web.config
notepad C:\inetpub\konohabazar\web.config
```

Paste this content:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <system.webServer>
        <rewrite>
            <rules>
                <rule name="ReverseProxyInboundRule1" stopProcessing="true">
                    <match url="(.*)" />
                    <action type="Rewrite" url="http://localhost:3000/{R:1}" />
                </rule>
            </rules>
        </rewrite>
    </system.webServer>
</configuration>
```

### 7.2 Create IIS Website

1. Open **IIS Manager**
2. Right-click **Sites** → **Add Website**
3. Configure:
   - **Site name**: konohabazar
   - **Physical path**: C:\inetpub\konohabazar
   - **Binding**: 
     - Type: http
     - Host name: konohabazar.store
4. Click **OK**

### 7.3 Add www binding

1. Select your site in IIS
2. Click **Bindings** on right panel
3. Add:
   - Type: http
   - Host name: www.konohabazar.store

---

## Step 8: Install SSL Certificate (HTTPS)

Use **win-acme** for free Let's Encrypt SSL:

```powershell
# Download win-acme
cd C:\
Invoke-WebRequest -Uri "https://github.com/win-acme/win-acme/releases/download/v2.2.9.1701/win-acme.v2.2.9.1701.x64.pluggable.zip" -OutFile "win-acme.zip"

# Extract
Expand-Archive -Path win-acme.zip -DestinationPath C:\win-acme

# Run win-acme
cd C:\win-acme
.\wacs.exe
```

Follow the prompts:
1. Choose **N** for new certificate
2. Choose **1** for IIS site
3. Select your konohabazar site
4. Accept defaults for the rest

The certificate will auto-renew.

---

## Step 9: Configure Firewall

Open PowerShell as Administrator:

```powershell
# Allow HTTP (port 80)
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
```

---

## Step 10: Test Your Website

1. Open browser and go to: https://konohabazar.store
2. You should see your login page
3. Test login functionality

---

## Troubleshooting

### Check if Next.js is running:
```powershell
pm2 status
pm2 logs panel-bot
```

### Restart the app:
```powershell
pm2 restart panel-bot
```

### Check IIS configuration:
```powershell
# Test if port 3000 is accessible locally
Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing
```

### Check DNS propagation:
Visit: https://dnschecker.org/#A/konohabazar.store

---

## Quick Commands Reference

```powershell
# View app status
pm2 status

# View logs
pm2 logs panel-bot

# Restart app
pm2 restart panel-bot

# Stop app
pm2 stop panel-bot

# Update code (after git push)
cd C:\panel-bot
git pull
npm install
npm run build
pm2 restart panel-bot
```
