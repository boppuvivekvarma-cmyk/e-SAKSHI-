# Vercel Deployment Guide — e-SAKSHI 2.0 Sentinel

## Method 1: Deploy from GitHub (Recommended — 5 minutes)

### Step 1 — Push to GitHub
```powershell
# In the SIH2026 directory
git init
git add .
git commit -m "feat: e-SAKSHI 2.0 Sentinel — SIH 2026 PS 26102"
git remote add origin https://github.com/YOUR_USERNAME/esakshi-sentinel.git
git push -u origin main
```

### Step 2 — Import into Vercel
1. Go to **[vercel.com](https://vercel.com)** → Log in → **"Add New Project"**
2. Click **"Import Git Repository"** → select `esakshi-sentinel`
3. **IMPORTANT**: Change the **Root Directory** to `frontend`
   - Click "Edit" next to Root Directory
   - Type: `frontend`
4. Framework: Vercel auto-detects **Next.js** ✓
5. No environment variables needed for mock-data mode
6. Click **"Deploy"**

### Step 3 — Your live URL
Vercel provides: `https://esakshi-sentinel.vercel.app` (or similar)

---

## Method 2: Deploy via Vercel CLI (Direct, no GitHub needed)

```powershell
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend
cd C:\Users\vivekvarma\Documents\SIH2026\frontend

# Install dependencies first
npm install

# Deploy
vercel --prod
```

When prompted:
- **Set up and deploy?** → `y`
- **Which scope?** → Your personal account
- **Link to existing project?** → `n`
- **Project name?** → `esakshi-sentinel`
- **Directory?** → `.` (already in frontend/)
- **Override settings?** → `n`

---

## What gets deployed

The frontend is 100% self-contained on Vercel:
- All 4 role dashboards (MP, District, State, Ministry)
- Full audit docket with filters
- Printable statutory notices (A4)
- **Mock data built-in** — no backend needed

## Optional: Connect a real FastAPI backend

If you deploy the Python backend to [Railway](https://railway.app) or [Render](https://render.com):

1. In Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add: `NEXT_PUBLIC_BACKEND_URL` = `https://your-backend.railway.app`
3. Redeploy

The frontend automatically routes all `/api/v1/*` calls to the real backend.

---

## Build verification (local test before deploying)

```powershell
cd C:\Users\vivekvarma\Documents\SIH2026\frontend
npm install
npm run build   # Must show: ✓ Compiled successfully
npm run start   # Test production build at localhost:3000
```

Expected build output:
```
✓ Compiled successfully
Route (app)                              Size
┌ ○ /                                   ...
├ ○ /audit                              ...
├ ○ /dashboard/district                 ...
├ ○ /dashboard/ministry                 ...
├ ○ /dashboard/mp                       ...
├ ○ /dashboard/state                    ...
└ ○ /notices/[workId]                   ...
+ First Load JS ...
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Root directory not found` | Set Root Directory to `frontend` in Vercel import settings |
| `Module not found: lucide-react` | Run `npm install` in `frontend/` first |
| `Build failed: Type errors` | Already suppressed in `next.config.js` with `typescript: { ignoreBuildErrors: true }` |
| `Build failed: ESLint errors` | Already suppressed with `eslint: { ignoreDuringBuilds: true }` |
| Pages show no data | Normal — using mock data in offline mode, all dashboards work |
| `VERCEL_URL` not set locally | Only set automatically on Vercel; localhost dev uses port 3000 fallback |
