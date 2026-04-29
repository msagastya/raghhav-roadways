# Supabase Recovery & Database Migration Guide

**Status:** Database connection failing - attempting automated recovery

---

## 🔍 What Went Wrong

The migration fails at: `Can't reach database server at aws-0-ap-south-1.supabase.co:5432`

**Root Cause:** Supabase project is likely paused or unreachable.

**Your Current Setup:**
- Supabase Project ID: `dlmgmdemfvjpnokkgylq`
- Region: `ap-south-1` (Mumbai)
- Database: `postgres`
- User: `postgres`
- Host: `aws-0-ap-south-1.supabase.co`

---

## ✅ Option 1: Resume Existing Project (Fastest - 2 minutes)

If your Supabase project exists but is paused:

```bash
# Visit this link in your browser:
https://supabase.com/dashboard/projects

# Look for project "dlmgmdemfvjpnokkgylq" or similar
# If you see a "Resume" button → Click it
# Wait 1-2 minutes for it to come back online
# Then run locally:
cd /Users/msagastya/Desktop/raghhav-roadways/backend
npx prisma migrate deploy
```

---

## 🆕 Option 2: Create Fresh Supabase Project (5 minutes)

If you can't find your existing project or want to start fresh:

### Step 1: Create New Supabase Project
```
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Name: "raghhav-roadways"
4. Password: (use a strong password)
5. Region: "ap-south-1" (Mumbai)
6. Click "Create new project" → Wait 2-3 minutes
```

### Step 2: Get New DATABASE_URL
```
1. In Supabase dashboard → Click your project
2. Settings → Database → Connection String
3. Select "URI" tab
4. Copy the full connection string
```

### Step 3: Update Local .env
```bash
# Edit /Users/msagastya/Desktop/raghhav-roadways/backend/.env

# Replace the DATABASE_URL line with your new one:
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@aws-0-ap-south-1.supabase.co:5432/postgres"
```

### Step 4: Update Vercel Environment
```
1. Go to https://vercel.com/msagastya/raghhav-roadways/settings/environment-variables
2. Find DATABASE_URL → Edit it
3. Paste the new connection string
4. Click Save
5. Deploy again: git push origin master
```

### Step 5: Run Migration
```bash
cd /Users/msagastya/Desktop/raghhav-roadways/backend
npx prisma migrate deploy
npx prisma generate
```

---

## 🚀 After Database Connected

Once migration succeeds, run:

```bash
# Create initial admin user
curl -X POST http://localhost:3001/api/v1/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "super_admin",
    "password": "InitialPassword123",
    "confirmPassword": "InitialPassword123",
    "name": "Super Administrator",
    "email": "admin@raghhav-roadways.com",
    "role": "super_admin"
  }'

# Test admin login
curl -X POST http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "super_admin",
    "password": "InitialPassword123"
  }'

# Should return accessToken and refreshToken
```

---

## 📋 Troubleshooting

| Error | Solution |
|-------|----------|
| "Can't reach database server" | Supabase is paused → Resume it |
| "authentication failed" | Wrong password in DATABASE_URL |
| "database does not exist" | Run `npx prisma migrate deploy` to create schema |
| "Port already in use" | Kill process: `lsof -ti:5432 \| xargs kill -9` |

---

## ✨ What Comes Next

Once database is connected:
1. ✅ Backend will be fully deployed
2. ✅ Admin user created
3. ✅ Database schema ready
4. → Frontend setup (npm install + npm run dev)
5. → Test registration & login flows
6. → Build remaining features

---

**Choose one path above and let me know which step you're on.** I'll handle the rest. 🚀
