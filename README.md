# Analytic Armory Portal

The central hub for the Analytic Armory decision intelligence platform. This Next.js 14 application provides:

- **Mission Applications Hub** — Landing page with links to Compass, DIOS, and future tools
- **Dark/Light Theme Support** — Configurable interface with professional styling
- **Session Dashboard** — View recent analytical sessions
- **Platform Status** — Real-time infrastructure health monitoring
- **Analyst Settings** — Profile configuration

## Architecture

### Current Deployment
- **Domain:** `analyticarmory.com` (this portal)
- **Compass:** `https://compass.analyticarmory.com` (externally hosted)
- **DIOS:** `https://dios.analyticarmory.com` (externally hosted)

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Frontend:** React 18 + TypeScript
- **Styling:** Inline CSS with custom theme tokens
- **Deployment:** Vercel

### Future: Unified Authentication
- Shared PostgreSQL (GCP Cloud SQL) with Compass & DIOS
- Shared tables: `user`, `organization`, `user_role`, `session`
- Planned: Single JWT-based SSO across all apps
- Current: Each app has independent login against shared user table

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

The portal will be available at `http://localhost:3000`

### Demo Mode
- Click **"View Portal →"** on the login screen to skip authentication
- Demo user: `DEMO.ANALYST`

## Building & Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push to GitHub
2. Connect repository to Vercel
3. Set production domain: `analyticarmory.com`
4. Vercel will auto-deploy on push

### Environment Variables
Create `.env.local` for local development (not committed):
```env
# Future: Add when integrating with shared database
# DATABASE_URL=postgresql://...
```

## Project Structure

```
portal-hub/
├── app/
│   ├── components/
│   │   └── Portal.tsx          # Main portal UI component
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── package.json
└── README.md
```

## Key Features

### Theme System
- Dark mode (default)
- Light mode
- Custom color tokens for both themes
- Respects `prefers-color-scheme` media query

### Views
1. **The Armory** — Mission applications grid with app cards
2. **Recent Sessions** — Audit trail of analytical sessions
3. **Platform Status** — Infrastructure health dashboard
4. **Settings** — Analyst profile configuration

### App Card Features
- Real-time status indicators
- Last run timestamps
- One-click launch to external apps
- Hover animations and visual feedback

## Integration with Compass & DIOS

App cards in "The Armory" view link to:
- `https://compass.analyticarmory.com`
- `https://dios.analyticarmory.com`

To add more apps:
1. Edit `APPS` array in `app/components/Portal.tsx`
2. Add app URL to the `url` field
3. Update app card styling with custom colors

## Future Enhancements

### Phase 1: Unified Auth
- Implement JWT-based login at portal level
- Issue tokens that both Compass & DIOS validate
- Single sign-on across all apps

### Phase 2: Database Integration
- Connect to shared GCP Cloud SQL
- User/organization management
- Session tracking

### Phase 3: API Layer
- Portal API for app discovery
- Audit logging
- Usage analytics

## Troubleshooting

**Port 3000 in use:**
```bash
npm run dev -- -p 3001
```

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Security Notes

- All sessions are logged (placeholder text in UI)
- Classification levels enforced in headers
- Follows OWASP security headers
- XSS protection enabled
- Frame options restricted

## Support

For issues or questions, contact the Analytic Armory team.
