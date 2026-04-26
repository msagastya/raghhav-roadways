# 🚀 Quick Start Commands - Copy & Paste

**Read this first, then follow the commands in order.**

---

## Step 1️⃣: Deploy Backend (5 minutes)

```bash
# Navigate to project root
cd /Users/msagastya/Desktop/raghhav-roadways

# Commit all code
git add .
git commit -m "feat: Add dual authentication system with admin users and ride-sharing platform"
git push origin main

# Check if deployment succeeded
# Visit: https://vercel.com and check deployment status
# OR check logs with: vercel logs
```

**⏳ Wait 3-5 minutes for Vercel to deploy before next step**

---

## Step 2️⃣: Run Database Migration (3 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Run migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Success? You should see: ✔ 1 migration applied
```

**⚠️ If migration fails, check your DATABASE_URL in .env**

---

## Step 3️⃣: Set Environment Variables in Vercel (2 minutes)

1. Go to: https://vercel.com
2. Find your "raghhav-roadways" project
3. Click: **Settings** → **Environment Variables**
4. Add these (copy-paste exactly):

```
Name: JWT_SECRET
Value: $(openssl rand -hex 16)

Name: JWT_REFRESH_SECRET  
Value: $(openssl rand -hex 16)

Name: JWT_EXPIRES_IN
Value: 15m

Name: JWT_REFRESH_EXPIRES_IN
Value: 7d

Name: ADMIN_DEFAULT_ROLE
Value: admin
```

5. Click "Save" for each one
6. Redeploy: git push origin main (or click "Redeploy")

---

## Step 4️⃣: Create Initial Admin User (2 minutes)

**Option A: Using cURL (Recommended)**

```bash
# Make sure your backend is running locally (npm run dev in backend folder)
# Then run this:

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

# Expected response:
# {
#   "success": true,
#   "message": "Admin created successfully"
# }
```

**Option B: Using Postman (if you prefer GUI)**
1. Open Postman
2. Method: POST
3. URL: `http://localhost:3001/api/v1/admin/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "adminId": "super_admin",
  "password": "InitialPassword123",
  "confirmPassword": "InitialPassword123",
  "name": "Super Administrator",
  "email": "admin@raghhav-roadways.com",
  "role": "super_admin"
}
```

---

## Step 5️⃣: Test Admin Login (2 minutes)

```bash
# Test if admin login works

curl -X POST http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "super_admin",
    "password": "InitialPassword123"
  }'

# Expected response:
# {
#   "success": true,
#   "data": {
#     "accessToken": "eyJ...",
#     "refreshToken": "eyJ...",
#     "admin": {
#       "id": 1,
#       "adminId": "super_admin",
#       "name": "Super Administrator",
#       "role": "super_admin"
#     }
#   }
# }
```

**✅ If you got tokens back, backend is working! Proceed to Step 6.**

---

## Step 6️⃣: Setup Frontend (5 minutes)

```bash
# Navigate to frontend folder
cd /Users/msagastya/Desktop/raghhav-roadways/frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Raghhav Roadways
EOF

# Start development server
npm run dev

# Opens at: http://localhost:3000
```

---

## Step 7️⃣: Test Frontend Flows (5 minutes)

In your browser:

```
1. Go to: http://localhost:3000/register
   → Fill form with test data
   → Password: TestPassword123 (needs uppercase, lowercase, number)
   → Click "Sign up"

2. If registration works, you should be redirected to dashboard
   → Shows "Welcome back, [Your Name]"

3. Go to: http://localhost:3000/admin/login
   → Admin ID: super_admin
   → Password: InitialPassword123
   → Click "Sign in"

4. Should see admin dashboard with metrics
```

---

## ✅ Verification Checklist

Run these commands to verify everything:

```bash
# Check backend is running
curl http://localhost:3001/api/v1 2>/dev/null | grep -q success && echo "✅ Backend OK" || echo "❌ Backend DOWN"

# Check frontend is running
curl http://localhost:3000 2>/dev/null | grep -q "</html>" && echo "✅ Frontend OK" || echo "❌ Frontend DOWN"

# Check database connection
cd backend && npx prisma db execute --stdin < /dev/null && echo "✅ Database OK" || echo "❌ Database DOWN"

# Check admin user exists
curl http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"adminId":"super_admin","password":"InitialPassword123"}' 2>/dev/null | grep -q "accessToken" && echo "✅ Admin User OK" || echo "❌ Admin User Missing"
```

---

## 🆘 Troubleshooting

| Error | Solution |
|-------|----------|
| "PORT 3001 already in use" | Kill process: `lsof -ti:3001 \| xargs kill -9` |
| "DATABASE_URL not found" | Check `.env` in backend folder has DATABASE_URL |
| "Migration failed" | Run: `npx prisma db push` instead of migrate |
| "Cannot find module" | Run: `npm install` in that directory |
| "ECONNREFUSED 127.0.0.1:3001" | Backend not running, start with: `npm run dev` |
| "Admin creation returned 409" | Admin already exists, try different adminId |
| "Frontend can't reach backend" | Check NEXT_PUBLIC_API_URL in .env.local |

---

## 📞 Need Help?

1. **Copy full error message** (not just first line)
2. **Note the command** that failed
3. **Share:**
   - What command you ran
   - Full error output
   - What you expected

Example:
```
Command: npx prisma migrate deploy
Error: [Full error message here]
Expected: Migration should apply successfully
```

---

## ⏱️ Total Time Estimate

- Backend deployment: 10 minutes
- Database migration: 5 minutes
- Environment setup: 5 minutes
- Admin user creation: 5 minutes
- Frontend setup: 5 minutes
- Testing: 10 minutes

**Total: ~40 minutes to full working system**

---

## 🎯 Success Criteria

You'll know it worked when:
- ✅ `npm run dev` starts without errors
- ✅ You can register a new user at http://localhost:3000/register
- ✅ You can login at http://localhost:3000/login
- ✅ Admin can login at http://localhost:3000/admin/login
- ✅ Dashboard shows user profile
- ✅ No red errors in browser console

---

**Ready? Start with Step 1️⃣!**

Once these are done, I'll help you build remaining features. 🚀
