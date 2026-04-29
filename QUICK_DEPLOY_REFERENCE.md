# 🚀 Quick Deployment Reference Card

**One-page guide for rapid deployment**

---

## 1️⃣ PUSH CODE TO GIT (5 min)

```bash
cd ~/Desktop/raghhav-roadways
git add .
git commit -m "Deploy: Phase 7 Complete"
git push origin master
```

✅ **Expected**: Vercel starts building backend automatically

**Your URLs**:
- Backend: `https://raghhav-roadways.onrender.com`
- Frontend: `https://raghhav-roadways.vercel.app`

---

## 2️⃣ CONFIGURE BACKEND ENV VARS (3 min)

**Go to**: Vercel Dashboard → Backend → Settings → Environment Variables

**Copy-paste these 25 vars** (from `VERCEL_DEPLOYMENT_GUIDE.md` if needed):

```
DATABASE_URL=postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres
JWT_SECRET=fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET=96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend-vercel-url.vercel.app
MAX_FILE_SIZE=10485760
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
SENTRY_DSN=
RESEND_API_KEY=
EMAIL_FROM=noreply@raghhavroadways.com
COMPANY_NAME=Raghhav Roadways
COMPANY_GSTIN=27AABCT1234C1Z0
COMPANY_ADDRESS=123 Transport Hub, Delhi, India
COMPANY_PHONE=9876543210
COMPANY_EMAIL=info@raghhavroadways.com
COMPANY_BANK_NAME=HDFC Bank
COMPANY_BANK_ACCOUNT=1234567890123456
COMPANY_BANK_IFSC=HDFC0001234
COMPANY_BANK_BRANCH=New Delhi
```

**Click**: Save → Redeploy

✅ **Expected**: Backend redeploys in 2 min

---

## 3️⃣ TEST BACKEND (2 min)

```bash
curl https://raghhav-roadways.onrender.com/health
```

✅ **Should return**: `{"status":"ok","database":"connected",...}`

---

## 4️⃣ DEPLOY FRONTEND (5 min)

**Update**: `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=https://raghhav-roadways.onrender.com/api/v1
```

**Deploy**:
```bash
cd frontend
npm run build
git add .
git commit -m "Deploy: Frontend config"
git push origin master
```

✅ **Expected**: Frontend builds and deploys in 2-3 min

---

## 5️⃣ UPDATE BACKEND CORS (1 min)

Go back to: **Backend → Environment Variables**

**Change**: `CORS_ORIGIN=https://raghhav-roadways.vercel.app`

**Click**: Save → Redeploy

✅ **Expected**: Redeploys in 2 min

---

## 6️⃣ VERIFY EVERYTHING (5 min)

```bash
# Test 1: Frontend loads
curl https://raghhav-roadways.vercel.app

# Test 2: Backend responds
curl https://raghhav-roadways.onrender.com/health

# Test 3: Admin can login
# Visit: https://raghhav-roadways.vercel.app/admin/login
# Email: admin@raghhavroadways.com
```

✅ **Success**: All tests pass!

---

## 🔑 Key Credentials

| Item | Value |
|------|-------|
| Admin Email | admin@raghhavroadways.com |
| Database User | app_user |
| DB Password | RaghhavRoadways@2026#Secure$Connection |
| JWT Secret | fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c |
| Refresh Secret | 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65 |

---

## 📊 Current Status

✅ Database: Configured on Supabase (ap-south-1)  
✅ Backend: Ready to deploy  
✅ Frontend: Ready to deploy  
✅ Security: RLS enabled, JWT auth ready  
✅ Code: 10,000+ lines, all phases complete  

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't deploy | Check env vars in Vercel, check logs |
| Frontend can't reach backend | Verify CORS_ORIGIN matches frontend URL |
| Admin login fails | Check admin_users table in Supabase |
| Database connection error | Verify DATABASE_URL password encoding |

---

## ⏱️ Timeline

- **Phase 1-2**: 5-8 minutes
- **Phase 3**: 2 minutes
- **Phase 4**: 5-7 minutes  
- **Phase 5**: 3 minutes
- **Phase 6**: 2-5 minutes

**Total**: ~20-30 minutes ✨

---

## 📚 Full Guides

- `DEPLOYMENT_ACTION_PLAN.md` - Detailed action steps
- `VERCEL_DEPLOYMENT_GUIDE.md` - Complete guide with troubleshooting
- `DEPLOYMENT_CHECKLIST_FINAL.md` - Full checklist with all tests

---

**🚀 Ready to deploy? Start with Step 1 above!**

Last Updated: April 26, 2026
