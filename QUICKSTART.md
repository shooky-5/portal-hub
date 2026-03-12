# Quick Start Guide

## 🚀 Get the Portal Running in 60 Seconds

### 1. Start the Dev Server

```bash
cd C:\Users\Shay Hersh\portal-hub
npm run dev
```

Output:
```
▲ Next.js 14.2.35
- Local:        http://localhost:3000
- Environments: .env.local
```

### 2. Open in Browser

Visit: **http://localhost:3000**

You'll see the login screen with two options:

#### Option A: Use Demo Account (Recommended First Time)
Click **"View Portal →"** button at the bottom
- No credentials needed
- Goes straight to dashboard
- User: `DEMO.ANALYST`

#### Option B: Login (Not Connected Yet)
- User ID: `analyst.id` (any value)
- Passphrase: `password` (any value)
- Press Enter or click "ENTER THE ARMORY"

---

## 🎨 Explore the Portal

### The Armory (Main Tab)
- **6 mission applications** displayed as cards
- Click any card to open the app (Compass/DIOS will work)
- **Platform Principles** section at the bottom
- Dark/Light theme toggle in sidebar

### Recent Sessions
- View analytical session history
- User activity audit trail
- Timestamps and session topics

### Platform Status
- Infrastructure health monitoring
- 5 system components with status
- Real-time status indicators

### Settings
- Analyst profile configuration
- Organization unit, classification level
- Email notification settings

### Theme Toggle
- Click **"Dark"** or **"Light"** in top-right corner of sidebar
- Persists in sidebar user menu
- Smooth transitions between themes

---

## 📁 Project Structure Quick Reference

```
portal-hub/
├── app/
│   ├── components/
│   │   └── Portal.tsx       ← Main UI component (4000+ lines of styles)
│   ├── globals.css          ← Global CSS
│   ├── layout.tsx           ← Root layout
│   └── page.tsx             ← Home page entry
├── public/                  ← Static assets
├── next.config.js
├── tsconfig.json           ← TypeScript config
├── package.json
├── README.md               ← Full documentation
├── DEPLOYMENT.md           ← How to deploy to Vercel
└── ARCHITECTURE.md         ← Auth integration guide
```

---

## 🔗 App Links

The portal links to your existing apps:

- **DIOS:** https://dios.analyticarmory.com
- **Compass:** https://compass.analyticarmory.com

When you click an app card, it opens in a new tab.

*(Locally, these links might not work unless you have local versions running)*

---

## 🎨 Customization

### Change App Colors

Edit `app/components/Portal.tsx`, find the `APPS` array:

```typescript
const APPS = [
  {
    id: 'dios',
    name: 'DIOS',
    color: '#3B82F6',  // ← Change this color
    icon: 'layers',    // ← Or change the icon
    url: 'https://dios.analyticarmory.com',
  },
  // ...
];
```

### Add/Remove App Cards

1. Add entry to `APPS` array with:
   - `id`: Unique identifier
   - `name`: Display name
   - `color`: Hex color code
   - `icon`: Icon name (see `ICONS` object)
   - `url`: Link to app

2. Save and hot-reload (dev server auto-refreshes)

### Change Theme Colors

Edit `THEMES` object in `Portal.tsx`:

```typescript
const THEMES = {
  dark: {
    bgPage: '#0F172A',    // ← Change background colors
    textPri: '#F8FAFC',   // ← Change text colors
    accent: '#60A5FA',    // ← Change accent
    // ... more colors
  },
  light: {
    // Light theme colors
  },
};
```

---

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
# Now at http://localhost:3001
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### TypeScript Errors
Most are safe to ignore while developing. Press `Ctrl+C` to stop dev server, then:
```bash
npm run build
```

This will show actual errors that need fixing.

### Theme Not Changing
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check browser console (F12) for errors

---

## 📝 Make Changes

The dev server auto-reloads when you edit files:

```typescript
// Edit app/components/Portal.tsx
// → Changes appear instantly in browser
```

No need to restart the server.

---

## 🚢 Prepare for Production

### Build for Production
```bash
npm run build
npm start
```

Visit `http://localhost:3000` (production build)

### Deploy to Vercel
See **DEPLOYMENT.md** for step-by-step instructions.

---

## 📚 Next Steps

1. **[x] Start dev server** — `npm run dev`
2. **[ ] Explore the UI** — Click through all tabs
3. **[ ] Customize app cards** — Add your apps
4. **[ ] Configure theme** — Adjust colors to match your branding
5. **[ ] Read DEPLOYMENT.md** — Get ready to deploy
6. **[ ] Read ARCHITECTURE.md** — Plan unified auth integration

---

## ❓ Common Questions

**Q: Why does login not work?**
A: Login is a placeholder right now. Click "View Portal →" to skip auth. Database integration comes in Phase 1.

**Q: Can I add more apps?**
A: Yes! Edit the `APPS` array in `Portal.tsx` and add your app URLs.

**Q: How do I change the domain?**
A: See DEPLOYMENT.md section "Domain Configuration".

**Q: Will my data be lost when I deploy?**
A: No, all styling and configuration is in code. Data will be stored in the shared database once integrated.

**Q: Can I use this without database?**
A: Yes! Current implementation is a beautiful frontend. Database integration is Phase 1.

---

## 🎯 Key Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production build locally
npm start

# Check TypeScript errors
npx tsc --noEmit

# Format code (when added)
npm run lint
```

---

## 📖 Documentation Files

- **README.md** — Full project documentation
- **DEPLOYMENT.md** — How to deploy to Vercel
- **ARCHITECTURE.md** — Database & auth integration plan
- **QUICKSTART.md** — This file!

---

## 🆘 Need Help?

1. Check the error message in terminal
2. Read the relevant documentation file
3. Check Next.js docs: https://nextjs.org/docs
4. Check React docs: https://react.dev

---

**Ready?** Run `npm run dev` now! 🚀
