# Raghhav Roadways - Vercel Deployment Guide

**Status**: ✅ Code Ready for Deployment  
**Date**: April 26, 2026

---

## 🚀 Quick Start: Deploy in 15 Minutes

### Step 1: Deploy Backend to Vercel

#### Option A: Auto-Deploy via Git Push (Recommended)

```bash
# From your local machine, in the raghhav-roadways folder
git add .
git commit -m "Deploy: Production ready - Phase 7 complete"
git push origin master
```

Vercel will **automatically deploy** when you push to master.

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Navigate to backend folder and deploy
cd backend
vercel --prod --name raghhav-roadways-backend
```

---

### Step 2: Configure Backend Environment Variables in Vercel

After deployment, go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add the following:

```
DATABASE_URL = postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres

JWT_SECRET = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c

JWT_REFRESH_SECRET = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65

JWT_EXPIRES_IN = 7d

JWT_REFRESH_EXPIRES_IN = 30d

NODE_ENV = production

PORT = 3000

CORS_ORIGIN = https://your-frontend-vercel-url.vercel.app

MAX_FILE_SIZE = 10485760

DEFAULT_PAGE_SIZE = 10

MAX_PAGE_SIZE = 100

SENTRY_DSN = (leave empty - optional)

RESEND_API_KEY = (leave empty - optional)

EMAIL_FROM = noreply@raghhavroadways.com

COMPANY_NAME = Raghhav Roadways

COMPANY_GSTIN = 27AABCT1234C1Z0

COMPANY_ADDRESS = 123 Transport Hub, Delhi, India

COMPANY_PHONE = 9876543210

COMPANY_EMAIL = info@raghhavroadways.com

COMPANY_BANK_NAME = HDFC Bank

COMPANY_BANK_ACCOUNT = 1234567890123456

COMPANY_BANK_IFSC = HDFC0001234

COMPANY_BANK_BRANCH = New Delhi
```

**Important**: Redeploy after adding env vars:
- Vercel Dashboard → Select Backend Project → **Redeploy** button (top right)

---

### Step 3: Get Your Backend URL

After backend deploys successfully:
- Your backend URL will be: **`https://raghhav-roadways-backend.vercel.app`**
- Test it: `curl https://raghhav-roadways-backend.vercel.app/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-26T..."
}
```

---

### Step 4: Deploy Frontend to Vercel

#### In frontend folder, create/update `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://raghhav-roadways-backend.vercel.app/api/v1
NEXT_PUBLIC_SOCKET_URL=https://raghhav-roadways-backend.vercel.app
```

#### Deploy:

```bash
cd frontend

# Build locally to verify
npm run build

# Deploy to Vercel
vercel --prod --name raghhav-roadways-frontend
```

Or via git push:
```bash
git add .
git commit -m "Deploy: Frontend to Vercel"
git push origin master
```

---

### Step 5: Update Backend CORS for Frontend

Go back to **Vercel Dashboard** → Backend Project → **Environment Variables**

Update:
```
CORS_ORIGIN = https://raghhav-roadways-frontend.vercel.app
```

Then **Redeploy** the backend.

---

## 🧪 Test the Deployment

### 1. Health Check
```bash
curl https://raghhav-roadways-backend.vercel.app/health
```

### 2. Test Admin Login

Navigate to: `https://raghhav-roadways-frontend.vercel.app/admin/login`

**Credentials**:
- Email: `admin@raghhavroadways.com`
- Password: (Set on first login - check admin_users table)

### 3. Check Database Connection

From backend logs in Vercel:
- Dashboard → Backend Project → **Deployments** → Latest → **Logs**
- Look for: `✅ Database connected successfully`

### 4. Test API Endpoint

```bash
curl -X GET https://raghhav-roadways-backend.vercel.app/api/v1/health \
  -H "Content-Type: application/json"
```

---

## 📊 Database Connection Verification

Your Supabase project details:
```
Project ID: uelwxwrklqrrlonxtpmq
Region: ap-south-1 (Mumbai)
Host: db.uelwxwrklqrrlonxtpmq.supabase.co
Database User: app_user
Tables: 9 (users, drivers, rides, wallets, transactions, payments, ratings, admin_users, emergency_contacts)
RLS: ✅ Enabled on all tables
```

Verify connection with Supabase dashboard:
1. Go to: https://app.supabase.com
2. Select project: `uelwxwrklqrrlonxtpmq`
3. Check **SQL Editor** → Run a test query:
```sql
SELECT COUNT(*) as admin_count FROM admin_users;
```

Should return: `1` (your admin user)

---

## 📱 Mobile App Deployment (Optional)

### iOS (App Store)

```bash
cd mobile
eas build --platform ios
# Follow prompts to create Apple Developer account if needed
# Submit to App Store Connect
```

### Android (Google Play)

```bash
eas build --platform android
# Follow prompts to create Google Play account if needed
# Submit to Google Play Console
```

---

## ⚠️ Common Issues & Solutions

### Issue: Backend deployment fails with DATABASE_URL error

**Solution**: 
1. Verify env var is set correctly in Vercel
2. Check password encoding: `%40` = `@`, `%23` = `#`, `%24` = `$`
3. Redeploy after updating env vars

### Issue: Frontend can't connect to backend

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` is set in frontend env
2. Verify backend `CORS_ORIGIN` includes frontend URL
3. Test: `curl https://backend-url/health` from frontend logs

### Issue: Admin login fails

**Solution**:
1. Check admin_users table exists: Go to Supabase SQL Editor
2. Verify admin user: `SELECT * FROM admin_users LIMIT 1;`
3. Reset password if needed: Update hash in database or create new admin user

### Issue: RLS permission errors

**Solution**:
- This is expected! Backend uses Supabase **service role** which bypasses RLS
- Frontend requests go through backend (protected)
- If directly querying from frontend, users will get RLS errors (by design)

---

## 🔒 Security Checklist

- ✅ Database: RLS enabled on all tables
- ✅ Backend: JWT authentication enforced
- ✅ Frontend: API calls go through backend
- ✅ Mobile: Uses same backend auth
- ✅ Passwords: Bcrypt hashed (12 rounds)
- ✅ Env vars: Stored in Vercel (not in git)
- ✅ CORS: Configured for frontend URL

---

## 📝 Post-Deployment Tasks

- [ ] Test user registration flow
- [ ] Test user login → ride booking
- [ ] Test admin dashboard access
- [ ] Test wallet/payment flow
- [ ] Test real-time ride tracking (Socket.io)
- [ ] Test driver app (mobile)
- [ ] Monitor Vercel logs for 24 hours
- [ ] Set up error tracking (optional: Sentry)
- [ ] Enable analytics (optional: Google Analytics)
- [ ] Update app store listings (for mobile)

---

## 🎯 URLs After Deployment

| Service | URL |
|---------|-----|
| Backend API | https://raghhav-roadways-backend.vercel.app |
| Admin Dashboard | https://raghhav-roadways-frontend.vercel.app/admin |
| User App | https://raghhav-roadways-frontend.vercel.app |
| Health Check | https://raghhav-roadways-backend.vercel.app/health |
| API Docs | https://raghhav-roadways-backend.vercel.app/docs |

---

## 🆘 Support

If deployment fails:

1. **Check Vercel Logs**
   - Dashboard → Project → Deployments → Failed → View Logs

2. **Check Backend Logs**
   - Vercel Dashboard → Backend Project → Functions → Logs

3. **Check Database Logs**
   - Supabase Dashboard → Project → Logs

4. **Verify Environment Variables**
   - Ensure all are set in Vercel (Settings → Environment Variables)
   - Redeploy after changes

---

**Last Updated**: April 26, 2026  
**Project Status**: 🚀 **READY FOR PRODUCTION DEPLOYMENT**

Deploy now and monitor the deployment in real-time via Vercel dashboard!
