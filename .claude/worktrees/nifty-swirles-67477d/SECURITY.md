# Security Implementation Guide

This document outlines the security improvements implemented in the Raghhav Roadways application.

## 🔐 Critical Security Fixes

### 1. **Authentication Token Security**

**Problem:** Tokens were stored in localStorage, vulnerable to XSS attacks.

**Solution:**
- Tokens now stored in **httpOnly cookies** (JavaScript cannot access)
- Cookies marked as `Secure` (HTTPS only in production) and `SameSite=Strict` (CSRF protection)
- Frontend reads user info from sessionStorage, not tokens
- Backend supports both cookie-based and Authorization header (for backward compatibility)

**Files:**
- `backend/src/controllers/auth.controller.js` - Sets httpOnly cookies on login
- `backend/src/middleware/auth.js` - Checks cookies first, then headers
- `frontend/src/lib/auth.js` - Removes localStorage token storage
- `frontend/src/lib/api.js` - Uses `withCredentials: true` for cookie-based auth

### 2. **CSRF Protection**

**Problem:** No protection against Cross-Site Request Forgery attacks.

**Solution:**
- Implemented CSRF token validation middleware
- Tokens stored in non-httpOnly cookies (frontend can read)
- Required in X-CSRF-Token header for state-changing requests (POST, PATCH, DELETE, PUT)
- Safe methods (GET, HEAD, OPTIONS) exempt from checks

**Files:**
- `backend/src/middleware/csrf.js` - CSRF protection middleware
- `backend/src/app.js` - Integrated into middleware pipeline

### 3. **Input Sanitization**

**Problem:** User input could contain malicious HTML/JavaScript (stored XSS risk).

**Solution:**
- All text inputs sanitized to remove HTML tags
- XSS library removes potentially malicious content
- Applied to request body and query parameters

**Files:**
- `backend/src/middleware/inputSanitization.js` - Sanitization middleware

### 4. **Account Lockout**

**Problem:** No protection against brute force login attacks.

**Solution:**
- Account locks after 5 failed login attempts
- Lockout duration: 15 minutes
- Automatic unlock after timeout
- Logging of lockout events

**Files:**
- `backend/src/middleware/loginRateLimiter.js` - Login attempt tracking
- `backend/src/controllers/auth.controller.js` - Integrated into login flow

### 5. **Seed Route Protection**

**Problem:** Database seeding endpoint was unprotected.

**Solution:**
- Requires authentication (Bearer token)
- Requires SUPER_ADMIN role authorization
- Blocked in production environment
- Properly logs access attempts

**Files:**
- `backend/src/routes/seed.routes.js` - Protected with auth middleware

### 6. **Development Auth Bypass Removal**

**Problem:** `devAuth.js` middleware bypassed authentication in non-production.

**Solution:**
- Deleted the dangerous middleware file
- No longer any mechanism to bypass authentication

**Files:**
- `backend/src/middleware/devAuth.js` - DELETED

### 7. **Security Headers**

**Problem:** Missing HTTP security headers.

**Solution:**

Backend (Helmet.js):
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security: max-age=31536000

Frontend (Next.js headers):
- Same security headers as backend
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restricts camera, microphone, geolocation

**Files:**
- `backend/src/app.js` - Helmet.js configured
- `frontend/next.config.js` - Security headers configured

### 8. **Request Timeout Protection**

**Problem:** Long-running requests could hang connections (DoS risk).

**Solution:**
- Default timeout: 30 seconds
- Long operations timeout: 120 seconds (file uploads, PDF generation)
- Returns 408 status code on timeout
- Prevents slow client attacks

**Files:**
- `backend/src/middleware/requestTimeout.js` - Request timeout middleware

### 9. **Input Validation**

**Problem:** Inconsistent input validation and error handling.

**Solution:**
- Joi schemas for environment variables validation
- Express-validator for route input validation
- Proper error handling and user-friendly error messages
- No sensitive data in error responses

## 🛡️ Security Best Practices Implemented

### Authentication
- ✅ Strong password requirements (8+ chars, upper, lower, number, special char)
- ✅ JWT tokens with expiration (7 days access, 30 days refresh)
- ✅ Secure token refresh mechanism
- ✅ Account lockout after failed attempts
- ✅ Session-based authentication with httpOnly cookies

### API Security
- ✅ CORS properly configured with origin validation
- ✅ Rate limiting on auth endpoints
- ✅ Request size limits (10MB)
- ✅ Request timeout protection
- ✅ CSRF token validation
- ✅ Security headers (Helmet.js)
- ✅ Input sanitization against XSS

### Data Protection
- ✅ Passwords hashed with bcryptjs (salted)
- ✅ Sensitive data in request/response validation
- ✅ No sensitive data in error messages (production only)
- ✅ Audit logging of critical actions

### Code Quality
- ✅ Proper error handling with try-catch
- ✅ Structured logging with Winston
- ✅ Request ID tracking for debugging
- ✅ Graceful shutdown handling
- ✅ No console.log in production code

## 📋 Environment Variables

**NEVER commit `.env` files!** Use `.env.example` as template.

Generate strong JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 characters (generated above)
- `JWT_REFRESH_SECRET` - Min 32 characters (generated above)
- `NODE_ENV` - Set to "production" in production

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords and secrets
- [ ] Set `NODE_ENV=production`
- [ ] Generate new JWT secrets (min 32 chars)
- [ ] Configure CORS_ORIGIN for your domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure cookie flags (done automatically)
- [ ] Configure database backups
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable audit logging
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Review and adjust rate limits for production load
- [ ] Test login and token refresh flow
- [ ] Verify CSRF token protection works
- [ ] Test file upload restrictions
- [ ] Review and sanitize any user-generated content displays

## 🔍 Security Testing

### Manual Testing
1. **Test CSRF Protection:**
   - Make POST request without CSRF token - should be rejected
   - Make POST request with wrong CSRF token - should be rejected
   - Make POST request with valid CSRF token - should succeed

2. **Test Account Lockout:**
   - Attempt login 5 times with wrong password
   - On 6th attempt, should get "locked" response
   - Wait 15 minutes, then login should work

3. **Test XSS Protection:**
   - Try to submit `<script>alert('xss')</script>` in text fields
   - Should be sanitized and stored as plain text

4. **Test Token Security:**
   - Check browser DevTools - tokens should NOT be in localStorage
   - Tokens should be in httpOnly cookies (not accessible to JS)

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)

## 🔗 Related Files

### Backend Security
- `src/middleware/auth.js` - Authentication/authorization
- `src/middleware/csrf.js` - CSRF protection
- `src/middleware/inputSanitization.js` - XSS prevention
- `src/middleware/loginRateLimiter.js` - Brute force protection
- `src/middleware/requestTimeout.js` - DoS protection
- `src/middleware/errorHandler.js` - Error handling
- `src/config/envValidation.js` - Environment validation

### Frontend Security
- `src/lib/auth.js` - Authentication utilities
- `src/lib/api.js` - Secure API client
- `next.config.js` - Security headers

## 📝 Notes

- Tokens are intentionally NOT sent in response body - only in cookies
- Frontend should not try to read tokens from response
- CSRF tokens ARE readable by JS (stored in regular cookies)
- All sensitive operations require valid JWT token
- Failed login attempts are rate limited

## ⚠️ Known Limitations

1. **In-Memory Login Attempt Tracker**: Uses application memory, doesn't persist across restarts or distributed servers. For production, migrate to Redis.

2. **No Token Blacklist**: Tokens are valid until expiration. Implement token blacklist for immediate logout in distributed systems.

3. **PDF Generation**: Still uses Puppeteer (heavy). Consider lighter alternatives (pdfkit, wkhtmltopdf) for production.

4. **Rate Limiting**: Currently in-memory. Use Redis for distributed systems.

---

**Last Updated:** 2026-02-12
**Security Level:** ⚠️ Development → 🔒 Production-Ready (with deployment checklist items)
