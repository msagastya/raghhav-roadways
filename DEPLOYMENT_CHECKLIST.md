# Raghhav Roadways - Complete Deployment Checklist

**Status**: Phase 1-7 Complete  
**Last Updated**: April 26, 2026  
**Deployment Timeline**: 2-3 weeks from database setup

---

## Pre-Deployment Phase

### Database Setup
- [ ] **Create New Supabase Project**
  - [ ] Visit https://supabase.com/dashboard
  - [ ] Click "New Project"
  - [ ] Name: `raghhav-roadways-new`
  - [ ] Region: `ap-south-1` (Mumbai/Singapore)
  - [ ] Wait 2-3 minutes for initialization
  - [ ] Get connection string from Settings → Database
  - [ ] Update `.env`: `DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"`

- [ ] **Run Database Migrations**
  ```bash
  cd /Users/msagastya/Desktop/raghhav-roadways/backend
  bash setup-with-new-db.sh
  # OR run manually:
  npx prisma migrate deploy
  npx prisma generate
  ```

- [ ] **Create Admin User**
  ```bash
  npm run dev
  # In another terminal:
  curl -X POST http://localhost:3001/api/v1/admin/auth/register \
    -H 'Content-Type: application/json' \
    -d '{...}'
  ```

- [ ] **Test Database Connection**
  ```bash
  npm run test:db
  ```

---

## Backend Deployment (Vercel)

### Environment Variables
- [ ] **Update Vercel Environment**
  ```
  DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
  JWT_SECRET=<generated-secret>
  JWT_REFRESH_SECRET=<generated-secret>
  JWT_EXPIRES_IN=7d
  JWT_REFRESH_EXPIRES_IN=30d
  CORS_ORIGIN=https://your-frontend.vercel.app
  NODE_ENV=production
  SENTRY_DSN=<optional>
  RESEND_API_KEY=<optional>
  REDIS_URL=<optional>
  ```

### Build & Deploy
- [ ] **Test Locally**
  ```bash
  npm run build
  npm run preview
  ```

- [ ] **Deploy to Vercel**
  ```bash
  git add .
  git commit -m "Production deployment: Phase 1-7"
  git push origin master
  # Wait 5-10 minutes for build and deployment
  ```

- [ ] **Verify Backend**
  - [ ] Check health: `GET https://your-backend.vercel.app/health`
  - [ ] Test login: `POST https://your-backend.vercel.app/api/v1/auth/login`
  - [ ] Test admin login: `POST https://your-backend.vercel.app/api/v1/admin/auth/login`

---

## Frontend Deployment

### Setup
- [ ] **Install Dependencies**
  ```bash
  cd /Users/msagastya/Desktop/raghhav-roadways/frontend
  npm install
  ```

- [ ] **Environment Variables**
  ```
  NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
  NEXT_PUBLIC_SOCKET_URL=https://your-backend.vercel.app
  ```

### Build & Deploy
- [ ] **Build Locally**
  ```bash
  npm run build
  npm run start
  # Test at http://localhost:3000
  ```

- [ ] **Test Login Flow**
  - [ ] User registration
  - [ ] User login
  - [ ] Admin login
  - [ ] Profile view
  - [ ] Ride booking
  - [ ] Wallet view

- [ ] **Deploy to Vercel**
  ```bash
  cd /Users/msagastya/Desktop/raghhav-roadways
  git add .
  git commit -m "Frontend deployment: Phase 3-4"
  git push origin master
  # Deploy frontend separately or use monorepo
  ```

- [ ] **Verify Frontend**
  - [ ] Visit https://your-frontend.vercel.app
  - [ ] Test all user flows
  - [ ] Test admin dashboard

---

## Mobile App Deployment

### iOS (App Store)
- [ ] **Build for iOS**
  ```bash
  cd /Users/msagastya/Desktop/raghhav-roadways/mobile
  npm install
  eas build --platform ios
  ```

- [ ] **App Store Submission**
  - [ ] Create Apple Developer account
  - [ ] Create App ID
  - [ ] Configure signing certificates
  - [ ] Submit to App Store
  - [ ] Wait 1-3 days for review

### Android (Google Play)
- [ ] **Build for Android**
  ```bash
  eas build --platform android
  ```

- [ ] **Google Play Submission**
  - [ ] Create Google Developer account ($25 fee)
  - [ ] Create app listing
  - [ ] Upload APK/AAB
  - [ ] Submit for review
  - [ ] Wait 2-3 hours for review

---

## Socket.io Real-time Setup

- [ ] **Install Dependencies**
  ```bash
  cd backend
  npm install socket.io socket.io-redis redis
  ```

- [ ] **Setup Socket Server**
  - [ ] Create `src/socket/index.ts`
  - [ ] Configure namespaces (users, drivers, admin)
  - [ ] Integrate with Express server
  - [ ] Setup Redis adapter for scaling

- [ ] **Redis Configuration**
  - [ ] Create Redis Cloud account (free tier available)
  - [ ] Get connection string
  - [ ] Update `.env`: `REDIS_URL=redis://default:password@host:port`

- [ ] **Frontend Integration**
  - [ ] Install `socket.io-client`
  - [ ] Create socket hooks
  - [ ] Test ride tracking
  - [ ] Test real-time notifications

- [ ] **Test Socket Events**
  ```bash
  npm run test:socket
  ```

---

## Security Checklist

### JWT & Passwords
- [ ] JWT secrets are strong and unique
- [ ] Password requirements enforced (8+ chars, uppercase, lowercase, numbers)
- [ ] Bcrypt salt rounds: 12
- [ ] Token refresh mechanism working
- [ ] Tokens expire appropriately

### Database Security
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] Database connection uses SSL
- [ ] Password is URL-encoded in connection string
- [ ] Backups configured and tested
- [ ] No sensitive data in logs

### API Security
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection enabled
- [ ] HTTPS enforced

### Infrastructure
- [ ] Environment variables not committed
- [ ] `.env` in `.gitignore`
- [ ] API keys rotated regularly
- [ ] Monitoring and alerts configured
- [ ] Error tracking (Sentry) optional setup

---

## Monitoring & Analytics

### Logging
- [ ] [ ] **Setup Sentry** (optional)
  ```
  SENTRY_DSN=https://xxx@sentry.io/123456
  ```

### Metrics
- [ ] [ ] **Setup Analytics**
  - [ ] Google Analytics (frontend)
  - [ ] Vercel Analytics (backend)
  - [ ] Custom dashboards

### Monitoring
- [ ] [ ] **Setup Uptime Monitoring**
  - [ ] UptimeRobot
  - [ ] Healthchecks
  - [ ] Alert emails

---

## Testing

### Unit Tests
- [ ] Backend API tests
  ```bash
  cd backend
  npm test
  ```

- [ ] Frontend component tests
  ```bash
  cd frontend
  npm test
  ```

### Integration Tests
- [ ] [ ] Test full user flows
  - [ ] Registration → Login → Book Ride → Rate Ride
  - [ ] Admin login → View metrics → Manage rides

- [ ] [ ] Test API endpoints
  ```bash
  npm run test:api
  ```

### Load Testing
- [ ] [ ] Test with multiple concurrent users
  ```bash
  npm run test:load
  ```

---

## Production Configuration

### Database
- [ ] [ ] Backup strategy configured
- [ ] [ ] Point-in-time recovery enabled
- [ ] [ ] Connection pooling configured
- [ ] [ ] Slow query logging enabled

### CDN & Caching
- [ ] [ ] Frontend assets cached
- [ ] [ ] API responses cached where appropriate
- [ ] [ ] Cache headers configured

### Performance
- [ ] [ ] Lighthouse score > 90
- [ ] [ ] Page load time < 3 seconds
- [ ] [ ] API response time < 500ms

---

## Post-Deployment

### Day 1
- [ ] Monitor error logs
- [ ] Check database performance
- [ ] Verify all user flows
- [ ] Test admin panel
- [ ] Monitor API response times

### Day 7
- [ ] Weekly analytics review
- [ ] User feedback collected
- [ ] Performance optimization
- [ ] Security audit

### Day 30
- [ ] Full system audit
- [ ] Capacity planning
- [ ] Feature requests prioritization
- [ ] Disaster recovery drill

---

## Rollback Plan

If deployment fails:

```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Or rollback specific service
# Vercel: Click "Deployments" → Select previous → Click "Promote to Production"
```

---

## Success Criteria

✅ **Deployment is successful when:**
- [ ] All 3 environments are live (web, iOS, Android)
- [ ] Users can register and login
- [ ] Users can book rides
- [ ] Admins can view dashboard
- [ ] Socket.io real-time tracking works
- [ ] Database connectivity is stable
- [ ] Error rate < 0.1%
- [ ] 99%+ uptime achieved

---

## Support Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Backend | Claude | Via Chat |
| Frontend | Claude | Via Chat |
| Mobile | Claude | Via Chat |
| Database | Supabase Support | 24/7 |
| Hosting | Vercel Support | 24/7 |
| Monitoring | Sentry (optional) | 24/7 |

---

## Sign-off

- [ ] Development Complete: **April 26, 2026**
- [ ] Database Setup: **[Date]**
- [ ] Backend Deployed: **[Date]**
- [ ] Frontend Deployed: **[Date]**
- [ ] Mobile Apps Live: **[Date]**
- [ ] Production Verified: **[Date]**
- [ ] All Tests Passing: **[Date]**
- [ ] Security Audit Complete: **[Date]**
- [ ] Performance Baseline: **[Date]**

---

**Deployment Manager**: [Your Name]  
**Approved By**: [Approval Authority]  
**Deployment Date**: [To Be Scheduled]
