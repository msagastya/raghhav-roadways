-- Migration: Add Admin Users and Ride Sharing Platform
-- Description: Add admin_users table for dual authentication and ride-sharing platform tables (rides, ride_ratings)
-- Created: 2026-04-26

-- ============================================
-- 1. ADD ADMIN_USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin', -- admin, super_admin
  last_login TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_admin_id ON admin_users(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- ============================================
-- 2. ALTER USERS TABLE - Add new columns
-- ============================================

-- Add profile photo URL column if it doesn't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS profile_photo_url VARCHAR(500);

-- Add verified email and phone columns if they don't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verified_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_phone BOOLEAN DEFAULT false;

-- Create indexes for users (for ride platform)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 3. CREATE RIDES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS rides (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pickup_location VARCHAR(300) NOT NULL,
  dropoff_location VARCHAR(300) NOT NULL,
  pickup_lat FLOAT,
  pickup_lng FLOAT,
  dropoff_lat FLOAT,
  dropoff_lng FLOAT,
  status VARCHAR(30) DEFAULT 'requested', -- requested, accepted, started, completed, cancelled
  estimated_fare DECIMAL(10, 2),
  actual_fare DECIMAL(10, 2),
  distance_km FLOAT,
  duration_minutes INTEGER,
  ride_type VARCHAR(30) DEFAULT 'economy', -- economy, premium, sharing
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  payment_method VARCHAR(30),
  razorpay_order_id VARCHAR(100),
  scheduled_at TIMESTAMP NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason VARCHAR(200),
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for rides
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at);
CREATE INDEX IF NOT EXISTS idx_rides_payment_status ON rides(payment_status);

-- ============================================
-- 4. CREATE RIDE_RATINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS ride_ratings (
  id SERIAL PRIMARY KEY,
  ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL, -- 1-5
  review_text TEXT,
  cleanliness SMALLINT, -- 1-5
  driver_behavior SMALLINT, -- 1-5
  safety_rating SMALLINT, -- 1-5
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(ride_id, user_id)
);

-- Create indexes for ride_ratings
CREATE INDEX IF NOT EXISTS idx_ride_ratings_user_id ON ride_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_created_at ON ride_ratings(created_at);

-- ============================================
-- 5. CREATE SEED DATA FOR ADMIN USERS
-- ============================================

-- Note: Passwords should be hashed with bcrypt before inserting
-- This is a placeholder - developers should create actual admin users via API

-- Insert initial super_admin (password should be hashed)
-- INSERT INTO admin_users (admin_id, password_hash, name, email, role, is_active)
-- VALUES ('super_admin', '$2b$12$[hashed_password]', 'Super Administrator', 'admin@raghhav-roadways.com', 'super_admin', true);

-- ============================================
-- 6. SUMMARY OF CHANGES
-- ============================================
/*
SUMMARY:
- Created `admin_users` table for dual authentication (separate from user registration)
- Added columns to `users` table: profile_photo_url, verified_email, verified_phone
- Created `rides` table for ride-sharing platform (with ride status tracking, fares, location data)
- Created `ride_ratings` table for user ratings and reviews of rides
- Added appropriate indexes for performance optimization

IMPORTANT NOTES:
1. Admin users must be created programmatically via the admin controller with password hashing
2. Update the JWT secrets in .env: JWT_SECRET and JWT_REFRESH_SECRET
3. The rides and ratings tables support the public ride-sharing platform
4. All timestamps are automatically set to UTC
5. Foreign key constraints ensure data integrity
6. Indexes optimize query performance for common operations

NEXT STEPS:
1. Run this migration using Prisma: npx prisma migrate deploy
2. Create initial admin users via API POST /api/v1/admin/auth/create-initial-admin
3. Test admin login via POST /api/v1/admin/auth/login
4. Update frontend to use new admin authentication endpoints
5. Implement Socket.io for real-time ride tracking
*/
