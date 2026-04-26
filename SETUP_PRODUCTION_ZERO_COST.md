# PRODUCTION SETUP GUIDE - ZERO COST DEPLOYMENT

**Status:** Step-by-step implementation guide  
**Time Required:** 3-4 hours  
**Cost:** $0  

---

## ✅ CHECKLIST: SETUP SEQUENCE

- [ ] **Step 1:** Create Free Accounts (30 min)
- [ ] **Step 2:** Configure Supabase Database (45 min)
- [ ] **Step 3:** Get API Keys & Secrets (30 min)
- [ ] **Step 4:** Configure GitHub Secrets (15 min)
- [ ] **Step 5:** Deploy Backend to Vercel (30 min)
- [ ] **Step 6:** Update Frontend Configuration (10 min)
- [ ] **Step 7:** Test Everything (30 min)
- [ ] **Step 8:** Enable Monitoring (15 min)

**Total:** ~3-4 hours

---

## STEP 1: Create Free Accounts (30 minutes)

### 1.1 Supabase Account (Database)

```bash
# Visit
https://supabase.com

# Sign up with GitHub (recommended)
# Click "Sign Up" → Select "GitHub"
# Authorize Supabase to access GitHub

# Create new organization
# Click "New Organization" 
# Name: "Raghhav Roadways"
# Region: "Asia Pacific - Singapore" (closest to India)

# Create new project
# Name: "raghhav-roadways"
# Password: Create strong password (save it!)
# Region: "Singapore (ap-southeast-1)"
# Pricing Plan: "Free" tier

# Wait 2-3 minutes for database to be created
```

### 1.2 Sentry Account (Error Tracking)

```bash
# Visit
https://sentry.io

# Sign up with GitHub
# Click "Sign Up" → Select "GitHub"

# Create new organization
# Name: "Raghhav Roadways"

# Create new project
# Platform: "Node.js"
# Alert rule: "All Errors"
# Save the DSN (looks like: https://key@sentry.io/123456)
```

### 1.3 Resend Account (Email Service)

```bash
# Visit
https://resend.com

# Sign up with GitHub
# Click "Sign Up" → Select "GitHub"

# Create API key
# Click "API Keys" → "Create API Key"
# Name it: "Raghhav Backend"
# Copy the key (starts with re_)

# Add your domain (optional, for custom from address)
# Domains → Add Domain → your-domain.com
# Complete DNS verification
```

### 1.4 Cloudflare Account (DNS - Optional)

```bash
# Visit
https://cloudflare.com

# Sign up
# Email: your-email@example.com
# Password: strong password

# Add your domain (if you have one)
# Or skip if using Vercel's auto domain
```

---

## STEP 2: Configure Supabase Database (45 minutes)

### 2.1 Get Database Connection String

```bash
# In Supabase Console:
# 1. Open your project
# 2. Go to Settings → Database → Connection Strings
# 3. Copy the URI that looks like:
# postgresql://postgres.XXXX:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 2.2 Update Backend .env

```bash
# In your backend folder:
# Edit: backend/.env

DATABASE_URL=postgresql://postgres.XXXX:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Other variables to update:
JWT_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-another-random-32-char-string>
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
SENTRY_DSN=https://key@sentry.io/123456
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2.3 Generate Secure Secrets

```bash
# Generate JWT_SECRET (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: 4f5a8c9e2d1b7f3a6c5e8d9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
# Use this for JWT_SECRET

# Generate JWT_REFRESH_SECRET (run again)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: different random string
# Use this for JWT_REFRESH_SECRET
```

### 2.4 Run Database Migrations

```bash
# In backend folder:
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations against Supabase
npx prisma migrate deploy

# Seed demo data
node prisma/seed-demo.js

# Verify (open Prisma Studio)
npx prisma studio
# Visit http://localhost:5555
# Check that all tables have data
```

---

## STEP 3: Get API Keys & Secrets (30 minutes)

### 3.1 Collect All Secrets

Create a file `SECRETS_TO_ADD.txt` with these (don't commit to git!):

```
DATABASE_URL = postgresql://postgres.XXXX:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

JWT_SECRET = 4f5a8c9e2d1b7f3a6c5e8d9f0a1b2c3d (32+ random chars)

JWT_REFRESH_SECRET = different_random_32_chars_here (32+ random chars)

SENTRY_DSN = https://abc123@sentry.io/456789

RESEND_API_KEY = re_1234567890abcdef

CORS_ORIGIN = https://your-domain.vercel.app

NODE_ENV = production
```

### 3.2 Verify No Secrets in Git

```bash
# Check that .env is in .gitignore
cat backend/.gitignore | grep .env

# Output should include: .env

# Make sure .env is not committed
git status

# Should NOT show backend/.env
```

---

## STEP 4: Configure GitHub Secrets (15 minutes)

### 4.1 Create GitHub Secrets

```bash
# Go to your GitHub repository
# Settings → Secrets and variables → Actions

# Create these secrets (click "New repository secret"):
```

**Secret 1: VERCEL_TOKEN**
```
Go to Vercel: Settings → Tokens
Create token → Copy value
Create GitHub secret named: VERCEL_TOKEN
Paste the token value
```

**Secret 2: VERCEL_ORG_ID**
```
Go to Vercel: Settings → Account (or Organization settings)
Copy Organization ID
Create GitHub secret named: VERCEL_ORG_ID
Paste the ID
```

**Secret 3: VERCEL_PROJECT_ID**
```
Go to Vercel: Project → Settings
Copy Project ID from URL or settings
Create GitHub secret named: VERCEL_PROJECT_ID
Paste the ID
```

**Secret 4-10: Environment Variables**
```
Create these GitHub secrets with their values:
DATABASE_URL = [from Supabase]
JWT_SECRET = [32-char random]
JWT_REFRESH_SECRET = [32-char random]
SENTRY_DSN = [from Sentry]
RESEND_API_KEY = [from Resend]
CORS_ORIGIN = [your Vercel domain]
NEXT_PUBLIC_API_URL_STAGING = [backend staging URL]
```

---

## STEP 5: Deploy Backend to Vercel (30 minutes)

### 5.1 Connect GitHub Repository

```bash
# Go to https://vercel.com
# Click "New Project"
# Select your GitHub repository: raghhav-roadways
# Click "Import"
```

### 5.2 Configure Project Settings

```
Framework: Node.js
Root Directory: ./backend
Build Command: npm install && npx prisma generate
Output Directory: .next (leave blank)
Install Command: npm ci
Start Command: node src/server.js (leave blank)
```

### 5.3 Add Environment Variables

In Vercel Project Settings → Environment Variables:

```
DATABASE_URL = [from Supabase]
JWT_SECRET = [32-char random]
JWT_REFRESH_SECRET = [32-char random]
SENTRY_DSN = [from Sentry]
RESEND_API_KEY = [from Resend]
CORS_ORIGIN = https://your-frontend.vercel.app
NODE_ENV = production
```

### 5.4 Deploy

```bash
# In Vercel Dashboard:
# Click "Deploy"
# Wait for deployment to complete (5-10 minutes)

# Get your backend URL:
# https://your-project-name.vercel.app/api/v1

# Save this URL!
```

### 5.5 Test Backend

```bash
# Test health endpoint
curl https://your-project-name.vercel.app/api/v1/health

# Should return:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-04-26T...",
  "uptime": 123.45
}
```

---

## STEP 6: Update Frontend Configuration (10 minutes)

### 6.1 Update .env.production

```bash
# Edit: frontend/.env.production

NEXT_PUBLIC_API_URL=https://your-project-name.vercel.app/api/v1
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=Raghhav Roadways
```

### 6.2 Push to GitHub

```bash
git add .
git commit -m "chore: add production configuration and GitHub Actions"
git push origin main
```

### 6.3 Watch GitHub Actions

```bash
# Go to your GitHub repo
# Click "Actions" tab
# Watch the deployment workflow run
# Should complete successfully in 5-10 minutes
```

---

## STEP 7: Test Everything (30 minutes)

### Test 1: Backend Health

```bash
curl https://your-project-name.vercel.app/api/v1/health

# Expected:
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2: Frontend Loads

```bash
# Visit frontend URL
https://your-frontend.vercel.app

# Should load without errors
# Login should work
# Should see dashboard
```

### Test 3: API Calls Work

```bash
# In browser console:
fetch('https://your-project-name.vercel.app/api/v1/parties', {
  headers: {
    'Authorization': 'Bearer <your-jwt-token>'
  }
})
.then(r => r.json())
.then(d => console.log(d))
```

### Test 4: Database Works

```bash
# In Supabase Console:
# Click "Table Editor"
# Click any table (e.g., "parties")
# Should see your data
```

### Test 5: Errors Tracked

```bash
# In backend, temporarily test error
# This will trigger Sentry notification

# Check Sentry dashboard
# Should see the error logged
```

---

## STEP 8: Enable Monitoring (15 minutes)

### 8.1 Set Up Health Checks

**Option A: GitHub Actions (Built-in)**
```
Already configured in .github/workflows/deploy.yml
Runs after every deployment
Automatically alerts on failure
```

**Option B: UptimeRobot (Free)**
```
Visit https://uptimerobot.com
Sign up (free account)
Create Monitor:
  - Type: HTTP
  - URL: https://your-backend.vercel.app/api/v1/health
  - Interval: 5 minutes
  - Alert: Email
```

### 8.2 Set Up Sentry Alerts

```
Visit https://sentry.io
Go to Alerts → Create Alert Rule
Conditions:
  - An event is captured
Actions:
  - Send email notification
  - (Optional) Send Slack notification
```

### 8.3 Enable Supabase Backups

```
In Supabase Console:
Database → Backups
✓ Backups enabled (automatic daily)
7-day retention (free tier)
```

---

## PRODUCTION CHECKLIST

### Before Going Live

- [ ] Supabase database created and data migrated
- [ ] Backend deployed to Vercel with health endpoint responding
- [ ] Frontend deployed to Vercel
- [ ] CORS configured for production domain
- [ ] All environment variables set
- [ ] Sentry error tracking working
- [ ] GitHub Actions CI/CD working
- [ ] Database backups enabled
- [ ] API endpoints tested and working
- [ ] Frontend can communicate with backend
- [ ] Health checks passing
- [ ] Monitoring alerts configured

---

## PRODUCTION URLS

Save these URLs:

```
Frontend: https://your-frontend.vercel.app
Backend API: https://your-project-name.vercel.app/api/v1
Health Check: https://your-project-name.vercel.app/api/v1/health
Sentry: https://sentry.io/organizations/your-org/
Supabase: https://supabase.com/projects/your-project
```

---

## TROUBLESHOOTING

### Backend Deploy Failed

```
Error: Cannot find module '@sentry/node'
Solution: npm install in backend folder

Error: DATABASE_URL not set
Solution: Check GitHub secrets are set correctly

Error: Prisma migration failed
Solution: Check Supabase database is ready (wait 5 min)
```

### Frontend Can't Reach Backend

```
Error: CORS error
Solution: Update CORS_ORIGIN in backend environment

Error: API returns 404
Solution: Check NEXT_PUBLIC_API_URL is correct

Error: Network error
Solution: Check backend is actually deployed and healthy
```

### Email Not Sending

```
Error: Resend API error
Solution: Check RESEND_API_KEY is correct

Error: 401 Unauthorized
Solution: Verify API key in Resend dashboard is active
```

---

## MONITORING & MAINTENANCE

### Daily
- ✅ Database backups (automatic)
- ✅ Health checks (automatic)
- ✅ Error tracking (automatic)

### Weekly
- [ ] Check Sentry for errors
- [ ] Review Supabase logs
- [ ] Monitor uptime status

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Check storage usage

---

## NEXT STEPS

1. **Now:** Follow these 8 steps
2. **After Deploy:** Run all tests
3. **In Production:** Monitor Sentry and health checks daily
4. **Maintenance:** Weekly review of logs and errors

---

## SUPPORT

Having issues? Check:

1. **Supabase Docs:** https://supabase.com/docs
2. **Vercel Docs:** https://vercel.com/docs
3. **Sentry Docs:** https://docs.sentry.io
4. **This Guide:** Re-read troubleshooting section

---

**You're ready to deploy! Follow the 8 steps above.** 🚀

