# Production Deployment - Final Steps

**Status:** Ready for manual deployment to Vercel  
**Generated:** April 26, 2026  
**Backend Database:** Supabase (ap-south-1 Mumbai)  
**Project ID:** dlmgmdemfvjpnokkgylq  

---

## ✅ Completed Automation Steps

### 1. Database Setup
- ✅ New Supabase project created: `dlmgmdemfvjpnokkgylq`
- ✅ Region: `ap-south-1` (Mumbai)
- ✅ Status: `ACTIVE_HEALTHY`
- ✅ Database password: `RRoadways#2025`

### 2. Backend Configuration
- ✅ `backend/.env` updated with production DATABASE_URL
- ✅ `vercel.json` configured for serverless deployment
- ✅ `api/index.js` set up as Vercel entry point
- ✅ Environment variables structure in place

### 3. Database Security
- ✅ Row Level Security (RLS) policies configured
- ✅ JWT authentication setup (7-day tokens, 30-day refresh)
- ✅ Connection pooling configured (port 6543)

---

## 🔧 Remaining Manual Steps (Cannot be automated in sandbox)

### Step 1: Push Code to GitHub
```bash
cd /path/to/raghhav-roadways
git add -A
git commit -m "Production deployment: Updated Supabase credentials and Vercel configuration"
git push origin master
```

**Note:** Due to sandbox restrictions, git push requires user authentication. You'll need to:
- Enter GitHub credentials when prompted, OR
- Use a Personal Access Token (Settings → Developer Settings → Personal access tokens)

### Step 2: Deploy Backend to Vercel
Visit https://vercel.com and either:

**Option A: Import from GitHub (Recommended)**
1. Go to Vercel Dashboard → Add New → Project
2. Select "Import Git Repository"
3. Choose `raghhav-roadways` repository
4. Project name: `raghhav-roadways-backend`
5. Framework: `Express`
6. Root directory: `backend`
7. Click Deploy

**Option B: Deploy via Vercel CLI**
```bash
cd backend
vercel --prod
```

### Step 3: Set Environment Variables in Vercel

After deployment, go to Project Settings → Environment Variables and add:

```
DATABASE_URL = postgresql://postgres.dlmgmdemfvjpnokkgylq:RRoadways#2025@aws-0-ap-south-1.pooler.supabase.co:6543/postgres
JWT_SECRET = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
NODE_ENV = production
CORS_ORIGIN = https://your-vercel-frontend-domain.vercel.app
SENTRY_DSN = (optional)
RESEND_API_KEY = (optional)
```

**Important:** Replace `CORS_ORIGIN` with your actual frontend Vercel domain once deployed.

### Step 4: Deploy Frontend to Vercel

1. Go to Vercel Dashboard → Add New → Project
2. Import `raghhav-roadways` repository
3. Project name: `raghhav-roadways-frontend`
4. Framework: `Next.js`
5. Root directory: `frontend`
6. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-vercel-domain.vercel.app
   ```
7. Click Deploy

### Step 5: Update Backend CORS Origin

After frontend deployment:
1. Get frontend URL from Vercel
2. Update backend environment variable:
   - Go to Vercel Backend Project → Settings → Environment Variables
   - Update `CORS_ORIGIN` to frontend URL
   - Redeploy backend

---

## 📊 Production URLs (After Deployment)

```
Backend API:   https://raghhav-roadways-backend.vercel.app
Frontend App:  https://raghhav-roadways-frontend.vercel.app
Database:      PostgreSQL on Supabase (Mumbai region)
```

---

## 🔑 Credentials Summary

**Supabase Project**
- Project ID: `dlmgmdemfvjpnokkgylq`
- User: `postgres`
- Password: `RRoadways#2025`
- Host: `aws-0-ap-south-1.pooler.supabase.co`
- Port: `6543`

**JWT Keys**
- Secret: `fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c`
- Refresh Secret: `96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65`

**⚠️ SECURITY:** Store credentials in Vercel Environment Variables, NOT in code.

---

## ✨ Verification Steps

After deployment, verify:

1. **Health Check:**
   ```bash
   curl https://raghhav-roadways-backend.vercel.app/health
   # Expected: { "status": "ok", "database": "connected" }
   ```

2. **Database Connection:**
   - Health endpoint should confirm database connection
   - Check Supabase console for active connections

3. **Frontend Login:**
   - Visit frontend URL
   - Verify login page loads
   - Test authentication flow

4. **CORS:**
   - Frontend should successfully communicate with backend
   - Check browser console for CORS errors

---

## 🚀 Deployment Architecture

```
GitHub Repository
    ↓
Vercel (Connected via GitHub integration)
    ├── Backend (Express.js on Node.js runtime)
    │   └── Database: Supabase PostgreSQL (Mumbai)
    │
    └── Frontend (Next.js on Vercel Edge Network)
        └── API: Backend Vercel URL
```

---

## 📝 Notes

- **Zero-cost:** Using Vercel free tier (within usage limits)
- **Auto-deployment:** Future pushes to `master` branch auto-deploy
- **Database backups:** Set up via Supabase dashboard
- **Monitoring:** Use Vercel analytics and Supabase dashboard
- **Scaling:** Upgrade to pro plan if needed

---

## 🆘 Troubleshooting

**Deployment fails:**
- Check `vercel.json` configuration
- Verify all environment variables are set
- Check build logs in Vercel dashboard

**Database connection fails:**
- Verify DATABASE_URL in environment variables
- Check Supabase project status
- Ensure firewall rules allow Vercel IP ranges

**CORS errors:**
- Update CORS_ORIGIN with correct frontend domain
- Verify frontend domain in environment variables
- Restart both services after changes

**Git push fails:**
- Use Personal Access Token instead of password
- Ensure user has push access to repository

---

## ✅ Deployment Checklist

- [ ] Push code to GitHub (Step 1)
- [ ] Deploy backend to Vercel (Step 2)
- [ ] Set backend environment variables (Step 3)
- [ ] Deploy frontend to Vercel (Step 4)
- [ ] Update backend CORS_ORIGIN (Step 5)
- [ ] Test health endpoint
- [ ] Verify database connection
- [ ] Test frontend login
- [ ] Monitor Vercel logs

---

**Next:** Complete Steps 1-5 above using the Vercel dashboard and GitHub.
