#!/bin/bash

# Supabase Connection Diagnostic
echo "🔍 Testing Supabase Connection..."
echo ""

# Extract connection details from .env
DB_URL=$(grep DATABASE_URL /Users/msagastya/Desktop/raghhav-roadways/backend/.env | cut -d'"' -f2)

if [ -z "$DB_URL" ]; then
  echo "❌ DATABASE_URL not found"
  exit 1
fi

# Parse URL
HOST=$(echo $DB_URL | sed -E 's/.*@([^:]+).*/\1/')
PORT=$(echo $DB_URL | sed -E 's/.*:([0-9]+).*/\1/')

echo "📋 Connection Details:"
echo "   Host: $HOST"
echo "   Port: $PORT"
echo ""
echo "⏳ Testing connectivity..."
echo ""

# Test with timeout
timeout 5 bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Database server is REACHABLE!"
  echo ""
  echo "Next step: Run migration"
  echo "  cd /Users/msagastya/Desktop/raghhav-roadways/backend"
  echo "  npx prisma migrate deploy"
else
  echo "❌ Database server is NOT reachable"
  echo ""
  echo "Possible causes:"
  echo "  • Supabase project is PAUSED"
  echo "  • Network connectivity issue"
  echo "  • Database server is down"
  echo ""
  echo "Solutions:"
  echo "  1. Go to https://supabase.com/dashboard"
  echo "  2. Find your project 'dlmgmdemfvjpnokkgylq'"
  echo "  3. Look for a 'Resume' button"
  echo "  4. Click it and wait 2-3 minutes"
  echo "  5. Run this script again"
fi
