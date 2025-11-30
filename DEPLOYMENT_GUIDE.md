# Production Deployment Guide
## Frontend on Vercel + Backend on Render

This guide will help you deploy your Raghhav Roadways application to production.

---

## Prerequisites

1. **GitHub account** with your code pushed
2. **Render account** (free): https://render.com/signup
3. **Vercel account** (free): https://vercel.com/signup

---

## Part 1: Deploy Backend to Render

### Step 1: Create Render Account & New Web Service

1. Go to https://render.com/signup and sign up
2. Click **New +** → **Web Service**
3. Connect your GitHub repository: `msagastya/raghhav-roadways`
4. Click **Connect**

### Step 2: Configure Web Service

Fill in the following details:

- **Name**: `raghhav-roadways-backend`
- **Region**: `Singapore` (or closest to you)
- **Branch**: `master`
- **Root Directory**: Leave empty (we'll use build command)
- **Runtime**: `Node`
- **Build Command**:
  ```bash
  cd backend && npm install && npx prisma generate
  ```
- **Start Command**:
  ```bash
  cd backend && npm start
  ```
- **Instance Type**: `Free`

### Step 3: Add PostgreSQL Database

1. In your Render dashboard, click **New +** → **PostgreSQL**
2. Configure:
   - **Name**: `raghhav-roadways-db`
   - **Database**: `raghhav_roadways`
   - **User**: `raghhav_roadways_user`
   - **Region**: `Singapore` (same as backend)
   - **Instance Type**: `Free`
3. Click **Create Database**
4. **Copy the Internal Database URL** (you'll need this)

### Step 4: Configure Environment Variables

In your backend web service settings, go to **Environment** tab and add these variables:

```
NODE_ENV=production
PORT=5001
API_VERSION=v1
DATABASE_URL=<paste-your-postgres-internal-url-here>
JWT_SECRET=<generate-a-strong-random-string-32-chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<generate-another-strong-random-string-32-chars>
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:3000,https://*.vercel.app,https://raghhav-roadways.vercel.app
STORAGE_PATH=./storage
MAX_FILE_SIZE=10485760
COMPANY_NAME=RAGHHAV ROADWAYS
COMPANY_GSTIN=24BQCPP3322B1ZH
COMPANY_ADDRESS=PLOT NO. D-407, BLD. NO. D-1, 4TH FLOOR, UMANG RESIDENCY NR. SACHIN RAILWAY STATION, SACHIN, SURAT - 394230
COMPANY_PHONE=+91 9727-466-477
COMPANY_EMAIL=raghhavroadways@gmail.com
COMPANY_BANK_NAME=AXIS BANK
COMPANY_BANK_ACCOUNT=924020013795444
COMPANY_BANK_IFSC=UTIB0005605
COMPANY_BANK_BRANCH=STATION ROAD SACHIN
LOG_LEVEL=info
```

**Important**: Generate strong random strings for JWT secrets using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Set Up Database Schema

After the database is created:

1. Go to your PostgreSQL database in Render
2. Click **Connect** → Copy the **External Database URL**
3. On your local machine, run:
   ```bash
   cd backend
   DATABASE_URL="<paste-external-database-url>" npx prisma migrate deploy
   DATABASE_URL="<paste-external-database-url>" npm run prisma:seed
   ```

### Step 6: Deploy Backend

1. Click **Create Web Service** (or **Manual Deploy** if already created)
2. Wait for the build to complete (3-5 minutes)
3. Once deployed, **copy your backend URL**: `https://raghhav-roadways-backend.onrender.com`
4. Test it: `https://raghhav-roadways-backend.onrender.com/api/v1/health`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variables

Update your `frontend/.env.production` file:

```bash
NEXT_PUBLIC_API_URL=https://raghhav-roadways-backend.onrender.com/api/v1
```

**Commit and push this change:**
```bash
git add frontend/.env.production
git commit -m "Update production API URL for Render backend"
git push origin master
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository: `msagastya/raghhav-roadways`
4. Configure:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. **Environment Variables** → Add:
   ```
   NEXT_PUBLIC_API_URL=https://raghhav-roadways-backend.onrender.com/api/v1
   ```
6. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Login to Vercel
npx vercel login

# Deploy from frontend directory
cd frontend
npx vercel --prod

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: raghhav-roadways
# - Directory: ./ (press Enter)
# - Override settings: No
```

### Step 3: Verify Deployment

1. Your app will be live at: `https://raghhav-roadways.vercel.app`
2. Test the application:
   - Try logging in
   - Check if API calls work
   - Test creating a consignment

---

## Part 3: Post-Deployment Setup

### Update CORS on Backend

If you face CORS errors, update the `CORS_ORIGIN` environment variable on Render:

```
CORS_ORIGIN=https://raghhav-roadways.vercel.app,https://*.vercel.app,http://localhost:3000
```

Then redeploy the backend.

### Set Up Auto-Deploy

Both Render and Vercel will automatically redeploy when you push to the `master` branch:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin master

# Frontend: Vercel auto-deploys (1-2 min)
# Backend: Render auto-deploys (3-5 min)
```

---

## Troubleshooting

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Render logs for errors
- Verify all environment variables are set
- Make sure `DATABASE_URL` is correct

**Problem**: Database connection failed
- **Solution**: Use the **Internal Database URL** from Render PostgreSQL
- Make sure database migrations ran successfully

**Problem**: 502 Bad Gateway
- **Solution**: Check if backend is running on correct PORT (5001)
- Verify health check endpoint: `/api/v1/health`

### Frontend Issues

**Problem**: API calls failing (CORS errors)
- **Solution**: Update `CORS_ORIGIN` on Render to include your Vercel domain
- Redeploy backend after updating

**Problem**: Environment variable not working
- **Solution**: Make sure `NEXT_PUBLIC_API_URL` is set in Vercel dashboard
- Redeploy frontend after adding

**Problem**: 404 on routes
- **Solution**: Vercel should auto-detect Next.js rewrites
- Check `vercel.json` configuration

---

## Free Tier Limitations

### Render (Free)
- **Database**: 90 days free (then $7/month for PostgreSQL)
- **Web Service**: Free forever
- Sleeps after 15 minutes of inactivity
- Cold start takes 30-60 seconds

### Vercel (Free)
- 100 GB bandwidth/month
- 100 deployments/day
- Unlimited websites

---

## Maintenance

### Update Dependencies
```bash
# Backend
cd backend
npm update
git add package.json package-lock.json
git commit -m "Update backend dependencies"

# Frontend
cd ../frontend
npm update
git add package.json package-lock.json
git commit -m "Update frontend dependencies"

git push origin master
```

### Monitor Logs

- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → View Function Logs

### Backup Database

```bash
# Download backup from Render dashboard
# PostgreSQL → Backups → Download
```

---

## Production URLs

- **Frontend**: https://raghhav-roadways.vercel.app
- **Backend**: https://raghhav-roadways-backend.onrender.com
- **API Health**: https://raghhav-roadways-backend.onrender.com/api/v1/health

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
