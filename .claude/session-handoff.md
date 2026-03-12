# Session Handoff — 2026-03-12

## Files Modified (with what changed)

| File | Change |
|------|--------|
| `app/api/reset-apps/route.ts` | Created GET+POST endpoint to reset DB apps; now has all 6 apps with correct names, full names, descriptions, statuses |
| `app/api/apps/route.ts` | Updated ORDER BY to include all 6 app IDs (dios, xrl, trizoning, agent-sourcing, tech-radar, spycraft) |
| `app/components/Portal.tsx` | Added `fullName` subtitle display (colored, uppercase) between app name and description in AppCard |
| `lib/db/seed.ts` | Updated seed data to 6 apps with correct text; fixed demo sessions to reference valid app IDs (removed references to deleted 'compass', 'forecasting') |
| `package.json` / `package-lock.json` | Added missing runtime deps (`jsonwebtoken`, `pg`) and dev deps (`@types/jsonwebtoken`, `@types/pg`) |

## Architectural Decisions

1. **GET handler on `/api/reset-apps`** — Added so the user can reset the DB by visiting a URL in the browser instead of needing curl/POST. Simpler for non-technical use.
2. **Explicit cascade deletes in reset-apps** — `DELETE FROM user_app_last_run` and `user_app_sessions` before `DELETE FROM apps` to avoid foreign key issues, even though schema has `ON DELETE CASCADE`.
3. **fullName shown as colored subtitle** — Displayed between the bold app name and the serif description. Uses `app.color` with 0.8 opacity, uppercase, 11px. Only renders if `fullName !== name`.
4. **Last run tracking is real and per-user** — `user_app_last_run` table stores timestamp per (user_id, app_id). Updated via PUT when user clicks "Launch". Displayed as "Last run: X ago" on active app cards only.
5. **6 apps, 2 active + 4 under development** — Active apps (DIOS, xRL Compass) show "Launch" button and open their URLs. Under-development apps show "UNDER DEVELOPMENT" badge, no click action.
6. **App ordering: active first, then under-dev** — Controlled by SQL `ORDER BY` with explicit CASE statements for deterministic ordering.

## Current State

- **Production is live** at https://www.analyticarmory.com with all 6 apps correctly configured in the database.
- **All 6 app cards render** with name, fullName subtitle, and description.
- **Last run tracking works** — clicking Launch on DIOS or xRL Compass records the timestamp and shows "Last run: X ago" on next page load.
- **Authentication** is email/password (password optional), creates user on first login.
- **Theme detection** reads OS preference on mount (no more layout jumping).

### The 6 Apps

| # | Name | Full Name | Status |
|---|------|-----------|--------|
| 1 | DIOS | Decision Intelligence Operating System | active |
| 2 | xRL Compass | Technology Assessment Intelligence | active |
| 3 | TRIZoning | Technology Dependency Mapping | under_development |
| 4 | Agent Sourcing | Probabilistic Assessment Engine | under_development |
| 5 | Tech Radar | Emerging Technology Early Warning | under_development |
| 6 | Spycraft | Adversarial Scenario Simulation | under_development |

## Exact Next Steps

1. **Verify the logo** — User mentioned the logo changed and wanted it restored. Check if the current `LogoMark` shield SVG in Portal.tsx matches what they expect (commit `0b18e48` was a restore attempt).
2. **Grid layout for 6 cards** — Currently `gridTemplateColumns: 'repeat(3,1fr)'` which gives 2 rows of 3. With 6 apps this is fine, but confirm user is happy with the layout.
3. **Consider protecting `/api/reset-apps`** — Currently unauthenticated and public. Should add auth or remove before real production use.
4. **Clean up unused endpoints** — `/api/fix-xrl` and `/api/init` are legacy and can be removed.

## Gotchas & Constraints

- **Vercel deploy lag**: After `git push`, Vercel takes ~30-50 seconds to deploy. Calling API endpoints too early returns old code. Always wait before testing.
- **Domain redirect**: `analyticarmory.com` redirects to `www.analyticarmory.com` (307). Always use the `www` version for API calls.
- **Frontend caching**: The `useAppStatus` hook fetches apps once on mount (`useEffect([], [])`). After calling `/api/reset-apps`, users must hard-refresh (Ctrl+Shift+R) or log out/in to see updated data.
- **Seed skips if data exists**: `seedApps()` checks `SELECT COUNT(*) FROM apps` and skips if > 0. To force new data, use `/api/reset-apps` instead of `/api/init`.
- **Foreign keys**: `user_app_sessions` and `user_app_last_run` reference `apps(id)`. The reset endpoint deletes from these tables first before clearing apps.
- **TypeScript build**: Dependencies `jsonwebtoken` and `pg` must be installed locally for `next build` to succeed (they were missing initially).
