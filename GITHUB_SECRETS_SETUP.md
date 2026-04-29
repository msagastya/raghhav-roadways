# GitHub Secrets Setup for Auto-Deployment

This guide walks you through setting up the GitHub secrets required for the automated Vercel deployment pipeline.

## Overview

Your GitHub Actions workflow will automatically deploy to Vercel when you push to the `master` branch. However, it needs 5 secrets to be configured in GitHub first.

---

## Step 1: Create Vercel API Token

### Get Your VERCEL_TOKEN

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: `GitHub Actions`
4. Expiration: 90 days (or No Expiration)
5. Scope: Full Account
6. Click "Create"
7. **Copy the token** (you'll only see it once)

---

## Step 2: Get Your Vercel Project IDs

You'll need to create Vercel projects first, OR get existing project IDs.

### Option A: Get IDs from Existing Projects (If Already Deployed)

If you've already deployed to Vercel:

1. Go to https://vercel.com/dashboard
2. Select your backend project
3. Go to Settings → General
4. Find "Project ID" - copy it
5. Note your "Team ID" or "Organization ID" from the URL or settings

Repeat for frontend project.

### Option B: Create Projects First

If you haven't deployed yet:

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your `raghhav-roadways` repository
4. Root directory: `backend`
5. Click "Deploy"
6. After deploy, go to Settings → General to get Project ID

Repeat for frontend.

---

## Step 3: Add Secrets to GitHub

### Access GitHub Secrets

1. Go to https://github.com/msagastya/raghhav-roadways
2. Click "Settings" (top menu)
3. Click "Secrets and variables" → "Actions" (left sidebar)
4. Click "New repository secret"

### Add Each Secret

Add these 5 secrets one by one:

#### 1. VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** [Paste the token from Step 1]
- Click "Add secret"

#### 2. VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** Your Vercel Team/Organization ID
  - Get from: https://vercel.com/account/settings (look for Team ID)
  - Or from Vercel project URL: `vercel.com/YOUR_TEAM/...`
- Click "Add secret"

#### 3. VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** The backend project ID from Vercel
  - Get from: Backend Project → Settings → General → Project ID
- Click "Add secret"

#### 4. VERCEL_BACKEND_URL
- **Name:** `VERCEL_BACKEND_URL`
- **Value:** Your backend domain (without https://)
  - Example: `raghhav-roadways.vercel.app`
  - Get from: Vercel dashboard when backend is deployed
- Click "Add secret"

#### 5. VERCEL_FRONTEND_URL
- **Name:** `VERCEL_FRONTEND_URL`
- **Value:** Your frontend domain (without https://)
  - Example: `raghhav-roadways.vercel.app`
  - Get from: Vercel dashboard when frontend is deployed
- Click "Add secret"

---

## Step 4: Set Environment Variables (Same in Vercel)

The workflow will also deploy with environment variables. Set these in your Vercel projects:

### In Vercel Backend Project (Settings → Environment Variables)

```
DATABASE_URL = postgresql://postgres.dlmgmdemfvjpnokkgylq:RRoadways#2025@aws-0-ap-south-1.pooler.supabase.co:6543/postgres

JWT_SECRET = fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c

JWT_REFRESH_SECRET = 96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65

NODE_ENV = production

CORS_ORIGIN = https://your-frontend-domain.vercel.app
```

**Note:** Replace CORS_ORIGIN with your actual frontend domain.

### In Vercel Frontend Project (Settings → Environment Variables)

```
NEXT_PUBLIC_API_URL = https://your-backend-domain.vercel.app
```

**Note:** Replace with your actual backend domain.

---

## Step 5: Deploy Workflow

Now everything is set up for auto-deployment. Here's what happens:

### When You Push to `master` Branch

```bash
git add -A
git commit -m "Your commit message"
git push origin master
```

GitHub Actions will automatically:
1. ✅ Check out your code
2. ✅ Install dependencies
3. ✅ Run linting (backend & frontend)
4. ✅ Build Next.js frontend
5. ✅ Deploy backend to Vercel
6. ✅ Deploy frontend to Vercel
7. ✅ Run health checks
8. ✅ Notify if deployment fails

**Total time:** 3-5 minutes

---

## Verification

### Check Deployment Status

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click the latest workflow run
4. Watch it execute in real-time
5. All checks should show ✅ green

### After Successful Deployment

1. Visit your backend: `https://your-backend-domain.vercel.app/api/v1/health`
   - Should return: `{ "status": "ok" }`

2. Visit your frontend: `https://your-frontend-domain.vercel.app`
   - Should load without CORS errors

---

## Troubleshooting

### Deployment Fails in GitHub Actions

**Check the logs:**
1. Go to GitHub → Actions
2. Click the failed workflow
3. Click the failed job
4. Scroll down to see error details
5. Common issues:
   - Missing or wrong VERCEL_TOKEN
   - VERCEL_ORG_ID doesn't match token
   - VERCEL_PROJECT_ID doesn't exist
   - Environment variables missing in Vercel

### Backend/Frontend Health Check Fails

**After deployment:**
1. Wait 2 minutes for Vercel to finish initializing
2. Check Vercel dashboard for build logs
3. Verify environment variables are set correctly
4. Check database connection: `DATABASE_URL` should be exactly as provided

### CORS Errors

After both apps are deployed:
1. Update CORS_ORIGIN in backend env vars with frontend domain
2. Redeploy backend (push a dummy commit or redeploy in Vercel UI)

---

## Auto-Deployment Workflow

```
You push to master
        ↓
GitHub detects push
        ↓
GitHub Actions workflow starts
        ↓
Runs tests and builds
        ↓
Deploys to Vercel using VERCEL_TOKEN
        ↓
Backend and Frontend go live
        ↓
Health checks verify deployment
        ↓
✅ Complete!
```

---

## Quick Reference

| Secret Name | Where to Get | Example |
|-------------|-------------|---------|
| VERCEL_TOKEN | https://vercel.com/account/tokens | `abc123def456...` |
| VERCEL_ORG_ID | Vercel settings or project URL | `team_abc123` |
| VERCEL_PROJECT_ID | Vercel Project → Settings | `prj_xyz789` |
| VERCEL_BACKEND_URL | Vercel dashboard | `raghhav-roadways.vercel.app` |
| VERCEL_FRONTEND_URL | Vercel dashboard | `raghhav-roadways.vercel.app` |

---

## After Everything is Set Up

Once secrets are configured and code is pushed:

1. Every push to `master` auto-deploys
2. Both apps update simultaneously
3. Health checks verify everything works
4. Zero manual deployment steps needed

**Your deployment is fully automated!**

---

## Need Help?

If deployment fails, check:
1. GitHub Actions logs (most detailed info)
2. Vercel deployment logs
3. Supabase database connection
4. Environment variables match exactly

Questions? Review this guide or check Vercel/GitHub documentation.
