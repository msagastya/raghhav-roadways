# 🚀 PRODUCTION DEPLOYMENT ROADMAP

**Generated:** April 26, 2026  
**Project:** Raghhav Roadways  
**Estimated Time:** 2-3 hours  
**Cost:** $0  

---

## 📊 DEPLOYMENT FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    YOU START HERE                               │
│         Gather Credentials & Configure Environment              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: PREPARE (30 min)                                      │
│  ✅ Get Supabase password                                       │
│  ✅ Create Vercel tokens                                        │
│  ✅ Create Sentry DSN (optional)                                │
│  ✅ Create Resend API key (optional)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 2: CONFIGURE (30 min)                                    │
│  ✅ Update backend/.env with DATABASE_URL                       │
│  ✅ Update frontend/.env.production                             │
│  ✅ Add GitHub Secrets                                          │
│  ✅ Add Vercel Environment Variables                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 3: DEPLOY BACKEND (30 min)                              │
│  ✅ Create Vercel project from GitHub repo                      │
│  ✅ Configure build settings                                    │
│  ✅ Add environment variables to Vercel                         │
│  ✅ Deploy (GitHub Actions auto-triggers)                       │
│  ✅ Get backend URL                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 4: UPDATE FRONTEND (10 min)                             │
│  ✅ Update frontend/.env.production with backend URL            │
│  ✅ Push to GitHub                                              │
│  ✅ Frontend auto-deploys                                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 5: TEST (30 min)                                         │
│  ✅ Test health endpoint                                        │
│  ✅ Test frontend loads                                         │
│  ✅ Test API calls work                                         │
│  ✅ Test database connection                                    │
│  ✅ Test error tracking (Sentry)                                │
│  ✅ Check monitoring                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ✅ YOU'RE LIVE IN PRODUCTION!                      │
│              Monitor and maintain ongoing                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 CRITICAL INFORMATION YOU NEED

### Your Supabase Database Details
```
Project:     msagastya
Region:      ap-south-1 (Mumbai)
Host:        db.ugqufwuxndvzczcubbmf.supabase.co
Database:    postgres
User:        postgres
Port:        6543 (connection pooler)

Status:      ✅ ACTIVE & HEALTHY
Tables:      ✅ ALL CREATED (20 tables with data)
Backups:     ✅ AUTOMATIC DAILY
```

### Pre-Generated Secrets (Ready to Use)
```
JWT_SECRET:           fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET:   96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
```

### Your Supabase API Keys (Already Generated)
```
Anon Key:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVncXVmd3V4bmR2emN6Y3ViYm1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTI3MzAsImV4cCI6MjA4NzA4ODczMH0.15iF7ZlA-17HIt8Ys4KCwKqPxydavDzLb03ZuX32E8Y
Publishable:  sb_publishable_d2NTlGsMYRA6y2wFoxhTtw_xAMHeEAE
```

---

## 📝 DETAILED STEPS

### PHASE 1: PREPARE (30 minutes)

#### Step 1: Get Supabase Database Password
1. Go to [Supabase Console](https://supabase.com)
2. Select project: **msagastya**
3. Click **Settings** → **Database**
4. Find the Connection Pooler section
5. View the connection string and extract the password
6. Save it somewhere safe (you'll need it in Phase 2)

#### Step 2: Create Vercel Tokens
1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Settings** → **Tokens**
3. Click **Create** → Name it "GitHub CI/CD"
4. Select scope: **Full Account**
5. Expiration: **90 days**
6. Copy the token and save it
7. Go to **Settings** → Copy your **ORG ID**

#### Step 3: Create Sentry Account (Optional)
1. Go to [Sentry.io](https://sentry.io)
2. Sign up with GitHub
3. Create new organization: "Raghhav Roadways"
4. Create new project → Select "Node.js"
5. Copy the DSN (starts with https://)
6. Save it

#### Step 4: Create Resend Account (Optional)
1. Go to [Resend.com](https://resend.com)
2. Sign up with GitHub
3. Click **API Keys**
4. Click **Create API Key** → Name it "Raghhav Backend"
5. Copy the key (starts with re_)
6. Save it

---

### PHASE 2: CONFIGURE (30 minutes)

#### Step 1: Update backend/.env
1. Open `backend/.env` in your editor
2. Find the line: `DATABASE_URL="postgresql://postgres.ugqufwuxndvzczcubbmf:[YOUR_SUPABASE_PASSWORD]@..."`
3. Replace `[YOUR_SUPABASE_PASSWORD]` with your actual password
4. Save the file

#### Step 2: Update GitHub Secrets
1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

```
VERCEL_TOKEN          = [Copy from Vercel]
VERCEL_ORG_ID         = [Copy from Vercel Settings]
DATABASE_URL          = postgresql://postgres.ugqufwuxndvzczcubbmf:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.co:6543/postgres
JWT_SECRET            = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET    = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
SENTRY_DSN            = [Copy from Sentry - optional]
RESEND_API_KEY        = [Copy from Resend - optional]
CORS_ORIGIN           = https://your-frontend.vercel.app
NODE_ENV              = production
```

#### Step 3: Verify .env is in .gitignore
1. Open `.gitignore` in your repo
2. Make sure it contains: `backend/.env`
3. Make sure it contains: `frontend/.env.local`
4. If not, add them

---

### PHASE 3: DEPLOY BACKEND (30 minutes)

#### Step 1: Create Vercel Project
1. Go to [Vercel](https://vercel.com)
2. Click **New Project**
3. Select your GitHub repository: **raghhav-roadways**
4. Click **Import**

#### Step 2: Configure Project Settings
1. **Framework Preset:** Node.js
2. **Root Directory:** ./backend
3. **Build Command:** `npm install && npx prisma generate`
4. **Install Command:** `npm ci`
5. **Output Directory:** Leave blank

#### Step 3: Add Environment Variables to Vercel
1. In Vercel Project Settings → **Environment Variables**
2. Add the same variables from GitHub Secrets:
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - SENTRY_DSN (if using)
   - RESEND_API_KEY (if using)
   - CORS_ORIGIN
   - NODE_ENV

#### Step 4: Deploy
1. Click **Deploy**
2. Wait 5-10 minutes for deployment to complete
3. Once complete, you'll see your backend URL (e.g., `https://my-backend.vercel.app`)
4. **SAVE THIS URL** - you'll need it for the frontend!

#### Step 5: Test Backend Health
1. Open your browser
2. Visit: `https://your-backend.vercel.app/api/v1/health`
3. Should see:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-26T...",
  "uptime": 123.45
}
```

---

### PHASE 4: UPDATE FRONTEND (10 minutes)

#### Step 1: Update Frontend Environment
1. Open `frontend/.env.production`
2. Update: `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1`
   - Replace `your-backend.vercel.app` with your actual Vercel backend URL
3. Save the file

#### Step 2: Push to GitHub
```bash
git add .
git commit -m "chore: update production environment variables"
git push origin main
```

#### Step 3: GitHub Actions Auto-Deploys
1. Frontend should auto-deploy via GitHub Actions
2. Go to your GitHub repo → **Actions** tab
3. Watch the workflow run
4. Should complete in 5-10 minutes
5. Once done, get your frontend URL from Vercel

---

### PHASE 5: TEST (30 minutes)

#### Test 1: Health Endpoint
```bash
curl https://your-backend.vercel.app/api/v1/health
```
Expected: HTTP 200 with status "ok"

#### Test 2: Frontend Loads
1. Visit: `https://your-frontend.vercel.app`
2. Should load without errors
3. Should display login page

#### Test 3: API Calls
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
fetch('https://your-backend.vercel.app/api/v1/parties', {
  headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
})
.then(r => r.json())
.then(d => console.log(d))
```

#### Test 4: Database
1. Login to frontend
2. Navigate to any page with data
3. Should display data from Supabase

#### Test 5: Error Tracking (if using Sentry)
1. Go to Sentry dashboard
2. Should see your project
3. Check for any errors

---

## ✅ SUCCESS CHECKLIST

After all phases, verify:

- [ ] Backend URL responds to health check (HTTP 200)
- [ ] Frontend loads without CORS errors
- [ ] Can login to frontend
- [ ] API calls return data
- [ ] Database shows data
- [ ] Sentry receives errors (if configured)
- [ ] GitHub Actions passed
- [ ] HTTPS enabled on all endpoints
- [ ] Health checks pass

---

## 🔄 WHAT HAPPENS AFTER DEPLOYMENT

### Automatic
- ✅ Health checks run every deployment
- ✅ Sentry captures all errors automatically
- ✅ Database backs up daily
- ✅ GitHub Actions runs on every push

### You Should Do Weekly
- [ ] Check Sentry for errors
- [ ] Review Vercel logs
- [ ] Verify health checks passing

### You Should Do Monthly
- [ ] Update dependencies
- [ ] Review database backups
- [ ] Check storage usage
- [ ] Security audit

---

## 🆘 TROUBLESHOOTING

### Backend Deploy Failed
**Error:** "Cannot find module '@sentry/node'"  
**Fix:** Verify npm install ran (check Vercel logs)

**Error:** "DATABASE_URL not set"  
**Fix:** Check GitHub Secrets → DATABASE_URL is set correctly

**Error:** "Prisma migration failed"  
**Fix:** Verify DATABASE_URL is correct and Supabase is accessible

### Frontend Can't Reach Backend
**Error:** "CORS error"  
**Fix:** Update CORS_ORIGIN in Vercel environment, redeploy backend

**Error:** "API returns 404"  
**Fix:** Verify NEXT_PUBLIC_API_URL is correct in frontend/.env.production

**Error:** "Network error"  
**Fix:** Verify backend is deployed and health check passes

---

## 📞 SUPPORT

### Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Sentry Docs](https://docs.sentry.io)

### Files in Your Repo
- `PRODUCTION_CREDENTIALS_CHECKLIST.md` - Detailed credentials guide
- `SETUP_PRODUCTION_ZERO_COST.md` - Original setup guide
- `IMPLEMENTATION_COMPLETE.md` - Overview of all changes
- `.github/workflows/deploy.yml` - Automated deployment

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. **Right now:**
   - Read `PRODUCTION_CREDENTIALS_CHECKLIST.md`
   - Gather all credentials

2. **Then:**
   - Follow Phase 1 (30 min) - Prepare
   - Follow Phase 2 (30 min) - Configure
   - Follow Phase 3 (30 min) - Deploy Backend
   - Follow Phase 4 (10 min) - Update Frontend
   - Follow Phase 5 (30 min) - Test

3. **Finally:**
   - Monitor in production
   - Update as needed

---

## 🚀 YOU'VE GOT THIS!

Everything is ready. Just follow the steps above and you'll be live in 2-3 hours.

**Questions?** Check the troubleshooting section above.  
**Still stuck?** Review `PRODUCTION_CREDENTIALS_CHECKLIST.md` for detailed credential instructions.

Let's deploy! 🎉
