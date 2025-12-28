# Bot Management Dashboard

A premium, fully animated dashboard for managing bot configurations with real-time synchronization.

## Features

- 🔐 **Authentication**: Secure login/signup with NextAuth.js
- 🎮 **IGG ID Management**: Assign and manage multiple IGG IDs
- ⚙️ **Real-time Settings**: Sync settings with local JSON files instantly
- 🏦 **Bank Settings**: Configure bank parameters and commands
- 📊 **Reports & Analytics**: View comprehensive reports
- 💳 **Subscription Management**: Track subscription status
- ✨ **Premium UI**: Glassmorphism effects, smooth animations, dark theme

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/bot_dashboard"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
CONFIG_PATH="D:\\website-templates\\temp4\\config"
```

**Important**: Update the `DATABASE_URL` with your PostgreSQL credentials.

### 3. Set up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
temp4/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── providers/         # Context providers
│   └── ui/                # UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication helpers
│   ├── fileSync.ts       # JSON file sync utilities
│   ├── prisma.ts         # Prisma client
│   ├── utils.ts          # General utilities
│   └── validators.ts     # Zod schemas
├── prisma/               # Prisma schema
│   └── schema.prisma     # Database schema
├── config/               # Bot configuration files
│   ├── 1221923663/       # IGG ID folder
│   │   ├── settings.json
│   │   └── banksettings.json
│   └── 987303841/        # Another IGG ID folder
└── package.json          # Dependencies

```

## Default Credentials

After setting up the database, you'll need to create a user via the signup page.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner

## Features in Detail

### Real-time Synchronization

The dashboard syncs settings with JSON files in the `config/[iggId]/` directory:
- Changes in the UI update the JSON files
- External changes to JSON files reflect in the UI (future: WebSocket implementation)

### Settings Categories

- Basic Settings
- Protection
- Supply
- Mirage Realm
- Gathering
- Darkness Rally
- Cargo Ship
- Gems/Coins
- Talents
- Heroes
- Buildings
- Research
- Army

### Bank Settings

- Admin Settings
- Command Settings
- Manage Admins

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

© 2025 Bot Management Dashboard. All rights reserved.
