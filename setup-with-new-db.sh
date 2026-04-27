#!/bin/bash

# Setup with new Supabase connection string

PROJECT_DIR="/Users/msagastya/Desktop/raghhav-roadways"
BACKEND_DIR="$PROJECT_DIR/backend"

echo "======================================"
echo "🔧 Raghhav Roadways - New DB Setup"
echo "======================================"
echo ""

# Get new DATABASE_URL from user
echo "Paste your new Supabase connection string:"
echo "(It should start with: postgresql://postgres:...)"
echo ""
read -p "DATABASE_URL: " NEW_DB_URL

if [ -z "$NEW_DB_URL" ]; then
  echo "❌ No connection string provided"
  exit 1
fi

# Validate it looks like a Supabase URL
if ! echo "$NEW_DB_URL" | grep -q "postgresql://"; then
  echo "❌ Invalid connection string format"
  exit 1
fi

echo ""
echo "✅ Connection string received"
echo ""

# Update .env file
echo "📝 Updating .env file..."
cd "$BACKEND_DIR"

# Use sed to replace the DATABASE_URL line
sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$NEW_DB_URL\"|" .env

echo "✅ .env updated"
echo ""

# Test connection
echo "🔍 Testing new database connection..."
sleep 1

HOST=$(echo $NEW_DB_URL | sed -E 's/.*@([^:]+).*/\1/')
PORT=$(echo $NEW_DB_URL | sed -E 's/.*:([0-9]+).*/\1/')

timeout 5 bash -c "</dev/tcp/$HOST/$PORT" 2>/dev/null

if [ $? -ne 0 ]; then
  echo "❌ Still can't reach database"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Make sure Supabase project is ACTIVE (not paused)"
  echo "  2. Wait 2-3 more minutes for initialization"
  echo "  3. Check connection string is correct"
  echo "  4. Try again"
  exit 1
fi

echo "✅ Database is reachable!"
echo ""

# Run migrations
echo "📊 Running migrations..."
npx prisma migrate deploy 2>&1 | tail -5

echo ""
echo "✅ Database schema created"
echo ""

# Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate > /dev/null 2>&1

echo "✅ Prisma client generated"
echo ""

echo "======================================"
echo "✨ DATABASE SETUP COMPLETE!"
echo "======================================"
echo ""
echo "📌 Next Steps:"
echo ""
echo "1️⃣  Update Vercel Environment:"
echo "   Go to: https://vercel.com/.../settings/environment-variables"
echo "   Update DATABASE_URL with your new connection string"
echo "   Click Save"
echo ""
echo "2️⃣  Redeploy Backend:"
echo "   cd $PROJECT_DIR"
echo "   git add ."
echo "   git commit -m 'Update database connection'"
echo "   git push origin master"
echo "   Wait 5 minutes for Vercel deployment"
echo ""
echo "3️⃣  Create Admin User:"
echo "   cd $BACKEND_DIR"
echo "   npm run dev"
echo ""
echo "   Then in another terminal:"
echo "   curl -X POST http://localhost:3001/api/v1/admin/auth/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"adminId\":\"super_admin\",\"password\":\"InitialPassword123\",\"confirmPassword\":\"InitialPassword123\",\"name\":\"Super Administrator\",\"email\":\"admin@raghhav-roadways.com\",\"role\":\"super_admin\"}'"
echo ""
echo "4️⃣  Setup Frontend:"
echo "   cd $PROJECT_DIR/frontend"
echo "   npm install"
echo "   echo 'NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1' > .env.local"
echo "   npm run dev"
echo ""
echo "5️⃣  Test at: http://localhost:3000"
echo ""
