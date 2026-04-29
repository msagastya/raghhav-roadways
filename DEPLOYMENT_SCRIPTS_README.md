# 🔧 Deployment Scripts - Usage Guide

**Automated deployment scripts for Raghhav Roadways**

---

## 📁 Available Scripts

| Script | Type | Usage | Time |
|--------|------|-------|------|
| `deploy.sh` | Bash | `./deploy.sh` | 2-5 min |
| `deploy.js` | Node.js | `node deploy.js` | 2-5 min |
| Manual | Git | `git push origin master` | 1-2 min |

---

## 🚀 Quick Start

### Option 1: Bash Script (Recommended for macOS/Linux)

```bash
cd ~/Desktop/raghhav-roadways
chmod +x deploy.sh
./deploy.sh
```

**Output**: Step-by-step colored output with all next steps

### Option 2: Node.js Script (Works Everywhere)

```bash
cd ~/Desktop/raghhav-roadways
node deploy.js
```

**Output**: Detailed colored output with environment variables

### Option 3: Manual Git Push

```bash
cd ~/Desktop/raghhav-roadways
git add .
git commit -m "Deploy: Raghhav Roadways Phase 7"
git push origin master
```

**Output**: Git command output

---

## 📋 What Each Script Does

### `deploy.sh`

**Execution Flow**:
1. Verifies git is installed and repository exists
2. Checks backend/.env exists
3. Creates/updates frontend/.env.local with backend URL
4. Stages all changes with `git add .`
5. Commits with timestamp message
6. Pushes to master branch
7. Displays all 25 environment variables
8. Shows test commands
9. Provides summary of next steps

**Requirements**:
- Bash shell (macOS, Linux, Git Bash on Windows)
- Git installed and configured
- In project root directory

**Exit Codes**:
- `0`: Success
- `1`: Error (git not installed, not in repo, missing files)

---

### `deploy.js`

**Execution Flow**:
1. Verifies Node.js, git, and repository
2. Validates file structure
3. Creates/updates frontend environment
4. Executes git operations
5. Displays environment configuration
6. Shows test commands in colored output
7. Provides completion summary

**Requirements**:
- Node.js v12+ installed
- Git installed and configured
- In project root directory

**Output Features**:
- Colored terminal output
- Progress indicators (✅, ⚠️, ℹ️)
- Organized environment variables by category
- Clear next steps

**Exit Codes**:
- `0`: Success
- `1`: Error with detailed message

---

## 🔧 Configuration Files

### `ENV_CONFIG.json`

**Purpose**: Central configuration for all environment variables

**Structure**:
```json
{
  "production": {
    "backend": {
      "variables": { ... }
    },
    "frontend": {
      "variables": { ... }
    }
  },
  "development": { ... },
  "database": { ... },
  "admin_user": { ... }
}
```

**Usage**:
- Reference for environment variable values
- Can be imported into deployment tools
- Document all configs in one place

### `backend/.env`

**Current Values**:
```
DATABASE_URL=postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres
JWT_SECRET=fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c
JWT_REFRESH_SECRET=96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65
```

**Note**: Already configured - no changes needed

### `frontend/.env.local`

**Updated by Scripts to**:
```
NEXT_PUBLIC_API_URL=https://raghhav-roadways.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://raghhav-roadways.onrender.com
```

**Automatic**: Scripts create/update this file

### `vercel.json`

**Purpose**: Vercel deployment configuration

**Contains**:
- Build commands
- Output directory
- Environment variables
- Function settings
- CORS headers
- Redirects

**Already Configured**: Ready for production

---

## 🎯 Deployment Flow

```
┌─────────────────────────────────┐
│  Run Deployment Script          │
│  (deploy.sh or deploy.js)       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Verify Prerequisites           │
│  - Git installed?               │
│  - In git repo?                 │
│  - Files exist?                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Update Frontend .env.local     │
│  - Add backend URL              │
│  - Add socket URL               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Git Operations                 │
│  - git add .                    │
│  - git commit -m "..."          │
│  - git push origin master       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Display Instructions           │
│  - 25 env vars for Vercel       │
│  - Test commands                │
│  - Next steps                   │
└─────────────────────────────────┘
             │
             ▼
     Webhook to GitHub
             │
             ▼
     Vercel Auto-Deploy
             │
             ▼
    Backend Deployed ✅
```

---

## 🛠️ Manual Execution (If Scripts Fail)

If the scripts don't work, execute manually:

```bash
# Navigate to project
cd ~/Desktop/raghhav-roadways

# Update frontend .env.local
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=https://raghhav-roadways.onrender.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://raghhav-roadways.onrender.com
EOF

# Stage changes
git add .

# Commit
git commit -m "Deploy: Raghhav Roadways Phase 7 Complete"

# Push to master
git push origin master

# Wait 1-2 minutes for Vercel to deploy
# Then go to Vercel dashboard and add environment variables
```

---

## 📊 Output Examples

### `deploy.sh` Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ STEP 1: Verifying Prerequisites
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Git is installed
✅ Git repository detected
✅ backend/.env exists

...

✅ Code pushed to GitHub
⏳ Vercel auto-deployment started

🚀 Production deployment is underway!
```

### `deploy.js` Output

```
╔════════════════════════════════════════════════════════════════╗
║  Raghhav Roadways - Automated Deployment Script (Node.js)      ║
╚════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ STEP 1: Verifying Prerequisites
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Git is installed
✅ Git repository detected
✅ backend/.env exists

...

✅ Code pushed to GitHub
⏳ Vercel auto-deployment started

🚀 Production deployment is underway!
```

---

## ⚙️ Customization

### Modify Backend URL

Both scripts use hardcoded URLs:
- Backend: `https://raghhav-roadways.onrender.com`
- Frontend: `https://raghhav-roadways.vercel.app`

To change, edit in scripts:

**In deploy.sh**:
```bash
BACKEND_URL="https://your-backend-url.vercel.app"
FRONTEND_URL="https://your-frontend-url.vercel.app"
```

**In deploy.js**:
```javascript
vercel: {
  backendUrl: 'https://your-backend-url.vercel.app',
  frontendUrl: 'https://your-frontend-url.vercel.app',
}
```

### Modify Commit Message

**In deploy.sh**:
```bash
COMMIT_MESSAGE="Your custom message here"
git commit -m "$COMMIT_MESSAGE"
```

**In deploy.js**:
```javascript
const commitMessage = 'Your custom message here';
exec(`git commit -m "${commitMessage}"`);
```

---

## 🔍 Debugging

### If Script Fails

1. Check error message
2. Verify prerequisites are installed
3. Ensure you're in project root
4. Try manual execution
5. Check git status: `git status`

### Enable Debug Mode

**Bash**:
```bash
bash -x deploy.sh
```

**Node.js**: Add console.log statements in deploy.js

### Check Git Configuration

```bash
git config user.email
git config user.name
git config --list
```

If not set:
```bash
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

---

## 📝 Environment Variables Added

Scripts will display all 25 variables:

**Essential** (5):
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `NODE_ENV`
- `PORT`

**Security** (3):
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `CORS_ORIGIN`

**Storage** (4):
- `MAX_FILE_SIZE`
- `STORAGE_PATH`
- `DEFAULT_PAGE_SIZE`
- `MAX_PAGE_SIZE`

**Services** (3):
- `SENTRY_DSN`
- `RESEND_API_KEY`
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

## 🆘 Common Issues

### "Permission denied: deploy.sh"

**Fix**:
```bash
chmod +x deploy.sh
./deploy.sh
```

### "Git command not found"

**Fix**: Install git from https://git-scm.com/

### "EACCES: permission denied" (Node.js)

**Fix**: Run with proper permissions
```bash
sudo node deploy.js
```

Or use nvm to manage Node versions

### "fatal: not a git repository"

**Fix**: Navigate to project root
```bash
cd ~/Desktop/raghhav-roadways
git status  # Should work
```

### "fatal: origin already exists"

**Fix**: You're already in a repo
```bash
git remote -v
git push origin master
```

---

## ✅ Success Indicators

Script completed successfully when:

✅ Exit code is 0  
✅ "Code pushed to GitHub" message appears  
✅ "Vercel auto-deployment started" message appears  
✅ All 25 environment variables listed  
✅ Test commands provided  

---

## 📞 Next Steps After Script

1. **Verify git push**: Check GitHub for new commit
2. **Check Vercel**: Go to dashboard, see backend deploying
3. **Add env vars**: Use script output to add 25 variables in Vercel
4. **Redeploy**: Click Redeploy in Vercel after adding vars
5. **Test**: Run health check: `curl https://raghhav-roadways.onrender.com/health`

---

## 📚 Related Files

- `AUTOMATED_DEPLOYMENT_GUIDE.md` - Complete deployment guide
- `ENV_CONFIG.json` - All environment variables
- `VERCEL_DEPLOYMENT_GUIDE.md` - Detailed Vercel setup
- `QUICK_DEPLOY_REFERENCE.md` - One-page quick ref

---

**🚀 Ready to deploy!**

Choose your preferred method:

```bash
# Bash (macOS/Linux)
chmod +x deploy.sh && ./deploy.sh

# Node.js (Any OS)
node deploy.js

# Manual
git push origin master
```

---

**Last Updated**: April 26, 2026  
**Status**: ✅ Production Ready  
**Scripts Version**: 1.0.0
