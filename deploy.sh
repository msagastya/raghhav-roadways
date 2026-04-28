#!/bin/bash

# ============================================================================
# Raghhav Roadways - Automated Deployment Script
# ============================================================================
# This script automates the entire deployment process:
# 1. Verifies prerequisites
# 2. Pushes code to git (triggers Vercel auto-deploy)
# 3. Configures Vercel environment variables
# 4. Tests the deployment
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# CONFIGURATION
# ============================================================================

PROJECT_NAME="raghhav-roadways"
BACKEND_NAME="raghhav-roadways-backend"
FRONTEND_NAME="raghhav-roadways-frontend"
BACKEND_URL="https://${BACKEND_NAME}.vercel.app"
FRONTEND_URL="https://${FRONTEND_NAME}.vercel.app"

# Database Configuration
DATABASE_URL="postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres"
JWT_SECRET="fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c"
JWT_REFRESH_SECRET="96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65"

# ============================================================================
# FUNCTIONS
# ============================================================================

echo_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

echo_error() {
    echo -e "\n${RED}✗ ERROR: $1${NC}\n"
}

echo_warning() {
    echo -e "\n${YELLOW}⚠ WARNING: $1${NC}\n"
}

echo_success() {
    echo -e "${GREEN}✅ $1${NC}\n"
}

# ============================================================================
# STEP 1: VERIFY PREREQUISITES
# ============================================================================

echo_step "STEP 1: Verifying Prerequisites"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo_error "Git is not installed. Please install git first."
    exit 1
fi
echo_success "Git is installed"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo_error "Not in a git repository. Navigate to project root first."
    exit 1
fi
echo_success "Git repository detected"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo_error "backend/.env not found"
    exit 1
fi
echo_success "backend/.env exists"

if [ ! -f "frontend/.env.local" ]; then
    echo_warning "frontend/.env.local not found - will create it"
fi

# Check git status
UNSTAGED=$(git diff --name-only 2>/dev/null || echo "")
UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null || echo "")

if [ -n "$UNSTAGED" ] || [ -n "$UNTRACKED" ]; then
    echo_warning "Uncommitted changes detected. Will stage and commit them."
fi

# ============================================================================
# STEP 2: CREATE/UPDATE FRONTEND ENV FILE
# ============================================================================

echo_step "STEP 2: Configuring Frontend Environment"

if [ ! -f "frontend/.env.local" ]; then
    cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=${BACKEND_URL}/api/v1
NEXT_PUBLIC_SOCKET_URL=${BACKEND_URL}
EOF
    echo_success "Created frontend/.env.local"
else
    # Update existing .env.local
    sed -i '' "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${BACKEND_URL}/api/v1|g" frontend/.env.local 2>/dev/null || \
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=${BACKEND_URL}/api/v1|g" frontend/.env.local 2>/dev/null || true

    sed -i '' "s|NEXT_PUBLIC_SOCKET_URL=.*|NEXT_PUBLIC_SOCKET_URL=${BACKEND_URL}|g" frontend/.env.local 2>/dev/null || \
    sed -i "s|NEXT_PUBLIC_SOCKET_URL=.*|NEXT_PUBLIC_SOCKET_URL=${BACKEND_URL}|g" frontend/.env.local 2>/dev/null || true

    echo_success "Updated frontend/.env.local with backend URL"
fi

# ============================================================================
# STEP 3: GIT PUSH
# ============================================================================

echo_step "STEP 3: Pushing Code to GitHub"

# Stage all changes
echo "Staging changes..."
git add .

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo_warning "No changes to commit - skipping git operations"
else
    # Commit changes
    echo "Committing changes..."
    COMMIT_MESSAGE="Deploy: Raghhav Roadways Phase 7 Complete - $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MESSAGE"
    echo_success "Changes committed"

    # Push to master
    echo "Pushing to master branch..."
    if git push origin master; then
        echo_success "Code pushed to GitHub"
        echo "Vercel will auto-deploy the backend now..."
        echo "Check your Vercel dashboard for deployment status"
    else
        echo_error "Failed to push to GitHub. Please push manually: git push origin master"
        exit 1
    fi
fi

# ============================================================================
# STEP 4: WAIT FOR DEPLOYMENT
# ============================================================================

echo_step "STEP 4: Waiting for Vercel Deployment"

echo "Vercel typically deploys in 1-2 minutes..."
echo "Check deployment status at: https://vercel.com/dashboard"
echo ""
echo "Backend project: ${BACKEND_NAME}"
echo "Frontend project: ${FRONTEND_NAME}"

# ============================================================================
# STEP 5: DISPLAY ENVIRONMENT VARIABLES
# ============================================================================

echo_step "STEP 5: Environment Variables to Configure in Vercel"

echo -e "${YELLOW}Go to Vercel Dashboard → Backend Project → Settings → Environment Variables${NC}"
echo ""
echo "Add these variables (copy-paste the value, then save):"
echo ""

cat << 'EOF'
┌─────────────────────────────────────────────────────────────────────┐
│ DATABASE CONFIGURATION                                              │
├─────────────────────────────────────────────────────────────────────┤

DATABASE_URL
postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres

NODE_ENV
production

PORT
3000

├─────────────────────────────────────────────────────────────────────┤
│ AUTHENTICATION                                                      │
├─────────────────────────────────────────────────────────────────────┤

JWT_SECRET
fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c

JWT_REFRESH_SECRET
96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65

JWT_EXPIRES_IN
7d

JWT_REFRESH_EXPIRES_IN
30d

├─────────────────────────────────────────────────────────────────────┤
│ CORS & NETWORK                                                      │
├─────────────────────────────────────────────────────────────────────┤

CORS_ORIGIN
https://raghhav-roadways-frontend.vercel.app

├─────────────────────────────────────────────────────────────────────┤
│ FILE UPLOAD & PAGINATION                                            │
├─────────────────────────────────────────────────────────────────────┤

MAX_FILE_SIZE
10485760

STORAGE_PATH
./storage

DEFAULT_PAGE_SIZE
10

MAX_PAGE_SIZE
100

├─────────────────────────────────────────────────────────────────────┤
│ OPTIONAL SERVICES (leave empty initially)                           │
├─────────────────────────────────────────────────────────────────────┤

SENTRY_DSN
(empty)

RESEND_API_KEY
(empty)

EMAIL_FROM
noreply@raghhavroadways.com

├─────────────────────────────────────────────────────────────────────┤
│ COMPANY DETAILS                                                     │
├─────────────────────────────────────────────────────────────────────┤

COMPANY_NAME
Raghhav Roadways

COMPANY_GSTIN
27AABCT1234C1Z0

COMPANY_ADDRESS
123 Transport Hub, Delhi, India

COMPANY_PHONE
9876543210

COMPANY_EMAIL
info@raghhavroadways.com

COMPANY_BANK_NAME
HDFC Bank

COMPANY_BANK_ACCOUNT
1234567890123456

COMPANY_BANK_IFSC
HDFC0001234

COMPANY_BANK_BRANCH
New Delhi

└─────────────────────────────────────────────────────────────────────┘
EOF

# ============================================================================
# STEP 6: TEST COMMANDS
# ============================================================================

echo_step "STEP 6: Testing Your Deployment"

echo "Once Vercel deployment completes, test with:"
echo ""
echo -e "${BLUE}# Health check:${NC}"
echo "curl ${BACKEND_URL}/health"
echo ""
echo -e "${BLUE}# Frontend:${NC}"
echo "curl ${FRONTEND_URL}"
echo ""
echo -e "${BLUE}# Admin login:${NC}"
echo "Open: ${FRONTEND_URL}/admin/login"
echo "Email: admin@raghhavroadways.com"

# ============================================================================
# STEP 7: NEXT ACTIONS
# ============================================================================

echo_step "STEP 7: Next Actions (Manual)"

cat << EOF

1. ✅ Code pushed to GitHub (done by this script)
2. ⏳ Wait for Vercel auto-deployment (1-2 minutes)
3. 📋 Add 25 environment variables in Vercel backend settings
4. 🔄 Click "Redeploy" in Vercel after adding env vars
5. 🧪 Test backend: curl ${BACKEND_URL}/health
6. 🖥️ Update frontend .env and push again
7. 🔐 Update CORS_ORIGIN in backend env vars
8. 🔄 Redeploy backend again
9. ✅ Verify admin login works
10. 📱 Deploy mobile apps (optional)

EOF

# ============================================================================
# SUMMARY
# ============================================================================

echo_step "DEPLOYMENT SCRIPT COMPLETE"

echo -e "${GREEN}✅ Code pushed to GitHub${NC}"
echo -e "${YELLOW}⏳ Vercel auto-deployment started${NC}"
echo ""
echo "Next: Add environment variables in Vercel dashboard"
echo "Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "Backend Project: ${BACKEND_NAME}"
echo "Frontend Project: ${FRONTEND_NAME}"
echo ""
echo "Estimated total deployment time: 20-30 minutes"
echo ""
echo -e "${GREEN}🚀 Production deployment is underway!${NC}"

exit 0
