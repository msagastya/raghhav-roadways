# RAGHHAV ROADWAYS — MASTER UPGRADE PLAN
### From 4/10 → 9.9/10 | Zero Cost (₹0/month) | Created: 2026-04-27

---

## PRIORITY ORDER & TIME ESTIMATES

```
PHASE 1 — FOUNDATION (Days 1–2)        ~8 hrs  [Security + Deployment]
PHASE 2 — CORE FIXES (Days 3–5)        ~14 hrs [Auth + DB + API]
PHASE 3 — FEATURES (Days 6–10)         ~14 hrs [5 Forms + Settings + Password Reset]
PHASE 4 — QUALITY (Days 11–13)         ~10 hrs [Architecture + Error Handling + Performance]
PHASE 5 — POLISH (Days 14–15)          ~6 hrs  [UI/UX + Documentation + Testing]
─────────────────────────────────────────────────────────────
TOTAL                                   ~52 hrs  [15 working days]
```

---

## WHY THIS ORDER

```
Security first  → secrets are LIVE on GitHub right now. Every minute they stay there is risk.
Deployment second → backend being offline means all features are untestable in prod.
Auth + DB third → everything else depends on auth working and the DB schema existing.
Forms fourth    → biggest functional gap — users literally can't create anything.
Quality last    → polish doesn't matter on a broken foundation.
```

---

## PHASE 1 — FOUNDATION
### Time: ~8 hours | Days 1–2

---

### TASK 1.1 — Rotate All Leaked Secrets
**Dimension:** Security (2) | **Time:** 1 hour | **Priority:** P0 CRITICAL

**Why first:** `.env` and `backend/.env` are committed to GitHub. Every JWT secret, DB password,
and API key is publicly readable right now. This is the single most urgent fix.

**Exact steps:**
1. Supabase dashboard → Project Settings → Database → Reset database password
   → Copy new `DATABASE_URL`
2. Generate new secrets locally:
   ```bash
   openssl rand -base64 64  # → new JWT_SECRET
   openssl rand -base64 64  # → new JWT_REFRESH_SECRET
   ```
3. Update secrets in:
   - Local `backend/.env`
   - Vercel dashboard → Environment Variables
   - Render dashboard (after Step 1.2 deployment)
4. Remove files from git tracking:
   ```bash
   git rm --cached .env backend/.env
   git commit -m "fix: remove env files from git tracking"
   ```
   (History still has the old secrets but they are now rotated/invalid)
5. Verify `.gitignore` covers `.env`, `.env.production`, `backend/.env` ✓ (already done last session)

**Files changed:** `.gitignore` (already done), `backend/.env` (local only), Vercel/Render dashboards

**Score impact:** Security 3/10 → 6/10

---

### TASK 1.2 — Deploy Backend to Render.com
**Dimension:** DevOps (10) | **Time:** 1.5 hours | **Priority:** P0 CRITICAL

**Why second:** The backend Express.js app runs nowhere in production. Every API call from
the deployed frontend fails silently. Deployment unblocks all other testing.

**Exact steps:**
1. Go to render.com → Sign in with GitHub
2. New → Web Service → Connect `raghhav-roadways` repo
3. Settings:
   - Root directory: `backend`
   - Runtime: Node
   - Build command: `npm install && npx prisma generate`
   - Start command: `node src/server.js`
   - Region: Singapore (closest free region to India)
4. Add all environment variables from `backend/.env`:
   ```
   DATABASE_URL         = (new rotated URL from Task 1.1)
   JWT_SECRET           = (new from Task 1.1)
   JWT_REFRESH_SECRET   = (new from Task 1.1)
   NODE_ENV             = production
   CORS_ORIGIN          = https://raghhav-roadways.vercel.app
   PORT                 = 10000
   ```
5. Set Health Check Path: `/api/v1/health`
6. Deploy → wait ~3 minutes → copy the `https://xxx.onrender.com` URL
7. Add that URL to Vercel as `NEXT_PUBLIC_API_URL`

**Files changed:** None (Render config is in dashboard)
**Note:** Free tier sleeps after 15 min idle. First request takes ~30s to wake.

**Score impact:** DevOps 3/10 → 6/10

---

### TASK 1.3 — Fix CORS and ngrok Vulnerability
**Dimension:** Security (2) | **Time:** 30 min | **Priority:** P1

**Exact steps:**
`backend/src/app.js` — find the ngrok check:
```js
// CURRENT (vulnerable — matches attacker-real-ngrok.com):
if (origin && origin.includes('.ngrok')) return callback(null, true);

// REPLACE WITH: specific domain in env var only
// Remove the ngrok block entirely from code.
// In local development, add your specific ngrok URL to CORS_ORIGIN env var.
```

**Files changed:** `backend/src/app.js`

---

### TASK 1.4 — Fix File Upload Path Traversal
**Dimension:** Security (2) | **Time:** 30 min | **Priority:** P1

**Exact steps:**
Find every `req.file.originalname` used in path construction across all controllers.
Replace with:
```js
const { v4: uuidv4 } = require('uuid'); // already installed
const ext = path.extname(req.file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
const safeFilename = `${uuidv4()}${ext}`;
// Store original name in DB for display, safeFilename for disk/storage
```

**Files changed:** `consignment.controller.js`, `payment.controller.js` (anywhere challan/receipt is uploaded)

---

### TASK 1.5 — Fix Backup Endpoint Auth
**Dimension:** Security (2) | **Time:** 20 min | **Priority:** P1

**Exact steps:**
`backend/src/routes/backup.routes.js`:
```js
// Add auth middleware to all backup routes:
router.get('/export', authenticateToken, authorizeRole(['SUPER_ADMIN']), exportBackup);
```
`backup.controller.js` — strip `passwordHash` from exported user data before sending.

**Files changed:** `backend/src/routes/backup.routes.js`, `backend/src/controllers/backup.controller.js`

---

### TASK 1.6 — Add Content-Security-Policy Header
**Dimension:** Security (2) | **Time:** 20 min | **Priority:** P1

**Exact steps:**
`backend/src/app.js` — update Helmet config:
```js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Next.js needs this
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://uelwxwrklqrrlonxtpmq.supabase.co"],
      connectSrc: ["'self'", "https://*.onrender.com", "https://*.supabase.co"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
```

**Files changed:** `backend/src/app.js`

**PHASE 1 END — Security 3→6.5, DevOps 3→6. Backend is live.**

---

## PHASE 2 — CORE FIXES
### Time: ~14 hours | Days 3–5

---

### TASK 2.1 — Deploy Prisma Logistics Schema to Production DB
**Dimension:** Database (4) | **Time:** 1 hour | **Priority:** P1 CRITICAL

**Why:** The entire logistics backend (consignments, invoices, vehicles, etc.) points at a DB
that has none of those tables. Every logistics API call fails with a Prisma error.

**Exact steps:**
1. Set `DATABASE_URL` in local `.env` to the PRODUCTION Supabase connection string
   (found in Supabase dashboard → Project Settings → Database → Connection string → URI)
2. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. Verify in Supabase table editor — you should see: consignments, invoices, vehicles,
   parties, payments, roles, permissions, users (logistics), and more
4. Run the seed script to create initial roles and admin user:
   ```bash
   npx prisma db seed
   ```

**Files changed:** None (migration files already exist in `prisma/migrations/`)

**Score impact:** Database 5/10 → 7/10, Feature Completeness 3/10 → 5/10

---

### TASK 2.2 — Delete Ghost Supabase Project
**Dimension:** Database (4), DevOps (10) | **Time:** 5 min | **Priority:** P2

**Exact steps:**
1. Supabase dashboard → Switch to project `raghhav-roadways` (dlmgmdemfvjpnokkgylq)
2. Settings → General → Delete project → Confirm
3. Free tier allows 2 projects. Now you have 1 (prod) + 1 slot free for staging.

---

### TASK 2.3 — Move Agent Tokens from localStorage to httpOnly Cookies
**Dimension:** Auth (6), Security (2) | **Time:** 2.5 hours | **Priority:** P1 CRITICAL

**Why:** Agent tokens in localStorage are readable by any JavaScript on the page.
One XSS vulnerability and the attacker has permanent agent access.

**Backend changes:**
`backend/src/controllers/agent.auth.controller.js` — replace response body token with cookie:
```js
// REMOVE: res.json({ success: true, data: { accessToken, refreshToken, agent } })

// ADD:
res.cookie('agentAccessToken', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
res.cookie('agentRefreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
res.json({ success: true, data: { agent } }); // No token in body
```

`backend/src/middleware/agent.auth.js` — read from cookie instead of Authorization header:
```js
// REMOVE: const token = req.headers.authorization?.split(' ')[1]
// ADD:
const token = req.cookies.agentAccessToken;
```

**Frontend changes:**
`frontend/src/lib/agentApi.js` — remove all localStorage token reads, set withCredentials:
```js
const agentApi = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends cookie automatically
});
// Remove all: localStorage.getItem('agentAccessToken') calls
// Remove all: headers: { Authorization: `Bearer ${token}` }
```

`frontend/src/store/agentAuthStore.js` — remove setAgentTokens/localStorage calls entirely.
Agent is "logged in" if the cookie exists (checked via GET /agent/auth/me).

**Files changed:**
- `backend/src/controllers/agent.auth.controller.js`
- `backend/src/middleware/agent.auth.js`
- `frontend/src/lib/agentApi.js`
- `frontend/src/store/agentAuthStore.js`

**Score impact:** Auth 3/10 → 6/10, Security 6.5/10 → 7.5/10

---

### TASK 2.4 — Add JWT Blacklist on Logout (Upstash Redis)
**Dimension:** Auth (6), Security (2) | **Time:** 2 hours | **Priority:** P1

**Setup (5 min):**
1. upstash.com → Create Redis database (free, no credit card)
2. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Add to `backend/.env` and Render dashboard

**Backend changes:**
```bash
cd backend && npm install @upstash/redis
```

Create `backend/src/config/redis.js`:
```js
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
module.exports = redis;
```

`backend/src/controllers/auth.controller.js` — on logout:
```js
const redis = require('../config/redis');
// In logout handler:
const jti = decoded.jti; // JWT ID claim
await redis.set(`blacklist:${jti}`, '1', { ex: 7 * 24 * 60 * 60 }); // TTL = token lifetime
res.clearCookie('accessToken').clearCookie('refreshToken');
```

`backend/src/middleware/auth.js` — in authenticateToken:
```js
const isBlacklisted = await redis.get(`blacklist:${decoded.jti}`);
if (isBlacklisted) return res.status(401).json({ success: false, message: 'Token revoked' });
```

Add `jti: uuid()` when signing tokens in `jwt.js`.

**Files changed:**
- `backend/src/config/redis.js` (new)
- `backend/src/config/jwt.js`
- `backend/src/middleware/auth.js`
- `backend/src/controllers/auth.controller.js`
- `backend/src/controllers/agent.auth.controller.js`

**Score impact:** Auth 6→8, Security 7.5→8.5

---

### TASK 2.5 — Add Role Enforcement to Next.js Middleware
**Dimension:** Auth (6) | **Time:** 1 hour | **Priority:** P1

**Exact steps:**
`frontend/src/middleware.js` — add role-based route protection:
```js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // already available in Next.js edge runtime

export async function middleware(request) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    const role = payload.role;

    // Only SUPER_ADMIN and ADMIN can reach /admin routes
    if (pathname.startsWith('/admin') && !['SUPER_ADMIN', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Only agents can reach /agent routes
    if (pathname.startsWith('/agent') && role !== 'AGENT') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/agent/:path*'],
};
```

**Files changed:** `frontend/src/middleware.js`

**Score impact:** Auth 8→9, Security 8.5→9

---

### TASK 2.6 — Replace In-Memory Rate Limiter with Redis
**Dimension:** Security (2), Performance (8) | **Time:** 1 hour | **Priority:** P2

**Exact steps:**
```bash
cd backend && npm install @upstash/ratelimit
```

`backend/src/middleware/rateLimiter.js` — replace Map-based limiter:
```js
const { Ratelimit } = require('@upstash/ratelimit');
const redis = require('../config/redis');

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute per IP
});

const apiLimiter = async (req, res, next) => {
  const ip = req.ip || 'anonymous';
  const { success, limit, remaining } = await ratelimit.limit(ip);

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!success) {
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }
  next();
};
```

**Files changed:** `backend/src/middleware/rateLimiter.js`

**Score impact:** Security 9→9.3, Performance 4→5

---

### TASK 2.7 — Standardize API Error/Success Response Shape
**Dimension:** API Design (5) | **Time:** 1 hour | **Priority:** P2

**Exact steps:**
All errors must return: `{ success: false, code: number, message: string, errors?: array }`
All success must return: `{ success: true, data: any, meta?: { page, limit, total } }`

1. Update `backend/src/middleware/errorHandler.js` — already mostly correct, ensure `success: false` always present
2. Audit all controllers for manual `res.json({ error: ... })` patterns (grep for `res.json({ error`) — replace with `next(new ApiError(statusCode, message))`
3. Add pagination meta to all list responses:
   ```js
   res.json({ success: true, data: items, meta: { page, limit, total } });
   ```

**Files changed:** `errorHandler.js`, multiple controllers

**Score impact:** API Design 5→7

---

### TASK 2.8 — Add Missing API Endpoints
**Dimension:** API Design (5) | **Time:** 1 hour | **Priority:** P2

**Missing endpoints:**
- `PATCH /invoices/:id` — update invoice (status, amounts, notes)
- `PATCH /payments/:id` — update payment (amount, mode, notes, receipt)
- `GET /audit-logs` — fetch audit log entries with pagination

**For each:** Add route → Add controller method → Add service method → Add validation schema.
Follow existing pattern from consignment.routes.js (5 min per endpoint once you know the pattern).

**Files changed:**
- `backend/src/routes/invoice.routes.js`
- `backend/src/routes/payment.routes.js`
- `backend/src/routes/audit-log.routes.js` (new)
- Corresponding controllers and services

**Score impact:** API Design 7→8.5, Feature Completeness 5→6

---

**PHASE 2 END — Auth 3→9, Security 3→9.3, Database 5→7.5, API 5→8.5**

---

## PHASE 3 — FEATURES
### Time: ~14 hours | Days 6–10

This is the largest phase. Five empty forms are the biggest functional gap in the app.
Every form follows the same pattern: `react-hook-form` + field validation + API call + toast feedback.

---

### TASK 3.1 — Build ConsignmentForm.jsx
**Dimension:** Feature Completeness (11) | **Time:** 3 hours | **Priority:** P0

**This is the most critical form.** Users cannot create consignments — the app's core function.

**Fields:**
| Field | Type | Validation | Source |
|---|---|---|---|
| LR Number | Text (read-only) | Auto-generated by backend | — |
| Consignment Date | Date | Required, not future | — |
| From City | Searchable Select | Required | GET /masters/cities |
| To City | Searchable Select | Required, different from From | GET /masters/cities |
| Consignor | Searchable Select | Required | GET /masters/consignor-consignees |
| Consignee | Searchable Select | Required | GET /masters/consignor-consignees |
| Vehicle | Searchable Select | Required | GET /vehicles |
| Commodity | Text | Required, max 200 chars | — |
| Packages | Number | Required, min 1 | — |
| Weight (kg) | Number | Required, min 0.1 | — |
| Freight Amount (₹) | Number | Required, min 0 | — |
| Payment Mode | Select | Paid / To Pay / To Be Billed | — |
| Challan File | File Upload | PDF/Image, max 5MB | — |
| Remarks | Textarea | Optional, max 500 chars | — |

**Implementation:**
```jsx
// Uses react-hook-form for validation
const { register, handleSubmit, formState: { errors } } = useForm();

// Searchable selects use existing SearchableSelect component pattern
// File upload uses existing multer endpoint: POST /consignments/:id/upload-challan

const onSubmit = async (data) => {
  const res = await consignmentAPI.create(data);
  // On success: navigate to /consignments/:id
  // On error: show toast with error message
};
```

**Files changed:** `frontend/src/components/forms/ConsignmentForm.jsx` (build from empty)

---

### TASK 3.2 — Build InvoiceForm.jsx
**Dimension:** Feature Completeness (11) | **Time:** 2.5 hours | **Priority:** P1

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Invoice Number | Text (read-only) | Auto-generated |
| Invoice Date | Date | Required |
| Invoice Party | Searchable Select | Required — GET /masters/invoice-parties |
| Billing Period | Date Range | Required |
| Line Items | Dynamic rows | At least 1 row required |
| — Description | Text | Required per row |
| — Amount (₹) | Number | Required, min 0 per row |
| Total | Display (auto-sum) | Calculated from line items |
| Due Date | Date | Required, after invoice date |
| Notes | Textarea | Optional |

**Dynamic line items pattern:**
```jsx
const { fields, append, remove } = useFieldArray({ name: 'lineItems' });
// Renders add/remove row buttons
// Total = fields.reduce((sum, item) => sum + (item.amount || 0), 0)
```

**Files changed:** `frontend/src/components/forms/InvoiceForm.jsx`

---

### TASK 3.3 — Build PartyForm.jsx
**Dimension:** Feature Completeness (11) | **Time:** 1.5 hours | **Priority:** P1

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Party Name | Text | Required, min 3 chars |
| Type | Select | Consignor / Consignee / Both |
| Contact Person | Text | Optional |
| Phone | Text | 10 digits, starts with 6-9 |
| Email | Email | Optional, valid format |
| Address | Textarea | Required |
| City | Searchable Select | Required — GET /masters/cities |
| State | Select | Required — GET /masters/states |
| GSTIN | Text | Optional, format: 22AAAAA0000A1Z5 |
| PAN | Text | Optional, format: ABCDE1234F |
| Bank Name | Text | Optional |
| Account Number | Text | Optional |
| IFSC Code | Text | Optional, format: ABCD0123456 |

**Files changed:** `frontend/src/components/forms/PartyForm.jsx`

---

### TASK 3.4 — Build PaymentForm.jsx
**Dimension:** Feature Completeness (11) | **Time:** 1.5 hours | **Priority:** P1

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Invoice | Searchable Select | Required — GET /invoices?status=pending |
| Payment Date | Date | Required, not future |
| Amount (₹) | Number | Required, min 0.01 |
| Mode | Select | Cash / NEFT / IMPS / Cheque / UPI |
| Transaction Reference | Text | Required if mode ≠ Cash |
| Cheque Number | Text | Required if mode = Cheque |
| Notes | Textarea | Optional |
| Receipt | File Upload | PDF/Image, max 5MB, optional |

**Files changed:** `frontend/src/components/forms/PaymentForm.jsx`

---

### TASK 3.5 — Build VehicleForm.jsx
**Dimension:** Feature Completeness (11) | **Time:** 1 hour | **Priority:** P1

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Truck Number | Text | Required, format: `^[A-Z]{2}-\d{2}-[A-Z]{2}-\d{4}$` |
| Vehicle Type | Select | Truck / Trailer / Container / Tanker |
| Capacity (tons) | Number | Required, min 0.5 |
| Owner / Broker | Searchable Select | GET /masters/vehicle-owners |
| Insurance Expiry | Date | Required |
| Permit Expiry | Date | Required |
| Notes | Textarea | Optional |

**Truck number real-time format validator:**
```jsx
// Shows live formatted preview as user types: "MH12AB1234" → "MH-12-AB-1234"
const formatTruckNumber = (val) => val.toUpperCase().replace(/[^A-Z0-9]/g, '')
  .replace(/^([A-Z]{0,2})(\d{0,2})([A-Z]{0,2})(\d{0,4}).*/, '$1-$2-$3-$4');
```

**Files changed:** `frontend/src/components/forms/VehicleForm.jsx`

---

### TASK 3.6 — Build Settings Page (3 sub-pages)
**Dimension:** Feature Completeness (11), UI/UX (3) | **Time:** 2 hours | **Priority:** P2

**Three tabs:**

**Profile tab:**
- Fields: Display Name, Phone (editable) | Email (read-only)
- Submits: `PATCH /auth/me`
- Show current avatar initials (generated from name)

**Security tab:**
- Fields: Current Password, New Password, Confirm Password
- Submits: `POST /auth/change-password`
- Password strength indicator (weak/medium/strong)

**Preferences tab:**
- Theme: Light / Dark / System (already works via themeStore)
- Default items per page: 10 / 20 / 50
- Date format: DD/MM/YYYY or YYYY-MM-DD
- Stored in `localStorage` via a new `usePrefsStore` Zustand store

**Files changed:**
- `frontend/src/app/(dashboard)/settings/page.jsx` (rebuild)
- `frontend/src/store/prefsStore.js` (new)

---

### TASK 3.7 — Build Password Reset Flow
**Dimension:** Feature Completeness (11), Auth (6) | **Time:** 2 hours | **Priority:** P2

**Backend (3 new endpoints):**
```
POST /auth/forgot-password    → validate email → generate signed token → send email via Resend
GET  /auth/reset-password/:token → validate token → render reset form
POST /auth/reset-password      → validate token + new password → update + blacklist token
```

Token: `jwt.sign({ userId, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' })`
Email: Use Resend (already integrated). Free tier: 100 emails/day.

**Frontend (2 new pages):**
- `/forgot-password` — email input → submit → "Check your inbox" success state
- `/reset-password` — reads `?token=` from URL → new password form → success → redirect to `/login`

**Files changed:**
- `backend/src/controllers/auth.controller.js` (3 new methods)
- `backend/src/routes/auth.routes.js` (3 new routes)
- `frontend/src/app/(auth)/forgot-password/page.jsx` (new)
- `frontend/src/app/(auth)/reset-password/page.jsx` (new)
- Login page: add "Forgot Password?" link

---

### TASK 3.8 — Fix Dashboard Mock Data + Implement Audit Logs
**Dimension:** Feature Completeness (11), UI/UX (3) | **Time:** 1 hour | **Priority:** P2

**Dashboard:**
- Remove the `catch` block that sets `{ totalRevenue: '₹24,50,000', ... }`
- Replace with: `setDashboardError(true)` → render `<ErrorState>` component
- When API works: data comes from `GET /reports/dashboard` (already implemented in backend)

**Audit Logs:**
- Backend: Create `GET /audit-logs?page=1&limit=20` endpoint
- Frontend: `audit-logs/page.jsx` calls this on mount, renders in data-table
- Columns: Date/Time, User, Action, Entity Type, Entity ID, IP Address

**Files changed:**
- `frontend/src/app/(dashboard)/page.jsx`
- `frontend/src/app/(dashboard)/audit-logs/page.jsx`
- `backend/src/routes/audit-log.routes.js` (new)
- `backend/src/controllers/audit-log.controller.js` (new)

---

**PHASE 3 END — Feature Completeness 3→9, UI/UX 7→8.5, Auth 9→9.5**

---

## PHASE 4 — QUALITY
### Time: ~10 hours | Days 11–13

---

### TASK 4.1 — Consolidate 3 Auth Systems into 1
**Dimension:** Architecture (1) | **Time:** 2 hours | **Priority:** P1

By Phase 4, Task 2.3 already moved agent tokens to cookies. Now fully consolidate the stores.

**Steps:**
1. Delete `frontend/src/contexts/auth-context.tsx` (ride-sharing auth context)
2. Delete `frontend/src/store/agentAuthStore.js` (replaced in Task 2.3)
3. Extend `frontend/src/store/authStore.js`:
   ```js
   // Add portal field: 'admin' | 'user' | 'agent'
   // Add agentProfile field for agent-specific data
   ```
4. Update all components that import from `auth-context` to use `useAuthStore` instead
5. Update all components that import from `agentAuthStore` to use `useAuthStore` instead

**Files changed:**
- `frontend/src/store/authStore.js` (extend)
- Delete `frontend/src/contexts/auth-context.tsx`
- Delete `frontend/src/store/agentAuthStore.js`
- All files importing from deleted files

---

### TASK 4.2 — Standardize API Client (Delete api-client.ts)
**Dimension:** Architecture (1) | **Time:** 1.5 hours | **Priority:** P1

**Steps:**
1. `grep -r "api-client" frontend/src` — find all importers
2. For each importer: replace the import with `api.js` equivalent call
3. Delete `frontend/src/lib/api-client.ts`
4. Verify no TypeScript errors

**Files changed:** `frontend/src/lib/api-client.ts` (delete), all files importing it

---

### TASK 4.3 — Implement Retry Logic + Sentry Error Tracking
**Dimension:** Error Handling (12), Performance (8) | **Time:** 1.5 hours | **Priority:** P2

**Retry (axios-retry — free):**
```bash
cd frontend && npm install axios-retry
```
Add to `frontend/src/lib/api.js`:
```js
import axiosRetry from 'axios-retry';
axiosRetry(api, {
  retries: 2,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => !error.response || error.response.status >= 500,
});
```

**Sentry (free, 5k events/month):**
```bash
cd frontend && npx @sentry/wizard@latest -i nextjs
```
- Creates `sentry.client.config.js` and `sentry.server.config.js` automatically
- Add `NEXT_PUBLIC_SENTRY_DSN` to Vercel env vars
- Replace `// TODO: Send to Sentry` in `ErrorBoundary.jsx`:
  ```js
  import * as Sentry from '@sentry/nextjs';
  // In componentDidCatch:
  Sentry.captureException(error, { contexts: { react: { componentStack } } });
  ```

**Files changed:** `frontend/src/lib/api.js`, `frontend/src/components/shared/ErrorBoundary.jsx`

---

### TASK 4.4 — Add Prisma Transactions to Multi-Step Operations
**Dimension:** Database (4) | **Time:** 1 hour | **Priority:** P2

**Key places to wrap in `prisma.$transaction()`:**
- `consignment.service.js` — create consignment + write audit log
- `invoice.service.js` — create invoice + update party ledger balance
- `payment.service.js` — record payment + update invoice.paidAmount + update invoice.status

```js
// Pattern for all:
const result = await prisma.$transaction(async (tx) => {
  const entity = await tx.consignment.create({ data });
  await tx.auditLog.create({ data: { action: 'CREATE', entityType: 'consignment', entityId: entity.id } });
  return entity;
});
```

**Files changed:** `consignment.service.js`, `invoice.service.js`, `payment.service.js`

---

### TASK 4.5 — Implement Real Pagination (Replace limit:100 everywhere)
**Dimension:** Performance (8), API Design (5) | **Time:** 1.5 hours | **Priority:** P2

**Backend:**
Create `backend/src/middleware/pagination.js`:
```js
const MAX_PAGE_SIZE = 50;
module.exports = (req, res, next) => {
  req.pagination = {
    page: Math.max(parseInt(req.query.page) || 1, 1),
    limit: Math.min(parseInt(req.query.limit) || 20, MAX_PAGE_SIZE),
    skip: 0,
  };
  req.pagination.skip = (req.pagination.page - 1) * req.pagination.limit;
  next();
};
```
Mount on all list routes. Update all Prisma queries to use `skip` and `take`.

**Frontend:**
- Replace `consignmentAPI.getAll({ limit: 100 })` → `consignmentAPI.getAll({ page, limit: 20 })`
- All list pages get prev/next buttons using `meta.page` and `meta.total` from API response
- The existing `data-table` component already supports pagination props — just wire them up

**Files changed:** 5 controllers, 5 frontend list pages, new `pagination.js` middleware

---

### TASK 4.6 — Add SWR for Client-Side Caching
**Dimension:** Performance (8) | **Time:** 1.5 hours | **Priority:** P3

```bash
cd frontend && npm install swr
```

Convert the `useEffect + useState + setLoading` pattern to SWR in the top 5 most-visited pages:
```js
// BEFORE (every page):
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  api.get('/consignments').then(r => setData(r.data));
}, []);

// AFTER (with SWR):
const { data, error, isLoading } = useSWR('/consignments', () => consignmentAPI.getAll({ page, limit: 20 }));
```

Benefits: instant load from cache on revisit, background refresh, deduplication.

**Files changed:** `consignments/page.jsx`, `invoices/page.jsx`, `payments/page.jsx`, `vehicles/page.jsx`, `parties/page.jsx`

---

### TASK 4.7 — Enable ESLint on Backend + Fix Lint Errors
**Dimension:** Architecture (1) | **Time:** 1 hour | **Priority:** P3

```bash
cd backend && npm install --save-dev eslint eslint-plugin-node
```

Create `backend/.eslintrc.js`:
```js
module.exports = {
  env: { node: true, es2021: true },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
  },
};
```

Update `package.json`: `"lint": "eslint src/ --fix"`
Run `npm run lint` → fix all warnings automatically.

**Files changed:** `backend/.eslintrc.js` (new), `backend/package.json`

---

### TASK 4.8 — Add `<ConfirmModal>` + Replace window.confirm()
**Dimension:** UI/UX (3), Error Handling (12) | **Time:** 1 hour | **Priority:** P3

Create `frontend/src/components/shared/ConfirmModal.jsx`:
```jsx
// Glass-styled modal with title, message, confirm button (red for destructive), cancel button
// Controlled via a useConfirm() hook:
const { confirm } = useConfirm();
// Usage: const ok = await confirm({ title: 'Delete Vehicle?', message: 'This cannot be undone.', danger: true });
// if (ok) deleteVehicle(id);
```

Grep for `window.confirm(` across frontend → replace each with `await confirm({ ... })`.

**Files changed:** New `ConfirmModal.jsx`, new `useConfirm.js` hook, all pages using window.confirm

---

**PHASE 4 END — Architecture 4→8, Performance 4→8.5, Error Handling 4→8.5**

---

## PHASE 5 — POLISH
### Time: ~6 hours | Days 14–15

---

### TASK 5.1 — Add Composite DB Indexes
**Dimension:** Database (4) | **Time:** 30 min | **Priority:** P2

Create `prisma/migrations/[timestamp]_add_composite_indexes/migration.sql`:
```sql
CREATE INDEX idx_consignments_status_date ON consignments(status, created_at DESC);
CREATE INDEX idx_invoices_party_status ON invoices(party_id, status);
CREATE INDEX idx_payments_invoice_date ON payments(invoice_id, payment_date DESC);
CREATE INDEX idx_consignments_vehicle ON consignments(vehicle_id, created_at DESC);
```
Run: `npx prisma migrate deploy`

**Score impact:** Database 7.5→9

---

### TASK 5.2 — Generate Swagger API Docs
**Dimension:** API Design (5), Documentation (9) | **Time:** 1.5 hours | **Priority:** P3

```bash
cd backend && npm install swagger-jsdoc swagger-ui-express
```

Create `backend/src/config/swagger.js` with OpenAPI spec metadata.
Add `@swagger` JSDoc annotations to all route files (template is fast once first one done).
Serve at `GET /api-docs`.

**Files changed:** `backend/src/config/swagger.js` (new), all route files, `app.js`

---

### TASK 5.3 — Write Tests (Core Auth + Consignment)
**Dimension:** Testing (7) | **Time:** 2 hours | **Priority:** P3

```bash
cd backend && npm install --save-dev jest supertest
cd frontend && npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Backend tests (target: 20 tests):**
- `auth.test.js`: login success/fail, lockout, refresh, logout + blacklist
- `consignment.test.js`: create, read, update status, delete
- `middleware.test.js`: authenticateToken with valid/expired/blacklisted token

**Frontend tests (target: 10 tests):**
- `authStore.test.js`: login sets user, logout clears, role correct
- `themeStore.test.js`: toggle applies dark class to document
- `helpers.test.js`: formatCurrency, formatDate, formatTruckNumber

**Fix GitHub Actions:** Remove `continue-on-error: true`. Add test run step.

---

### TASK 5.4 — Write README.md and ARCHITECTURE.md
**Dimension:** Documentation (9) | **Time:** 1 hour | **Priority:** P3

Delete the 20+ noise `.md` files in the root (all the `*_GUIDE.md`, `*_CHECKLIST.md` etc.)
Write `README.md`:
- What this is, what it does
- Local setup: prerequisites, clone, `npm install`, env setup, `npm run dev`
- Env vars table
- Architecture overview diagram (ASCII)

Write `ARCHITECTURE.md`:
- System diagram
- The 3 portals and who uses them
- Auth strategy: httpOnly cookies, JWT rotation, Redis blacklist
- DB schema overview
- Free tier stack

---

### TASK 5.5 — Replace `<img>` with `<Image>` + Add Empty States
**Dimension:** Performance (8), UI/UX (3) | **Time:** 1 hour | **Priority:** P3

`grep -rn "<img " frontend/src` → replace each with `next/image` `<Image>`.

Create `frontend/src/components/ui/EmptyState.jsx`:
```jsx
// Props: icon, title, description, action (button label + onClick)
// Used on: consignments, invoices, payments, vehicles, parties when data.length === 0
```

---

**PHASE 5 END — All dimensions at target scores.**

---

## FINAL SCORE PROJECTION

```
┌─────────────────────────────────────────────────────┬───────┬───────────┬──────────────────┐
│  Dimension                                          │ Start │ After     │ Key Tasks        │
├─────────────────────────────────────────────────────┼───────┼───────────┼──────────────────┤
│  1.  Code Architecture & Quality                    │  4/10 │  9.0/10   │ 4.1, 4.2, 4.7   │
│  2.  Security                                       │  3/10 │  9.5/10   │ 1.1, 1.3–1.6,   │
│                                                     │       │           │ 2.4, 2.6         │
│  3.  UI / UX Design                                 │  7/10 │  9.8/10   │ 3.6, 3.8, 4.8,  │
│                                                     │       │           │ 5.5              │
│  4.  Database Design                                │  5/10 │  9.5/10   │ 2.1, 2.2, 4.4,  │
│                                                     │       │           │ 5.1              │
│  5.  API Design                                     │  5/10 │  9.5/10   │ 2.7, 2.8, 5.2   │
│  6.  Authentication & Authorization                 │  3/10 │  9.5/10   │ 2.3, 2.4, 2.5,  │
│                                                     │       │           │ 3.7, 4.1         │
│  7.  Testing                                        │  1/10 │  8.0/10   │ 5.3              │
│  8.  Performance                                    │  4/10 │  9.0/10   │ 2.6, 4.5, 4.6,  │
│                                                     │       │           │ 5.5              │
│  9.  Documentation                                  │  3/10 │  9.5/10   │ 5.2, 5.4        │
│ 10.  DevOps & Deployment                            │  3/10 │  9.5/10   │ 1.2, 2.1        │
│ 11.  Feature Completeness                           │  3/10 │  9.8/10   │ 3.1–3.8         │
│ 12.  Error Handling & Resilience                    │  4/10 │  9.5/10   │ 3.8, 4.3, 4.8  │
├─────────────────────────────────────────────────────┼───────┼───────────┼──────────────────┤
│  OVERALL                                            │  4/10 │  9.5/10   │                  │
└─────────────────────────────────────────────────────┴───────┴───────────┴──────────────────┘
```

*Testing lands at 8/10 — full 9.9 requires E2E Playwright + 80% coverage, which is a separate sprint.*

---

## TOTAL TIME SUMMARY

```
PHASE 1 — Foundation     ~8 hrs    [Tasks 1.1–1.6]   Security + Deployment
PHASE 2 — Core Fixes    ~14 hrs    [Tasks 2.1–2.8]   Auth + DB + API
PHASE 3 — Features      ~14 hrs    [Tasks 3.1–3.8]   5 Forms + Settings + Password Reset
PHASE 4 — Quality       ~10 hrs    [Tasks 4.1–4.8]   Architecture + Error + Performance
PHASE 5 — Polish         ~6 hrs    [Tasks 5.1–5.5]   Tests + Docs + UI polish
─────────────────────────────────────────────────────────────────────────────
TOTAL                   ~52 hours   15 working days (3 weeks at ~3-4 hrs/day)
```

---

## ZERO COST STACK (₹0/month)

```
┌──────────────────┬───────────────────────────┬────────────────────────┐
│ Layer            │ Service                   │ Free Limit             │
├──────────────────┼───────────────────────────┼────────────────────────┤
│ Frontend         │ Vercel Hobby ✓            │ Unlimited deploys      │
│ Backend          │ Render.com Web Service    │ 750 hrs/month          │
│ Database         │ Supabase Free ✓           │ 500 MB, 2 projects     │
│ File Storage     │ Supabase Storage          │ 1 GB                   │
│ Redis            │ Upstash Free              │ 10,000 commands/day    │
│ Email            │ Resend Free ✓             │ 100 emails/day         │
│ Error Tracking   │ Sentry Free               │ 5,000 events/month     │
│ API Docs         │ Swagger UI (self-hosted)  │ Unlimited              │
│ CI/CD            │ GitHub Actions ✓          │ 2,000 min/month        │
└──────────────────┴───────────────────────────┴────────────────────────┘
Monthly cost: ₹0
```

---

## START HERE — FIRST 3 COMMANDS

```bash
# 1. Rotate secrets (do this NOW before anything else)
openssl rand -base64 64  # → copy as JWT_SECRET
openssl rand -base64 64  # → copy as JWT_REFRESH_SECRET
# Then update Supabase DB password in dashboard

# 2. Remove env files from git tracking
git rm --cached .env backend/.env
git commit -m "fix: remove env files from git tracking"
git push origin master

# 3. Deploy backend (go to render.com → connect repo → backend/ → node src/server.js)
```

---

*Plan version: 1.0 | Created: 2026-04-27 | Target completion: 2026-05-12*
