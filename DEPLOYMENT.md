# Analytic Armory Portal — Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Next.js 14 project initialized
- [x] React components built with TypeScript
- [x] Theme system (dark/light mode)
- [x] App linking to Compass & DIOS
- [x] Production build verified
- [ ] Vercel account configured
- [ ] Domain DNS setup
- [ ] GitHub repository created
- [ ] Environment variables configured

---

## Step 1: Push to GitHub

```bash
cd C:\Users\Shay Hersh\portal-hub

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Analytic Armory portal with Next.js 14"

# Create repo at github.com and push
git remote add origin https://github.com/your-username/portal-hub.git
git branch -M main
git push -u origin main
```

---

## Step 2: Set Up Vercel

1. **Sign up/Log in to Vercel:** https://vercel.com
2. **Import project:**
   - Click "New Project"
   - Connect your GitHub repository
   - Vercel will auto-detect Next.js configuration
3. **Configure deployment:**
   - **Project Name:** `portal-hub`
   - **Framework:** Next.js
   - **Build Command:** (auto-detected)
   - **Output Directory:** `.next`
   - Click "Deploy"

Vercel will provide a preview URL like `https://portal-hub.vercel.app`

---

## Step 3: Domain Configuration (analyticarmory.com)

### Current DNS Setup
You mentioned Cloudflare is currently handling DNS. Here's how to update it:

**Option A: Use Vercel DNS (Recommended for simplicity)**

1. In Vercel project settings → **Domains**
2. Add `analyticarmory.com`
3. Vercel will generate nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
4. Update nameservers at your domain registrar

**Option B: Keep Cloudflare, add CNAME**

1. In Vercel project settings → **Domains**
2. Add `analyticarmory.com`
3. Get the CNAME value (e.g., `cname.vercel-dns.com`)
4. In Cloudflare:
   - Type: `CNAME`
   - Name: `@` (for apex domain)
   - Value: Vercel's CNAME
   - Proxy status: DNS only (gray cloud)

---

## Step 4: Subdomain Configuration

Your existing apps need to stay at:
- `compass.analyticarmory.com` → Compass app
- `dios.analyticarmory.com` → DIOS app

**In Cloudflare (or wherever they're currently hosted):**
- These should already have CNAME/A records pointing to their current hosts
- They will NOT change—only the apex domain `analyticarmory.com` points to Vercel

---

## Step 5: Environment Variables (Future)

When you integrate with the shared database, add to Vercel:

1. Go to **Settings → Environment Variables**
2. Add:
   ```
   DATABASE_URL=postgresql://user:password@gcp-instance/db
   JWT_SECRET=your-secret-key
   ```
3. Redeploy after adding

---

## Verification

After deployment, verify:

✅ `https://analyticarmory.com` → Portal (on Vercel)
✅ `https://compass.analyticarmory.com` → Compass app (external)
✅ `https://dios.analyticarmory.com` → DIOS app (external)

---

## Continuous Deployment

Every push to `main` branch auto-deploys:

```bash
git push origin main
# → Vercel automatically builds and deploys
```

---

## Troubleshooting

**"Domain not verifying"**
- Wait 24-48 hours for DNS propagation
- Check nameserver configuration is correct

**"Build failing on Vercel"**
- Check build logs in Vercel dashboard
- Ensure `.env.local` is NOT committed (in `.gitignore`)

**"Apex domain not working"**
- Apex domains (without `www.`) require proper DNS setup
- Verify in Vercel's DNS settings

---

## Next: Unified Authentication

Once portal is live, integrate with shared database:

1. Create `lib/db.ts` for PostgreSQL connection
2. Create API route: `/api/auth/login`
3. Store session in shared `session` table
4. Update Login component to call `/api/auth/login`
5. Share JWT token with Compass & DIOS

See `ARCHITECTURE.md` for details.

---

## Rollback

If needed, revert to a previous deployment:

1. Go to Vercel dashboard → **Deployments**
2. Find a working deployment
3. Click the three dots → **Promote to Production**

---

## Support

For deployment issues:
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
- Contact: Analytic Armory team
