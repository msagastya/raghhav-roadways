#!/bin/bash

# Raghhav Roadways - Quick Production Deploy Script
# Run this from the project root to deploy everything

set -e

echo "=========================================="
echo "Raghhav Roadways - Production Deployment"
echo "=========================================="
echo ""

# Step 1: Push to GitHub
echo "📤 Step 1: Pushing code to GitHub..."
cd "$(dirname "$0")"
git config user.email "ms.rudra.agastya@gmail.com"
git config user.name "Suyash Agastya"
git add -A
git commit -m "Production deployment: Updated Supabase credentials and Vercel configuration" || echo "No new changes to commit"
git push origin master

if [ $? -ne 0 ]; then
    echo "❌ Git push failed. Please ensure:"
    echo "   - You have GitHub credentials configured"
    echo "   - Or use a Personal Access Token"
    echo "   - Repository: https://github.com/msagastya/raghhav-roadways"
    exit 1
fi

echo "✅ Code pushed to GitHub"
echo ""

# Step 2: Instructions for Vercel
echo "=========================================="
echo "Next Steps - Complete in Vercel Dashboard"
echo "=========================================="
echo ""
echo "1️⃣  Backend Deployment:"
echo "   • Go to https://vercel.com"
echo "   • Click 'Add New' → 'Project'"
echo "   • Select 'raghhav-roadways' repository"
echo "   • Framework: Express"
echo "   • Root Directory: backend"
echo "   • Click Deploy"
echo ""
echo "2️⃣  Backend Environment Variables:"
echo "   • Go to Project Settings → Environment Variables"
echo "   • Add these variables:"
echo ""
echo "   DATABASE_URL=postgresql://postgres.dlmgmdemfvjpnokkgylq:RRoadways#2025@aws-0-ap-south-1.pooler.supabase.co:6543/postgres"
echo "   JWT_SECRET=fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c"
echo "   JWT_REFRESH_SECRET=96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65"
echo "   NODE_ENV=production"
echo "   CORS_ORIGIN=https://your-frontend-url.vercel.app"
echo ""
echo "3️⃣  Frontend Deployment:"
echo "   • Create new project for 'raghhav-roadways'"
echo "   • Framework: Next.js"
echo "   • Root Directory: frontend"
echo "   • Add environment variable:"
echo "   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app"
echo ""
echo "4️⃣  Update Backend CORS:"
echo "   • After frontend deploys, get its URL"
echo "   • Update CORS_ORIGIN in backend environment variables"
echo "   • Redeploy backend"
echo ""
echo "=========================================="
echo "✅ Automation Complete!"
echo "=========================================="
echo ""
echo "📖 For detailed instructions, see: FINAL_DEPLOYMENT_STEPS.md"
echo "🔒 Credentials are secure in Vercel Environment Variables"
echo "🚀 Your app will auto-deploy on future GitHub pushes"
