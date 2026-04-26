# Admin Authentication System Setup Guide

## Overview

The Raghhav Roadways platform now supports dual authentication:
- **Public Users**: Email/password registration and login
- **Admin Users**: Admin ID/password login (credentials set by developers)

This guide walks you through setting up the new admin authentication system.

## Architecture

### Database Tables Added

1. **admin_users** - Stores admin credentials and information
2. **rides** - Ride requests from public users
3. **ride_ratings** - User ratings for completed rides

### Authentication Flow

**Public User Login:**
```
POST /api/v1/auth/login
Body: { email, password }
Returns: { accessToken, refreshToken }
```

**Admin Login:**
```
POST /api/v1/admin/auth/login
Body: { adminId, password }
Returns: { accessToken, refreshToken }
```

## Setup Instructions

### Step 1: Update Environment Variables

Add/update these variables in your `.env` file:

```env
# JWT Secrets (use strong, random values)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Token Expiry Times
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Admin Configuration
ADMIN_DEFAULT_ROLE=admin
```

**Generate Strong Secrets:**
```bash
# Run in Node.js console:
require('crypto').randomBytes(32).toString('hex')
```

### Step 2: Run Database Migration

The new tables are defined in your Prisma schema. To apply them:

```bash
# Generate migration
npx prisma migrate dev --name add_admin_and_ride_platform

# Or if using Supabase directly, run the SQL:
# Copy the migration SQL and run it in your Supabase dashboard
```

Or manually run the SQL from: `/backend/prisma/migrations/add_admin_and_ride_platform.sql`

### Step 3: Create Initial Admin Users

**Option A: Via API (Recommended)**

```bash
curl -X POST http://localhost:3001/api/v1/admin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin_user_1",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123",
    "name": "Admin User",
    "email": "admin@raghhav-roadways.com",
    "role": "super_admin"
  }'
```

**Option B: Direct Database Insert (Production)**

```sql
-- Hash the password first using bcrypt (e.g., in Node.js console)
-- bcrypt.hash("YourPassword123", 12)

INSERT INTO admin_users (admin_id, password_hash, name, email, role, is_active)
VALUES (
  'admin_user_1',
  '$2b$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi8Ay0IUgO7CWb5duey', -- bcrypt hash
  'Admin User',
  'admin@raghhav-roadways.com',
  'super_admin',
  true
);
```

### Step 4: Test Admin Authentication

**Test Login:**
```bash
curl -X POST http://localhost:3001/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "adminId": "admin_user_1",
    "password": "SecurePassword123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "admin": {
      "id": 1,
      "adminId": "admin_user_1",
      "name": "Admin User",
      "email": "admin@raghhav-roadways.com",
      "role": "super_admin"
    }
  }
}
```

### Step 5: Get Current Admin Profile

```bash
curl -X GET http://localhost:3001/api/v1/admin/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Step 6: Refresh Token

```bash
curl -X POST http://localhost:3001/api/v1/admin/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

## API Endpoints

### Admin Authentication

| Method | Endpoint | Body | Protected |
|--------|----------|------|-----------|
| POST | `/api/v1/admin/auth/login` | `{adminId, password}` | No |
| POST | `/api/v1/admin/auth/refresh` | `{refreshToken}` | No |
| POST | `/api/v1/admin/auth/logout` | - | Yes |
| GET | `/api/v1/admin/auth/me` | - | Yes |
| PATCH | `/api/v1/admin/auth/change-password` | `{currentPassword, newPassword, confirmPassword}` | Yes |

## Security Best Practices

### 1. Password Requirements

- Minimum 8 characters
- Must contain: uppercase, lowercase, numbers
- Never store plaintext passwords

### 2. Token Security

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens stored in HTTP-only cookies (frontend to handle refresh automatically)
- Use HTTPS only in production

### 3. Admin Credentials

- Set by developers programmatically (no self-registration)
- Admin IDs should be unique and meaningful
- Passwords should be randomly generated initially
- Admins must change password on first login

### 4. Session Management

```javascript
// Frontend: Auto-refresh on token expiry
if (response.status === 401) {
  // Call refresh endpoint
  const newToken = await refreshAdminToken();
  // Retry original request with new token
}
```

## Role-Based Access Control

### Current Roles

- **admin** - Standard admin with full access to operations
- **super_admin** - Full system access including user and admin management

### Extending Roles

To add more roles, update:

1. Database schema (add new role values)
2. Authorization middleware (add role checks)
3. Admin routes (add role checks to endpoints)

Example:
```javascript
// In route:
router.get('/users', 
  authMiddleware.authenticateAdminToken,
  authMiddleware.authorizeAdminRole('super_admin'), // Only super_admin
  userController.getAll
);
```

## Troubleshooting

### Issue: "Admin not found" on login

**Solution:** Verify admin exists in database:
```sql
SELECT * FROM admin_users WHERE admin_id = 'admin_user_1';
```

### Issue: "Invalid password"

**Solution:** Regenerate password hash:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('NewPassword123', 12);
console.log(hash); // Use this in database
```

### Issue: Token expired errors

**Solution:** Ensure refresh token middleware is configured:
```javascript
// In frontend/app initialization
setInterval(refreshAdminToken, 10 * 60 * 1000); // Refresh every 10 minutes
```

## Deployment Checklist

- [ ] Update `.env` with strong JWT secrets
- [ ] Run database migration
- [ ] Create initial admin users
- [ ] Test admin login endpoint
- [ ] Update frontend to use admin auth routes
- [ ] Configure HTTPS in production
- [ ] Enable rate limiting on auth endpoints
- [ ] Setup monitoring for failed login attempts
- [ ] Configure admin user audit logging
- [ ] Test token refresh mechanism
- [ ] Test logout and session invalidation
- [ ] Document admin account recovery procedures

## Next Steps

1. **Build Admin Dashboard Frontend** (`/frontend/src/app/(admin)`)
2. **Implement Admin Management API** (create/update/delete admin users)
3. **Setup Admin Audit Logging** (track all admin actions)
4. **Configure Role-Based Permissions** (granular access control)
5. **Implement Admin Activity Monitoring** (failed logins, access patterns)

## Files Modified/Created

```
Created:
- /backend/src/controllers/admin.auth.controller.js
- /backend/src/routes/admin.auth.routes.js
- /backend/src/middleware/validators.js
- /backend/prisma/migrations/add_admin_and_ride_platform.sql

Updated:
- /backend/prisma/schema.prisma (added AdminUser, Ride, RideRating models)
- /backend/src/middleware/auth.js (added admin authentication middleware)
- /backend/src/routes/index.js (added admin auth routes)
```

## Support

For issues or questions:
1. Check logs: `vercel logs`
2. Check database: Verify tables were created
3. Check environment: Verify JWT secrets are set
4. Test endpoints: Use curl or Postman
5. Review code: Check admin.auth.controller.js for detailed logic

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-26  
**Status:** Ready for Implementation
