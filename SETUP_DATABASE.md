# Portal Hub Database Setup Guide

## Prerequisites

### PostgreSQL Installation

**Windows:**
- Download PostgreSQL from https://www.postgresql.org/download/windows/
- Install with default settings
- Note the password you set for the `postgres` user
- PostgreSQL will run on `localhost:5432` by default

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Node.js Dependencies

The required packages have been added to `package.json`:
```bash
npm install
```

This will install:
- `pg` — PostgreSQL client
- `jsonwebtoken` — JWT token creation and verification
- `bcryptjs` — Password hashing (for future use)

## Local Development Setup

### 1. Create Database

**Using psql (recommended):**
```bash
# Open PostgreSQL shell
psql -U postgres

# Create database and user
CREATE DATABASE portal_hub;
CREATE USER portal_user WITH PASSWORD 'your_secure_password';
ALTER ROLE portal_user SET client_encoding TO 'utf8';
ALTER ROLE portal_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portal_user SET default_transaction_deferrable TO on;
ALTER ROLE portal_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portal_hub TO portal_user;
\q
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database URL:
```env
DATABASE_URL=postgresql://portal_user:your_secure_password@localhost:5432/portal_hub
SESSION_SECRET=your-super-secret-key-change-in-production
```

### 3. Initialize Database

Start the development server:
```bash
npm run dev
```

In another terminal, initialize the database by making a POST request:
```bash
curl -X POST http://localhost:3000/api/init
```

You should see output like:
```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

This will:
- Create all tables (users, apps, user_app_sessions, etc.)
- Seed demo user: `demo@armory.gov` (DEMO.ANALYST)
- Seed 6 apps (DIOS active, XRL active, others under-development)
- Seed platform components
- Create sample sessions for the demo user

### 4. Test the Application

1. Open http://localhost:3000
2. The app will auto-login as `DEMO.ANALYST`
3. Navigate to each tab to verify data loads from the database:
   - **The Armory**: Shows 6 apps with correct status badges
   - **Recent Sessions**: Shows seeded sample sessions
   - **Platform Status**: Shows 5 components with operational status
   - **Settings**: Shows user profile that can be edited and saved

## Troubleshooting

### "Database connection refused"
- Check PostgreSQL is running: `sudo systemctl status postgresql` (Linux/Mac)
- Verify DATABASE_URL is correct
- Ensure `portal_hub` database exists: `psql -U postgres -l`

### "relation does not exist"
- Run the initialization endpoint again: `curl -X POST http://localhost:3000/api/init`
- Or manually run `lib/db/schema.sql`

### "no password was provided"
- Check SESSION_SECRET is set in .env.local
- It can be any string, but use something strong in production

### Changes not appearing
- Refresh the page to ensure fresh API calls
- Check browser console for network errors
- Check server logs: `npm run dev` should show any errors

## Vercel Postgres Deployment

When ready to deploy to Vercel:

1. **Create Vercel Postgres Database:**
   - Go to Vercel Dashboard → Storage → Create Database
   - Select PostgreSQL
   - Create a new database named `portal_hub`
   - Copy the connection string (looks like `postgresql://...`)

2. **Set Environment Variable in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with your Vercel Postgres connection string
   - Add `SESSION_SECRET` with a strong random value

3. **Initialize Remote Database:**
   - Push code to GitHub
   - Vercel will deploy automatically
   - Once deployed, call the init endpoint:
     ```bash
     curl -X POST https://your-domain.vercel.app/api/init
     ```
   - Or change `NODE_ENV` check in `/api/init/route.ts` to allow production initialization

4. **Verify:**
   - Visit your Vercel domain
   - Should auto-login and load data from remote PostgreSQL

## Data Schema Reference

### users
- `id` (UUID) — Unique user identifier
- `email` (VARCHAR) — User email, currently "demo@armory.gov"
- `full_name` (VARCHAR) — Display name
- `org_unit` (VARCHAR) — Organization unit
- `classification_level` (VARCHAR) — Security classification
- `password_hash` (VARCHAR) — For future authentication
- `created_at` (TIMESTAMP) — User creation time
- `updated_at` (TIMESTAMP) — Last update time

### apps
- `id` (VARCHAR) — App identifier (dios, xrl, compass, etc.)
- `name` (VARCHAR) — Short name (DIOS, XRL)
- `full_name` (VARCHAR) — Full name
- `description` (TEXT) — App description
- `status` (VARCHAR) — 'active' or 'under_development'
- `url` (VARCHAR) — Launch URL
- `color` (VARCHAR) — Hex color code for UI
- `icon` (VARCHAR) — Icon name

### user_app_sessions
- `id` (UUID) — Session record ID
- `user_id` (UUID) — User who ran the session
- `app_id` (VARCHAR) — App that was run
- `topic` (TEXT) — Analysis topic or name
- `launched_at` (TIMESTAMP) — When the session started
- `completed_at` (TIMESTAMP) — When the session ended (optional)
- `notes` (TEXT) — Additional notes (optional)

### user_app_last_run
- `user_id` (UUID) — User
- `app_id` (VARCHAR) — App
- `last_run_at` (TIMESTAMP) — Last time user launched this app
- PRIMARY KEY: (user_id, app_id)

### platform_components
- `id` (VARCHAR) — Component ID
- `label` (VARCHAR) — Display name
- `status` (VARCHAR) — 'operational', 'degraded', or 'outage'
- `note` (TEXT) — Status description

### component_status_history
- `id` (UUID) — History record ID
- `component_id` (VARCHAR) — Which component
- `status` (VARCHAR) — Status at time of record
- `note` (TEXT) — Note about status change
- `recorded_at` (TIMESTAMP) — When this was recorded

## API Reference

All endpoints require `Authorization: Bearer {token}` header.

### Authentication
- `POST /api/auth/login` — Auto-login demo user
- `POST /api/auth/validate` — Validate session token

### Users
- `GET /api/users/profile` — Get current user
- `GET /api/users/[id]` — Get user settings
- `PUT /api/users/[id]` — Update user settings

### Apps
- `GET /api/apps` — List all apps
- `GET /api/apps/[id]` — Get single app
- `GET /api/apps/[id]/last-run` — Get last run time
- `PUT /api/apps/[id]/last-run` — Update last run time
- `GET /api/apps/sessions` — Get user's sessions
- `POST /api/apps/sessions` — Record new session

### Platform
- `GET /api/platform/status` — Get platform health

## Security Notes

- ⚠️ **Do not commit `.env.local`** — It's already in `.gitignore`
- ⚠️ **Change `SESSION_SECRET` in production** — Use a strong random value
- ⚠️ **Password enforcement is disabled** — Demo mode auto-logs in. Enable in `/api/auth/login` when ready
- ⚠️ **Disable init endpoint in production** — Change NODE_ENV check in `/api/init/route.ts`

## Next Steps

1. ✅ Database set up and seeded
2. ✅ API endpoints working
3. 🔄 Frontend hooks connected (next phase)
4. 🔄 Portal.tsx refactored to use real data
5. ✅ Ready for deployment

All infrastructure is now in place. The remaining work is to update the Portal.tsx component to use the new hooks and APIs instead of hardcoded mock data.
