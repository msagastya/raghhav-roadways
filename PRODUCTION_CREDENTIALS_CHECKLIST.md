# 🔐 PRODUCTION CREDENTIALS CHECKLIST

**Status:** Generated April 26, 2026  
**Project:** Raghhav Roadways  
**Database:** Supabase (msagastya - ap-south-1 Mumbai)

---

## 📋 What You Need to Gather

This file lists all credentials you need to collect. **NEVER share credentials in chat or email.**

### ✅ Already Done
- [x] JWT_SECRET: `fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c`
- [x] JWT_REFRESH_SECRET: `96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65`

### ❌ You Need to Gather

---

## 1️⃣ SUPABASE DATABASE PASSWORD

**What it is:** Your database password for the Supabase project "msagastya"

**How to get it:**
1. Go to [Supabase Console](https://supabase.com) → Log in
2. Select project: **msagastya**
3. Left sidebar → **Settings** → **Database**
4. Under "Connection Pooler" section, find the connection string
5. Copy the password part (between the `:` and `@`)
6. Or click "Reset password" if you forgot it

**Where it goes:**
```
DATABASE_URL="postgresql://postgres.ugqufwuxndvzczcubbmf:[PASTE_PASSWORD_HERE]@aws-0-ap-south-1.pooler.supabase.co:6543/postgres"
```

**Files to update:**
- `backend/.env` (line 8)
- GitHub Secrets → `DATABASE_URL`
- Vercel Environment → `DATABASE_URL`

**Security:** Keep this SECRET. Never share in chat.

---

## 2️⃣ VERCEL DEPLOYMENT TOKENS

**What they are:** Authentication tokens to deploy from GitHub to Vercel

**How to get them:**

### A. VERCEL_TOKEN
1. Go to [Vercel Dashboard](https://vercel.com)
2. Settings → Tokens → Create
3. Name: "GitHub CI/CD"
4. Expiration: 90 days (recommended)
5. Scope: Full Account
6. Copy the token

**Where it goes:**
- GitHub Secrets → `VERCEL_TOKEN`

### B. VERCEL_ORG_ID
1. Go to [Vercel Settings](https://vercel.com/account/settings)
2. Copy the "ID" field shown on page

**Where it goes:**
- GitHub Secrets → `VERCEL_ORG_ID`

### C. VERCEL_PROJECT_ID
1. After creating your backend project on Vercel
2. Go to Project → Settings → General
3. Copy the "Project ID"

**Where it goes:**
- GitHub Secrets → `VERCEL_PROJECT_ID`

**Security:** Keep tokens SECRET. They allow deploying to Vercel.

---

## 3️⃣ SENTRY ERROR TRACKING (Optional)

**What it is:** Error tracking and monitoring for production

**How to get it:**

1. Go to [Sentry.io](https://sentry.io)
2. Sign up with GitHub
3. Create organization: "Raghhav Roadways"
4. Create project → Select "Node.js"
5. Copy the DSN (looks like: `https://xxx@sentry.io/123456`)

**Where it goes:**
- `backend/.env` → `SENTRY_DSN`
- GitHub Secrets → `SENTRY_DSN`
- Vercel Environment → `SENTRY_DSN`

**Is it required?** No. The app works fine without it.  
**Is it recommended?** Yes. Get error alerts in production.  
**Cost:** Free tier includes 5,000 errors/month (plenty for you).

---

## 4️⃣ RESEND EMAIL SERVICE (Optional)

**What it is:** Sending transactional emails (invoices, payments, notifications)

**How to get it:**

1. Go to [Resend.com](https://resend.com)
2. Sign up with GitHub
3. Click "API Keys" → "Create API Key"
4. Name: "Raghhav Backend"
5. Copy the key (starts with: `re_`)

**Where it goes:**
- `backend/.env` → `RESEND_API_KEY`
- GitHub Secrets → `RESEND_API_KEY`
- Vercel Environment → `RESEND_API_KEY`

**Is it required?** No. Email features are optional.  
**Is it recommended?** Yes. Send professional invoice emails.  
**Cost:** Free tier: 100 emails/month (enough for most usage).

---

## 5️⃣ GITHUB SECRETS CONFIGURATION

**Location:** Your GitHub Repo → Settings → Secrets and variables → Actions

**Create these secrets:**

```
VERCEL_TOKEN          = [From Vercel]
VERCEL_ORG_ID         = [From Vercel]
VERCEL_PROJECT_ID     = [After creating project]
DATABASE_URL          = [From Supabase]
JWT_SECRET            = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET    = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
SENTRY_DSN            = [From Sentry - optional]
RESEND_API_KEY        = [From Resend - optional]
CORS_ORIGIN           = https://your-frontend.vercel.app
NODE_ENV              = production
```

---

## 6️⃣ VERCEL ENVIRONMENT VARIABLES

**Location:** Vercel Dashboard → Project → Settings → Environment Variables

**Add these environment variables:**

```
DATABASE_URL          = [From Supabase]
JWT_SECRET            = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET    = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
SENTRY_DSN            = [From Sentry - optional]
RESEND_API_KEY        = [From Resend - optional]
CORS_ORIGIN           = https://your-frontend.vercel.app
NODE_ENV              = production
```

---

## 📝 STEP-BY-STEP CHECKLIST

### Phase 1: Collect Credentials (30 min)
- [ ] Get Supabase database password
- [ ] Create Vercel token
- [ ] Copy Vercel ORG_ID
- [ ] Create Sentry account & get DSN (optional)
- [ ] Create Resend account & get API key (optional)

### Phase 2: Update .env Files (10 min)
- [ ] Update `backend/.env` with DATABASE_URL
- [ ] Verify `backend/.env` is in .gitignore
- [ ] Update `frontend/.env.production` with backend URL

### Phase 3: Configure GitHub (15 min)
- [ ] Go to GitHub Repo Settings → Secrets
- [ ] Add VERCEL_TOKEN
- [ ] Add VERCEL_ORG_ID
- [ ] Add DATABASE_URL
- [ ] Add all other secrets from list above

### Phase 4: Create Vercel Project (15 min)
- [ ] Go to Vercel
- [ ] New Project → Select your GitHub repository
- [ ] Configure Root Directory: `./backend`
- [ ] Set Environment Variables in Vercel
- [ ] Deploy

### Phase 5: Get Backend URL (5 min)
- [ ] Wait for deployment to complete
- [ ] Copy the Vercel URL (e.g., `https://my-backend.vercel.app`)
- [ ] Update `frontend/.env.production` with this URL
- [ ] Push to GitHub

### Phase 6: Deploy Frontend (10 min)
- [ ] Frontend should auto-deploy (GitHub Actions)
- [ ] Or manually trigger deployment if needed

### Phase 7: Test (20 min)
- [ ] Test health endpoint: `https://your-backend.vercel.app/api/v1/health`
- [ ] Test frontend loads
- [ ] Test API calls work
- [ ] Check Sentry for any errors

---

## 🔒 SECURITY BEST PRACTICES

### DO:
✅ Store credentials in GitHub Secrets (not in .env)  
✅ Store credentials in Vercel Environment Variables  
✅ Rotate tokens every 90 days  
✅ Use different tokens for different services  
✅ Keep .env file in .gitignore  
✅ Use strong passwords

### DON'T:
❌ Share credentials in chat or email  
❌ Commit credentials to git  
❌ Use development credentials in production  
❌ Hardcode secrets in code  
❌ Share tokens with anyone  
❌ Leave tokens in git history

---

## ⚠️ TROUBLESHOOTING

### "DATABASE_URL is not set"
- Check GitHub Secrets are configured
- Check Vercel Environment Variables are set
- Redeploy after adding variables

### "Cannot connect to database"
- Verify DATABASE_URL password is correct
- Check Supabase project is active
- Verify network connectivity

### "JWT_SECRET is invalid"
- Ensure both JWT secrets are in environment variables
- Redeploy after changes

### "CORS error from frontend"
- Update CORS_ORIGIN to match frontend domain
- Redeploy backend
- Clear browser cache

---

## 📚 NEXT STEPS

1. **Gather all credentials** using this checklist
2. **Update .env files** with actual values
3. **Configure GitHub Secrets** for automated deployment
4. **Deploy to Vercel** and get your backend URL
5. **Update frontend** with backend URL
6. **Test everything** to ensure it works

---

## 🆘 STILL CONFUSED?

Each credential has been explained above with:
- ✅ What it is
- ✅ How to get it
- ✅ Where to put it
- ✅ Why you need it
- ✅ Security notes

Take it one step at a time. You've got this! 🚀

---

**Questions?** Check the detailed setup guide: `SETUP_PRODUCTION_ZERO_COST.md`
