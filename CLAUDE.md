# Analytic Armory Portal — CLAUDE.md

## Project Overview
Next.js 14 (App Router) portal for the Analytic Armory platform. Deployed on Vercel at https://www.analyticarmory.com with Neon PostgreSQL.

## Key Commands
- `npx next build` — build and type-check
- `npx next dev` — local dev server
- `git push` — triggers Vercel auto-deploy (~30-50s)
- Visit `https://www.analyticarmory.com/api/reset-apps` — resets all apps in DB to canonical configuration

## Architecture
- **Frontend**: Single `Portal.tsx` component with inline styles, theme context, 4 views (Armory, Sessions, Status, Settings)
- **Hooks**: `useAuth`, `useAppStatus`, `useLastRun`, `useUserSessions`, `usePlatformStatus`, `useUserSettings`
- **API Routes**: `/api/auth/*`, `/api/apps/*`, `/api/users/*`, `/api/platform/*`, `/api/reset-apps`
- **Database**: Neon PostgreSQL. Schema in `lib/db/schema.sql`. Tables: `users`, `apps`, `user_app_sessions`, `user_app_last_run`, `platform_components`, `component_status_history`
- **Auth**: JWT tokens stored in `localStorage.sessionToken`. Email/password login, user created on first login.

## Important Constraints
- Domain `analyticarmory.com` redirects to `www.analyticarmory.com` — always use `www` for API calls
- `useAppStatus` fetches once on mount — users must hard-refresh after DB changes
- `seedApps()` in seed.ts skips if apps exist — use `/api/reset-apps` to force update
- Foreign keys: delete from `user_app_last_run` and `user_app_sessions` before deleting from `apps`

## Session Handoff
See `.claude/session-handoff.md` for detailed session notes and next steps.
