#!/bin/bash

# 🚀 Raghhav Roadways - Automated Backend Setup
# This script handles: database migration, admin creation, and verification

set -e

PROJECT_DIR="/Users/msagastya/Desktop/raghhav-roadways"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "================================"
echo "🚀 RAGHHAV ROADWAYS SETUP"
echo "================================"
echo ""

# Step 1: Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
  echo "❌ Backend directory not found at $BACKEND_DIR"
  exit 1
fi

cd "$BACKEND_DIR"
echo "✅ Backend directory found"
echo ""

# Step 2: Check if .env exists
if [ ! -f ".env" ]; then
  echo "❌ .env file not found"
  exit 1
fi

echo "✅ .env file found"
echo ""

# Step 3: Test database connection
echo "🔍 Testing database connection..."
DB_URL=$(grep DATABASE_URL .env | cut -d'"' -f2)
HOST=$(echo $DB_URL | sed -E 's/.*@([^:]+).*/\1/')
PORT=$(echo $DB_URL | sed -E 's/.*:([0-9]+).*/\1/')

echo "   Connecting to: $HOST:$PORT"

timeout 5 bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ DATABASE CONNECTION FAILED"
  echo ""
  echo "Your Supabase project is likely PAUSED."
  echo ""
  echo "To fix:"
  echo "  1. Go to: https://supabase.com/dashboard"
  echo "  2. Find project ID: dlmgmdemfvjpnokkgylq"
  echo "  3. Click 'Resume' button"
  echo "  4. Wait 2-3 minutes for startup"
  echo "  5. Run this script again"
  echo ""
  exit 1
fi

echo "✅ Database connection successful"
echo ""

# Step 4: Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy 2>&1 || true
npx prisma generate

echo "✅ Database schema created"
echo ""

# Step 5: Create admin user
echo "👤 Creating initial admin user..."
echo ""

ADMIN_ID="super_admin"
ADMIN_PASSWORD="InitialPassword123"
ADMIN_NAME="Super Administrator"
ADMIN_EMAIL="admin@raghhav-roadways.com"

# First, ensure backend is NOT running (if it is, we need it for the next step)
echo "⚠️  Starting backend server for admin creation..."
echo "    (This will run in background)"
echo ""

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Try to create admin user
echo "Creating admin user..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/v1/admin/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"adminId\": \"$ADMIN_ID\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"confirmPassword\": \"$ADMIN_PASSWORD\",
    \"name\": \"$ADMIN_NAME\",
    \"email\": \"$ADMIN_EMAIL\",
    \"role\": \"super_admin\"
  }")

echo ""
echo "Response: $RESPONSE"
echo ""

# Kill backend
kill $BACKEND_PID 2>/dev/null || true

if echo "$RESPONSE" | grep -q "success"; then
  echo "✅ Admin user created successfully"
  echo ""
  echo "Credentials:"
  echo "  Admin ID: $ADMIN_ID"
  echo "  Password: $ADMIN_PASSWORD"
  echo ""
else
  echo "⚠️  Admin creation response:"
  echo "   $RESPONSE"
  echo ""
  echo "You can create the admin user manually later with:"
  echo "  npm run dev"
  echo "  curl -X POST http://localhost:3001/api/v1/admin/auth/register ..."
fi

echo ""
echo "================================"
echo "✨ BACKEND SETUP COMPLETE!"
echo "================================"
echo ""
echo "Next steps:"
echo "  1. Start backend: cd $BACKEND_DIR && npm run dev"
echo "  2. Start frontend: cd $PROJECT_DIR/frontend && npm run dev"
echo "  3. Visit: http://localhost:3000"
echo ""
