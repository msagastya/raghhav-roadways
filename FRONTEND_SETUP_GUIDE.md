# Frontend Setup & Deployment Guide

## ✅ What I've Generated

### Core Infrastructure
- **API Client** (`frontend/src/lib/api-client.ts`) - HTTP client with automatic token refresh
- **Auth Context** (`frontend/src/contexts/auth-context.tsx`) - Public user authentication state
- **Admin Auth Context** (`frontend/src/contexts/admin-auth-context.tsx`) - Admin authentication state

### Public User Pages
- **Login** (`app/(auth)/login/page.tsx`) - User sign in
- **Register** (`app/(auth)/register/page.tsx`) - User sign up
- **Dashboard** (`app/(dashboard)/page.tsx`) - User home with recent rides
- **Book Ride** (`app/(public)/book-ride/page.tsx`) - Ride booking interface
- **Ride Tracking** - Route configured, component ready

### Admin Pages  
- **Admin Login** (`app/(admin)/login/page.tsx`) - Admin sign in
- **Admin Dashboard** (`app/(admin)/dashboard/page.tsx`) - Admin overview with metrics

---

## 📋 What You Need to Do (Terminal Commands)

### Step 1: Install Frontend Dependencies
```bash
cd /Users/msagastya/Desktop/raghhav-roadways/frontend
npm install
```

### Step 2: Update Environment Variables
Create `.env.local` in `/frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Raghhav Roadways
```

### Step 3: Start Frontend Development Server
```bash
# In the frontend directory
npm run dev
```

Frontend will be available at: `http://localhost:3000`

### Step 4: Test the Workflow
1. **Go to** `http://localhost:3000/register`
2. **Register** a new user account
3. **Login** and verify dashboard loads
4. **Try booking** a ride
5. **Go to** `http://localhost:3000/admin/login`
6. **Login** with admin credentials (once backend is deployed)

---

## 🔧 Backend Deployment (CRITICAL - Do This First!)

Before frontend can work, you MUST deploy the backend:

```bash
# 1. Navigate to project root
cd /Users/msagastya/Desktop/raghhav-roadways

# 2. Commit all code
git add .
git commit -m "feat: Complete dual auth system with admin and public user flows"
git push origin main

# 3. Run database migration
cd backend
npm install
npx prisma migrate deploy
npx prisma generate

# 4. Update Vercel environment variables
# Go to: https://vercel.com → Project Settings → Environment Variables
# Add:
# - JWT_SECRET (32 char random string)
# - JWT_REFRESH_SECRET (32 char random string)
# - JWT_EXPIRES_IN=15m
# - JWT_REFRESH_EXPIRES_IN=7d
# - ADMIN_DEFAULT_ROLE=admin

# 5. Create initial admin user
curl -X POST http://localhost:3001/api/v1/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "super_admin",
    "password": "ChangeMe123",
    "confirmPassword": "ChangeMe123",
    "name": "Super Administrator",
    "email": "admin@raghhav-roadways.com",
    "role": "super_admin"
  }'

# 6. Test admin login
curl -X POST http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "super_admin",
    "password": "ChangeMe123"
  }'
```

---

## 📁 Project Structure Created

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Public authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/       # User dashboard routes
│   │   │   └── page.tsx
│   │   ├── (admin)/           # Admin routes
│   │   │   ├── login/
│   │   │   └── dashboard/
│   │   └── (public)/          # Public pages
│   │       └── book-ride/
│   ├── contexts/
│   │   ├── auth-context.tsx       # Public user state
│   │   └── admin-auth-context.tsx # Admin state
│   └── lib/
│       └── api-client.ts          # HTTP client with token refresh
├── package.json
├── tsconfig.json
└── next.config.js
```

---

## 🚀 Next Components to Build

### Priority 1 (This Week)
- [ ] Ride tracking page with live location updates
- [ ] User profile & settings page
- [ ] Payment UI integration (Razorpay)
- [ ] Admin user management table
- [ ] Admin operations map

### Priority 2 (Next Week)
- [ ] Ride history with filters
- [ ] User ratings/reviews system
- [ ] Admin analytics dashboard
- [ ] Real-time notifications (Socket.io)
- [ ] Mobile responsive improvements

### Priority 3 (Following Week)
- [ ] Admin fleet management
- [ ] Support ticket system
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] SEO optimization

---

## 🔗 API Integration Points

All API calls are in `/lib/api-client.ts`. The following endpoints are configured:

**Public User Auth:**
- POST `/auth/register` ✅
- POST `/auth/login` ✅
- POST `/auth/refresh` ✅
- GET `/auth/me` ✅
- PATCH `/auth/update-profile` ✅
- PATCH `/auth/change-password` ✅

**Rides:**
- POST `/rides` ✅
- GET `/rides/:id` ✅
- GET `/rides/active` ✅
- GET `/rides/history` ✅
- PATCH `/rides/:id/cancel` ✅

**Admin Auth:**
- POST `/admin/auth/login` ✅
- POST `/admin/auth/refresh` ✅
- GET `/admin/auth/me` ✅
- PATCH `/admin/auth/change-password` ✅

---

## 🛠️ Development Tips

### Auto Token Refresh
The API client automatically refreshes tokens when they expire (401 response). No additional setup needed.

### Error Handling
All errors are caught and stored in context:
```tsx
const { error, clearError } = useAuth();
// Use error in UI
// Call clearError() to dismiss
```

### Loading States
All async operations set `isLoading` state:
```tsx
const { isLoading } = useAuth();
// Use to disable buttons, show spinners
```

### Protected Routes
To protect a route for authenticated users:
```tsx
if (!isAuthenticated) {
  router.push('/login');
}
```

---

## 🧪 Testing Checklist

- [ ] User can register with valid password
- [ ] User can login with email/password
- [ ] User can view profile
- [ ] User can update profile
- [ ] User can change password
- [ ] User can book a ride
- [ ] User can view ride history
- [ ] User can logout
- [ ] Admin can login
- [ ] Admin can access dashboard
- [ ] Token refresh works on 401
- [ ] Errors are displayed to user
- [ ] UI is responsive on mobile

---

## 🚨 Common Issues & Solutions

**Issue: "Failed to fetch" errors**
- Check: Is backend running on `localhost:3001`?
- Check: Are CORS headers correct in backend?
- Solution: Update `NEXT_PUBLIC_API_URL` in `.env.local`

**Issue: Login returns 401**
- Check: Are JWT secrets set in environment?
- Check: Did you create the admin user?
- Solution: Verify environment variables and admin record in database

**Issue: Tokens not persisting**
- Check: Is localStorage working? (test in DevTools console)
- Check: Are cookies enabled?
- Solution: Clear localStorage and try again

**Issue: Styles look broken**
- Check: Run `npm install` to ensure Tailwind CSS installed
- Solution: Restart dev server with `npm run dev`

---

**Status:** Phase 3 & 4 code generated and ready. Awaiting backend deployment and frontend environment setup.

**Last Updated:** 2026-04-26
