# 🚀 Environment Variables - Upload All At Once

**Upload 25 environment variables to Vercel with ONE command**

---

## 📋 Files Created

| File | Purpose |
|------|---------|
| `.env.production` | All 25 variables in standard format |
| `upload-env-to-vercel.sh` | Bash script to upload all variables |
| `upload-env-to-vercel.js` | Node.js script to upload all variables |

---

## ⚡ Quick Start

### Option 1: Bash Script (macOS/Linux)

```bash
cd ~/Desktop/raghhav-roadways
chmod +x upload-env-to-vercel.sh
./upload-env-to-vercel.sh
```

### Option 2: Node.js Script (Any OS)

```bash
cd ~/Desktop/raghhav-roadways
node upload-env-to-vercel.js
```

### Option 3: Manual Upload

You can also manually copy the variables from `.env.production` file and paste them one by one in Vercel dashboard.

---

## 📄 The `.env.production` File

**Contains all 25 variables:**

```
DATABASE_URL=postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres
NODE_ENV=production
PORT=3000
JWT_SECRET=fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET=96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
...
(20 more variables)
```

**What it is**: A standard `.env` format file with all production variables.

**What you can do with it**:
1. Upload via script (automatic)
2. Copy-paste values into Vercel UI (manual)
3. Use with Vercel CLI directly

---

## 🔧 Prerequisites (For Scripts)

### For Bash Script

You need:
- Bash shell
- Vercel CLI installed: `npm install -g vercel`
- Logged into Vercel: `vercel login`

### For Node.js Script

You need:
- Node.js v12+
- Vercel CLI installed: `npm install -g vercel`
- Logged into Vercel: `vercel login`

---

## 📝 How The Scripts Work

### What They Do:

1. ✅ Check prerequisites (Vercel CLI, login status)
2. ✅ Read `.env.production` file
3. ✅ Parse all 25 variables
4. ✅ Upload each variable to Vercel
5. ✅ Trigger automatic redeployment
6. ✅ Show status and next steps

### What They Output:

```
✓ Vercel CLI installed
✓ .env.production file found
✓ Verified user: your-email@example.com
✓ Read 25 environment variables
  Setting DATABASE_URL... ✓
  Setting JWT_SECRET... ✓
  ...
✓ Successfully uploaded 25/25 variables
✓ Redeployment triggered
```

---

## 🎯 Your Complete Deployment Path

### Step 1: Push Code (Automated)
```bash
cd ~/Desktop/raghhav-roadways
chmod +x start-deployment.sh
./start-deployment.sh
```

**Result**: Code pushed, backend auto-deploying

---

### Step 2: Upload Environment Variables (Choose One)

**Option A: Automatic (Recommended)**
```bash
chmod +x upload-env-to-vercel.sh
./upload-env-to-vercel.sh
```

**Option B: Automatic (Node.js)**
```bash
node upload-env-to-vercel.js
```

**Option C: Manual**
1. Go to: https://vercel.com/dashboard
2. Select: `raghhav-roadways`
3. Settings → Environment Variables
4. Copy-paste each variable from `.env.production`
5. Click: Redeploy

---

### Step 3: Test
```bash
curl https://raghhav-roadways.onrender.com/health
```

**Expected**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## ⏱️ Timeline

| Task | Duration | Method |
|------|----------|--------|
| Step 1: Push code | 2 min | Automated |
| Step 2: Upload env vars | 3 min | Automated (via script) |
| Vercel redeploy | 2-3 min | Automatic |
| Step 3: Test | 1 min | Manual curl |
| **TOTAL** | **~10 min** | **95% automated** |

---

## 🔍 What's In `.env.production`

**Database** (1 var):
- `DATABASE_URL` - Supabase connection string

**Authentication** (4 vars):
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

**Server** (3 vars):
- `NODE_ENV` - production
- `PORT` - 3000
- `CORS_ORIGIN` - frontend URL

**Storage** (4 vars):
- `MAX_FILE_SIZE`
- `STORAGE_PATH`
- `DEFAULT_PAGE_SIZE`
- `MAX_PAGE_SIZE`

**Services** (3 vars):
- `SENTRY_DSN` - (empty)
- `RESEND_API_KEY` - (empty)
- `EMAIL_FROM`

**Company** (10 vars):
- `COMPANY_NAME`
- `COMPANY_GSTIN`
- `COMPANY_ADDRESS`
- `COMPANY_PHONE`
- `COMPANY_EMAIL`
- `COMPANY_BANK_NAME`
- `COMPANY_BANK_ACCOUNT`
- `COMPANY_BANK_IFSC`
- `COMPANY_BANK_BRANCH`

**Total: 25 variables** ✓

---

## 🆘 Troubleshooting

### Script Won't Run - "permission denied"

**Fix**:
```bash
chmod +x upload-env-to-vercel.sh
./upload-env-to-vercel.sh
```

### Vercel CLI Not Found

**Fix**:
```bash
npm install -g vercel
```

### Not Logged Into Vercel

**Fix**:
```bash
vercel login
```

### Script Completes But Variables Not Showing

**Check**:
1. Go to Vercel dashboard
2. Refresh the page
3. Settings → Environment Variables
4. Should see 25 variables listed

**If not**: Try manual upload or check Vercel logs

### Redeployment Failed

**Check**:
1. Vercel dashboard → Deployments tab
2. Click latest deployment
3. View build logs
4. Look for error messages

**Common issues**:
- Missing or incorrect DATABASE_URL
- Invalid JWT secrets
- Missing PORT variable

---

## 📊 Manual Upload Option

If scripts don't work, upload manually:

1. **Open `.env.production`** in your text editor
2. **Go to Vercel**: https://vercel.com/dashboard
3. **Select project**: raghhav-roadways
4. **Go to**: Settings → Environment Variables
5. **For each line** in `.env.production`:
   - Copy the key name (before `=`)
   - Copy the value (after `=`)
   - Paste into Vercel form
   - Click Add

6. **Click Save** when done
7. **Click Redeploy**

**Time**: ~5 minutes for all 25 variables

---

## ✅ Success Criteria

Scripts completed successfully when you see:

✅ "Successfully uploaded 25/25 variables"  
✅ "Redeployment triggered"  
✅ Vercel shows deployment in progress  
✅ Variables appear in Vercel dashboard  

---

## 🎯 Next Steps After Upload

1. **Wait** 2-3 minutes for redeployment
2. **Test** health endpoint:
   ```bash
   curl https://raghhav-roadways.onrender.com/health
   ```
3. **Check response** for `"database": "connected"`
4. **You're done!** 🚀

---

## 📚 Related Files

- `.env.production` - Environment variables
- `upload-env-to-vercel.sh` - Bash upload script
- `upload-env-to-vercel.js` - Node.js upload script
- `start-deployment.sh` - Initial deployment script
- `MASTER_DEPLOYMENT_SUMMARY.md` - Overview guide

---

## 💡 Key Points

- ✅ All 25 variables are pre-configured
- ✅ Scripts automate the upload process
- ✅ Vercel automatically redeploys after upload
- ✅ Manual option available if scripts fail
- ✅ Total time: 10 minutes for complete deployment

---

**That's it! One file with all variables, upload it all at once, then deploy.** 🎉

```bash
# Do this:
chmod +x upload-env-to-vercel.sh && ./upload-env-to-vercel.sh

# Or this:
node upload-env-to-vercel.js

# Or manually: copy from .env.production into Vercel UI
```

**Then you're live!** 🚀
