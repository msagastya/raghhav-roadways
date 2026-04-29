# 🚀 Automated Deployment Guide with Direct Push

**For Raghhav Roadways Production Deployment**

---

## 📋 Overview

This guide uses automated deployment scripts that:
- ✅ Automatically push code to GitHub
- ✅ Update frontend environment variables
- ✅ Display all required Vercel environment variables
- ✅ Provide step-by-step deployment instructions
- ✅ Include health check and testing commands

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Bash Script (Recommended for macOS/Linux)

```bash
cd ~/Desktop/raghhav-roadways
chmod +x deploy.sh
./deploy.sh
```

### Method 2: Node.js Script (Works on All Platforms)

```bash
cd ~/Desktop/raghhav-roadways
node deploy.js
```

### Method 3: Manual Git Push (If scripts don't work)

```bash
cd ~/Desktop/raghhav-roadways
git add .
git commit -m "Deploy: Raghhav Roadways Phase 7 Complete"
git push origin master
```

---

## 📊 What Each Script Does

### deploy.sh (Bash)
- ✅ Verifies git and prerequisites
- ✅ Creates/updates frontend .env.local
- ✅ Pushes code to master branch
- ✅ Displays all environment variables
- ✅ Shows test commands
- ✅ Provides next steps summary

**Time**: ~2-5 minutes

### deploy.js (Node.js)
- ✅ Same functionality as deploy.sh
- ✅ Works on Windows, macOS, Linux
- ✅ Colored output for clarity
- ✅ Better error handling
- ✅ No bash required

**Time**: ~2-5 minutes

---

## 🔄 Direct Push Flow

Once you run one of the deployment scripts:

```
1. Script runs locally (your machine)
   ↓
2. Updates frontend .env.local with backend URL
   ↓
3. Git commits all changes with timestamp
   ↓
4. Git pushes to master branch
   ↓
5. GitHub notifies Vercel via webhook
   ↓
6. Vercel auto-deploys backend (1-2 minutes)
   ↓
7. Vercel auto-deploys frontend (if you push again)
   ↓
8. Backend responds with "database": "connected"
```

---

## 🛠️ Configuration Files

### `ENV_CONFIG.json`
Central configuration file with:
- All 25 backend environment variables
- Frontend environment variables
- Database connection details
- Admin user credentials
- Development and production configs

**Usage**: Reference for environment variable values

### `backend/.env`
Existing backend environment file with:
- Database URL (already set)
- JWT secrets (already generated)
- Company details

**No changes needed** - script uses this as-is

### `frontend/.env.local`
Frontend environment file updated by script with:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

**Automatically updated** by deploy scripts

### `vercel.json`
Vercel deployment configuration:
- Build commands
- Memory allocation
- CORS headers
- Redirects

**Already configured** for your project

---

## 📈 Step-by-Step Deployment

### Phase 1: Run Deployment Script (5 min)

Choose your method:

**Bash** (macOS/Linux):
```bash
cd ~/Desktop/raghhav-roadways
chmod +x deploy.sh
./deploy.sh
```

**Node.js** (Any OS):
```bash
cd ~/Desktop/raghhav-roadways
node deploy.js
```

**Manual**:
```bash
cd ~/Desktop/raghhav-roadways
git add .
git commit -m "Deploy: Raghhav Roadways Phase 7"
git push origin master
```

### Phase 2: Wait for Vercel (1-2 min)

Script output will show:
```
✅ Code pushed to GitHub
⏳ Vercel auto-deployment started
Check: https://vercel.com/dashboard
```

Go to Vercel dashboard and watch the backend deploy.

### Phase 3: Add Environment Variables (3 min)

In Vercel Dashboard:

1. Go to: `raghhav-roadways` → **Settings** → **Environment Variables**
2. Copy all 25 variables from script output (or from `ENV_CONFIG.json`)
3. Add each variable with its value
4. Click **Save**

### Phase 4: Redeploy Backend (2 min)

After adding env vars:

1. Click **Redeploy** button in Vercel (top right)
2. Wait for redeployment to complete

### Phase 5: Test Backend (1 min)

Run health check:
```bash
curl https://raghhav-roadways.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-26T..."
}
```

### Phase 6: Update Frontend (2 min)

Script already updated `frontend/.env.local`. Push again:

```bash
git add frontend/.env.local
git commit -m "Deploy: Frontend env configured"
git push origin master
```

Or let script handle it in next run.

### Phase 7: Update CORS (1 min)

Back in Vercel backend environment variables:

1. Update: `CORS_ORIGIN = https://raghhav-roadways.vercel.app`
2. Click **Save**
3. Click **Redeploy**

### Phase 8: Verify (3 min)

Test all endpoints:

```bash
# Health check
curl https://raghhav-roadways.onrender.com/health

# Frontend loads
curl https://raghhav-roadways.vercel.app

# Admin login page
# Visit: https://raghhav-roadways.vercel.app/admin/login
```

---

## 🔐 Environment Variables Reference

All 25 variables needed:

**Database** (1):
- `DATABASE_URL`

**Authentication** (4):
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

**Server** (3):
- `NODE_ENV`
- `PORT`
- `CORS_ORIGIN`

**Files & Pagination** (4):
- `MAX_FILE_SIZE`
- `STORAGE_PATH`
- `DEFAULT_PAGE_SIZE`
- `MAX_PAGE_SIZE`

**Optional Services** (3):
- `SENTRY_DSN` (leave empty)
- `RESEND_API_KEY` (leave empty)
- `EMAIL_FROM`

**Company** (10):
- `COMPANY_NAME`
- `COMPANY_GSTIN`
- `COMPANY_ADDRESS`
- `COMPANY_PHONE`
- `COMPANY_EMAIL`
- `COMPANY_BANK_NAME`
- `COMPANY_BANK_ACCOUNT`
- `COMPANY_BANK_IFSC`
- `COMPANY_BANK_BRANCH`

---

## 🆘 Troubleshooting

### Script Won't Run

**Bash error**: "permission denied"
```bash
chmod +x deploy.sh
./deploy.sh
```

**Node error**: "Cannot find module"
```bash
cd ~/Desktop/raghhav-roadways
node deploy.js
```

### Git Push Fails

Check if git is configured:
```bash
git config user.email
git config user.name
```

If not set:
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

### Database Connection Error

In Vercel backend logs, check:
- DATABASE_URL has correct password encoding
- `%40` for `@`, `%23` for `#`, `%24` for `$`
- No typos in connection string

### Frontend Can't Reach Backend

Verify:
- `NEXT_PUBLIC_API_URL` is set in frontend/.env.local
- `CORS_ORIGIN` in backend matches frontend URL
- Backend health check responds

---

## 📊 Deployment Timeline

| Phase | Duration | Task |
|-------|----------|------|
| 1 | 2-5 min | Run script / manual push |
| 2 | 1-2 min | Vercel auto-deploy backend |
| 3 | 3 min | Add 25 env vars in Vercel |
| 4 | 2 min | Redeploy backend |
| 5 | 1 min | Test health endpoint |
| 6 | 2 min | Deploy frontend |
| 7 | 1 min | Update CORS origin |
| 8 | 3 min | Verify all endpoints |
| **Total** | **~20 min** | **Production ready** |

---

## 🎯 Success Criteria

✅ Deployment succeeds when:

- ✅ Code pushed to GitHub successfully
- ✅ Vercel backend deployment shows "Ready"
- ✅ Backend health check returns `"database": "connected"`
- ✅ Frontend loads without errors
- ✅ Admin can login at `/admin/login`
- ✅ No errors in Vercel deployment logs
- ✅ API endpoints respond correctly

---

## 📱 After Deployment

### Optional: Mobile App Deployment

```bash
cd mobile

# iOS
eas build --platform ios
# Submit to App Store

# Android
eas build --platform android
# Submit to Google Play
```

### Optional: Monitoring Setup

- Set up Sentry: https://sentry.io/
- Enable Google Analytics
- Configure uptime monitoring
- Set up Vercel notifications

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Console | https://app.supabase.com |
| Backend Health | https://raghhav-roadways.onrender.com/health |
| Admin Dashboard | https://raghhav-roadways.vercel.app/admin |
| GitHub | https://github.com/your-username/raghhav-roadways |

---

## 📞 Quick Reference

**Admin Credentials**:
- Email: `admin@raghhavroadways.com`
- Password: Set on first login

**Database**:
- Host: `db.uelwxwrklqrrlonxtpmq.supabase.co`
- User: `app_user`
- Password: `RaghhavRoadways@2026#Secure$Connection`

**Backend**:
- URL: `https://raghhav-roadways.onrender.com`
- Health: `/health`
- API Base: `/api/v1`

**Frontend**:
- URL: `https://raghhav-roadways.vercel.app`
- Admin: `/admin`
- User: `/`

---

## ✨ Next Phase

Once production is deployed:

1. Monitor logs for 24-48 hours
2. Test all user flows
3. Gather user feedback
4. Plan Phase 8 enhancements
5. Deploy mobile apps (optional)

---

**🚀 Ready to deploy!**

Run one of these commands to start:

```bash
# Bash (macOS/Linux)
chmod +x deploy.sh && ./deploy.sh

# Node.js (Any OS)
node deploy.js

# Manual (Fallback)
git push origin master
```

---

**Last Updated**: April 26, 2026  
**Status**: ✅ Automated Deployment Ready  
**Project**: Raghhav Roadways Phase 7
