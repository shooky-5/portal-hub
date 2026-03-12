# Deploy Portal Hub to Vercel (Live in 10 Minutes!)

Follow these steps to deploy your Portal to production with a live database.

---

## Step 1: Create GitHub Repository (2 minutes)

### Option A: Using GitHub Web UI
1. Go to https://github.com/new
2. Repository name: `portal-hub`
3. Description: "Analytic Armory Portal - Decision Intelligence"
4. **Public** (optional - you can keep it private)
5. Click "Create repository"

### Option B: Using GitHub CLI
```bash
gh repo create portal-hub --public
```

---

## Step 2: Push Code to GitHub (1 minute)

```bash
cd C:\Users\Shay Hersh\portal-hub

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/portal-hub.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub!

---

## Step 3: Set Up Vercel Postgres Database (2 minutes)

### Go to Vercel
1. Sign up/login at https://vercel.com
2. Create a new project (or skip if you already have one)
3. Go to **Storage** tab (top menu)
4. Click **Create Database → Postgres**
5. Name: `portal-hub`
6. Region: Choose closest to you
7. Click **Create**

### Copy Connection String
- You'll see a **Connection String** — copy it (looks like `postgresql://user:pass@...`)
- Save it somewhere safe — you'll need it next

✅ Database is ready!

---

## Step 4: Create Vercel Project (2 minutes)

### Option A: From GitHub (Recommended)
1. Go to https://vercel.com/new
2. Import your `portal-hub` GitHub repository
3. Click **Import**

### Option B: Manual
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select GitHub
4. Find and import `portal-hub`
5. Click "Import"

---

## Step 5: Configure Environment Variables (1 minute)

After importing project, you'll see "Configure Project" screen:

1. **Add Environment Variables:**
   - Name: `DATABASE_URL`
   - Value: `postgresql://...` (paste your Vercel Postgres connection string)

   - Name: `SESSION_SECRET`
   - Value: Generate a random string (copy-paste this):
     ```
     f8x7k2j9m1p4q3w5e6r7t8y9u0i1o2a3b4c5d6e7f8g9h0j1k2l3m4n5
     ```

2. Click **Deploy**

✅ Deployment starts!

**Wait 2-3 minutes for deployment to complete...**

---

## Step 6: Initialize Database (1 minute)

Once deployment is complete:

1. You'll see a URL like `portal-hub-xyz.vercel.app`
2. In your browser, call the init endpoint:
   ```
   https://portal-hub-xyz.vercel.app/api/init
   ```
   (Replace `xyz` with your actual URL)

3. You should see:
   ```json
   {
     "success": true,
     "message": "Database initialized successfully"
   }
   ```

✅ **Database is initialized!**

---

## Step 7: Verify It's Live! (1 minute)

Visit your production URL: `https://portal-hub-xyz.vercel.app`

You should see:
- ✅ Portal loads
- ✅ Auto-logs in as DEMO.ANALYST
- ✅ Settings tab shows user profile
- ✅ The Armory tab shows 6 apps (DIOS & XRL with green "ACTIVE" badge)
- ✅ Recent Sessions tab shows 5 demo sessions
- ✅ Platform Status tab shows 5 operational components

**🎉 You're live!**

---

## What Happens Next

### Your Portal is Now:
- ✅ **Live at:** `https://portal-hub-xyz.vercel.app`
- ✅ **Backed by:** PostgreSQL database (Vercel Postgres)
- ✅ **Authenticated:** JWT tokens with auto-login
- ✅ **Persistent:** All data saved to database
- ✅ **Scalable:** Ready for production load

### You Can Now:
1. Share the URL with others
2. Edit settings → they persist
3. Launch apps → sessions are recorded
4. See real-time last-run times
5. Monitor platform health

---

## Troubleshooting

### "Failed to Initialize Database"
- **Check:** Is DATABASE_URL set correctly?
- **Solution:** Go to Vercel dashboard → Settings → Environment Variables
- **Verify:** Copy the connection string from Vercel Storage → Postgres
- **Try again:** Call `/api/init` endpoint

### "Cannot connect to database"
- **Check:** Is the environment variable exactly `DATABASE_URL`?
- **Check:** Redeploy after setting env vars
  - Go to Vercel dashboard → Deployments → Redeploy
- **Wait:** Sometimes takes 1-2 minutes for env vars to apply

### "Port 3000 already in use" (Local testing only)
- This only affects local dev, not production
- You can ignore it for production deployment

### Can't find my URL
- Go to https://vercel.com/dashboard
- Click your `portal-hub` project
- Top right shows your production URL

---

## Customization After Deployment

### Change Your Domain
1. Go to Vercel dashboard → Project settings
2. Click "Domains"
3. Add your custom domain (e.g., `portal.analyticarmory.com`)
4. Follow DNS setup instructions

### Update Code After Deployment
1. Make changes locally
2. `git add` your changes
3. `git commit -m "Update: ..."`
4. `git push`
5. Vercel **automatically redeploys** when you push!

### Access Database
From Vercel Postgres:
```bash
# In Vercel Storage → Postgres → dropdown menu
# Copy the CLI command and run it in terminal
psql postgresql://...
```

---

## Production Checklist

Before sharing your Portal with others:

- [ ] Database initialized (called `/api/init`)
- [ ] Settings save correctly
- [ ] Sessions record when launching apps
- [ ] Last-run times update
- [ ] All 4 tabs work (Armory, Sessions, Status, Settings)
- [ ] Dark/light theme works
- [ ] No console errors
- [ ] Custom domain configured (optional)

---

## Security Notes

### Current Production Setup
✅ HTTPS (enforced by Vercel)
✅ JWT authentication
✅ PostgreSQL secure connection
✅ Environment variables protected
✅ Auto-login (no password needed yet)

### Before Inviting Users
⚠️ Change `SESSION_SECRET` to something unique (NOT the example)
⚠️ Consider enabling password authentication (`/api/auth/login`)
⚠️ Add rate limiting (future enhancement)
⚠️ Set up audit logging (future enhancement)

---

## Next Steps

### Short Term
1. ✅ Portal is live
2. ✅ Database is working
3. Test all features with real data
4. Share URL with team

### Medium Term
1. Add custom domain
2. Enable password authentication
3. Create admin user accounts
4. Set up user invitations

### Long Term
1. Real health monitoring
2. Admin dashboard
3. Analytics tracking
4. OAuth/SSO integration

---

## Support

**Stuck?** Check:
1. `SETUP_DATABASE.md` — Detailed database setup
2. `IMPLEMENTATION_COMPLETE.md` — Architecture overview
3. `TROUBLESHOOTING` section above
4. Vercel docs: https://vercel.com/docs

---

## Quick Reference

| Component | Value |
|-----------|-------|
| **GitHub Repo** | `YOUR_USERNAME/portal-hub` |
| **Vercel Project** | `portal-hub` |
| **Database** | Vercel Postgres |
| **Live URL** | `https://portal-hub-xyz.vercel.app` |
| **Environment Variables** | `DATABASE_URL`, `SESSION_SECRET` |
| **Init Endpoint** | `/api/init` |
| **Auto-login** | `demo@armory.gov` (DEMO.ANALYST) |

---

## It's Live! 🚀

Your Portal is now live on the internet with a real database backing it!

**Share your URL:** `https://portal-hub-xyz.vercel.app`

Everyone who visits will see a real, working application with persistent data!

---

*Next: Consider enabling real user accounts and password authentication for multi-user access*
