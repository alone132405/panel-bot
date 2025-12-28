# Setup Guide - Bot Management Dashboard

Follow these steps to get your premium bot management dashboard up and running.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

## Step-by-Step Setup

### Step 1: Install Dependencies

The dependencies are currently being installed. If not already running, execute:

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Prisma & PostgreSQL client
- NextAuth.js
- Framer Motion
- TailwindCSS
- And more...

### Step 2: Configure PostgreSQL Database

1. **Create a new PostgreSQL database**:

```sql
CREATE DATABASE bot_dashboard;
```

2. **Create a `.env` file** in the root directory with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/bot_dashboard"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
CONFIG_PATH="D:\\website-templates\\temp4\\config"
```

**Important Notes**:
- Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials
- Generate a secure random string for `NEXTAUTH_SECRET` (you can use: `openssl rand -base64 32`)
- Update `CONFIG_PATH` if your config directory is in a different location

### Step 3: Initialize Database Schema

Run Prisma migrations to create the database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

This will create the following tables:
- `User` - User accounts
- `IggId` - IGG ID assignments
- `Subscription` - Subscription information
- `ActivityLog` - Activity tracking

### Step 4: (Optional) Seed Initial Data

You can manually create a user through the signup page, or use Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can manually add data.

### Step 5: Verify Config Directory Structure

Ensure your config directory has the correct structure:

```
config/
├── 1221923663/
│   ├── settings.json
│   ├── banksettings.json
│   ├── manageGuild.json
│   └── acc.json
└── 987303841/
    ├── settings.json
    ├── banksettings.json
    ├── manageGuild.json
    └── acc.json
```

The dashboard will read from and write to these JSON files.

### Step 6: Start the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### Step 7: Create Your First Account

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the login page
3. Click "Sign up" to create a new account
4. Fill in your details and create an account
5. Log in with your credentials

### Step 8: Assign IGG IDs to Your Account

Currently, IGG IDs need to be assigned manually through the database. You can use Prisma Studio:

```bash
npx prisma studio
```

1. Open the `IggId` table
2. Click "Add record"
3. Fill in:
   - `iggId`: The IGG ID (e.g., "1221923663")
   - `userId`: Your user ID (from the User table)
   - `isActive`: true
   - `status`: "OFFLINE" or "ONLINE"
4. Save the record

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # Windows
   pg_ctl status
   
   # Or check services
   services.msc
   ```

2. Test your connection string:
   ```bash
   npx prisma db push
   ```

### Port Already in Use

If port 3000 is already in use:

```bash
# Run on a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

If you see "Cannot find module" errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Errors

If Prisma Client is not generated:

```bash
npx prisma generate
```

## Next Steps

Once everything is set up:

1. ✅ Log in to your dashboard
2. ✅ View your assigned IGG IDs
3. ✅ Configure settings for each IGG ID
4. ✅ Manage bank settings
5. ✅ View reports and analytics

## Production Deployment

For production deployment:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   - Use a production PostgreSQL database
   - Generate a strong `NEXTAUTH_SECRET`
   - Update `NEXTAUTH_URL` to your domain

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the production server**:
   ```bash
   npm start
   ```

## Support

If you encounter any issues, check:
- Database connection is working
- All environment variables are set correctly
- Config directory exists and has proper permissions
- Node.js version is 18 or higher

---

**Enjoy your premium bot management dashboard!** 🚀
