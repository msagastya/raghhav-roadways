#!/usr/bin/env node

/**
 * ============================================================================
 * Raghhav Roadways - Automated Deployment Script (Node.js)
 * ============================================================================
 * Usage: node deploy.js [options]
 *
 * Options:
 *   --push         Push code to git (default: true)
 *   --skip-push    Skip git push step
 *   --test         Run tests after deployment
 *   --ci           Run in CI/CD mode (non-interactive)
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  project: 'raghhav-roadways',
  backend: 'raghhav-roadways',
  frontend: 'raghhav-roadways-frontend',
  database: {
    url: 'postgresql://app_user:RaghhavRoadways%402026%23Secure%24Connection@db.uelwxwrklqrrlonxtpmq.supabase.co:5432/postgres',
    host: 'db.uelwxwrklqrrlonxtpmq.supabase.co',
    user: 'app_user',
  },
  jwt: {
    secret: 'fca8298b28a0acc80edf273519e118a7a9b313c1fc1a0421facb44d4f764f19c',
    refreshSecret: '96bc8433c9b37aff8e490d0e79081f72a1a48ce8f2563209805cb840530aaa65',
  },
  vercel: {
    backendUrl: 'https://raghhav-roadways.onrender.com',
    frontendUrl: 'https://raghhav-roadways.vercel.app',
  },
};

// ============================================================================
// COLORS
// ============================================================================

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// ============================================================================
// UTILITIES
// ============================================================================

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logStep(title) {
  console.log('');
  log('━'.repeat(70), 'blue');
  log(`✓ ${title}`, 'green');
  log('━'.repeat(70), 'blue');
  console.log('');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠  ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ  ${message}`, 'cyan');
}

function exec(command, options = {}) {
  try {
    const output = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
      ...options,
    });
    return output.trim();
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ============================================================================
// STEP 1: VERIFY PREREQUISITES
// ============================================================================

function verifyPrerequisites() {
  logStep('STEP 1: Verifying Prerequisites');

  // Check git
  try {
    exec('git --version');
    logSuccess('Git is installed');
  } catch {
    logError('Git is not installed');
    process.exit(1);
  }

  // Check if in git repo
  try {
    exec('git rev-parse --git-dir');
    logSuccess('Git repository detected');
  } catch {
    logError('Not in a git repository');
    process.exit(1);
  }

  // Check backend .env
  if (!fileExists('backend/.env')) {
    logError('backend/.env not found');
    process.exit(1);
  }
  logSuccess('backend/.env exists');

  // Check/create frontend .env.local
  if (!fileExists('frontend/.env.local')) {
    logWarning('frontend/.env.local not found - will create it');
  } else {
    logSuccess('frontend/.env.local exists');
  }

  // Check git status
  try {
    const status = exec('git status --porcelain');
    if (status) {
      logWarning('Uncommitted changes detected - will commit them');
    } else {
      logSuccess('Working tree is clean');
    }
  } catch (error) {
    logWarning('Could not check git status');
  }
}

// ============================================================================
// STEP 2: CONFIGURE FRONTEND ENVIRONMENT
// ============================================================================

function configureFrontendEnv() {
  logStep('STEP 2: Configuring Frontend Environment');

  const envPath = 'frontend/.env.local';
  const envContent = `NEXT_PUBLIC_API_URL=${CONFIG.vercel.backendUrl}/api/v1
NEXT_PUBLIC_SOCKET_URL=${CONFIG.vercel.backendUrl}
`;

  writeFile(envPath, envContent);
  logSuccess(`Frontend environment configured at ${envPath}`);
  logInfo(`API URL: ${CONFIG.vercel.backendUrl}/api/v1`);
  logInfo(`Socket URL: ${CONFIG.vercel.backendUrl}`);
}

// ============================================================================
// STEP 3: GIT PUSH
// ============================================================================

function gitPush() {
  logStep('STEP 3: Pushing Code to GitHub');

  try {
    // Stage changes
    logInfo('Staging changes...');
    exec('git add .');

    // Check if there are changes to commit
    const hasChanges = exec('git diff --cached --quiet', { ignoreError: true }) === null;

    if (hasChanges) {
      // Commit
      const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const commitMessage = `Deploy: Raghhav Roadways Phase 7 Complete - ${timestamp}`;
      logInfo('Committing changes...');
      exec(`git commit -m "${commitMessage}"`);
      logSuccess('Changes committed');

      // Push
      logInfo('Pushing to master branch...');
      exec('git push origin master');
      logSuccess('Code pushed to GitHub');
      logInfo('Vercel will auto-deploy the backend now...');
    } else {
      logWarning('No changes to commit - skipping git operations');
    }
  } catch (error) {
    logError(`Git push failed: ${error.message}`);
    logInfo('Push manually with: git push origin master');
    throw error;
  }
}

// ============================================================================
// STEP 4: DISPLAY ENVIRONMENT VARIABLES
// ============================================================================

function displayEnvVars() {
  logStep('STEP 4: Environment Variables for Vercel');

  console.log('Add these 25 variables in Vercel Dashboard:');
  console.log('Backend Project → Settings → Environment Variables\n');

  const envVars = {
    'DATABASE CONFIGURATION': {
      DATABASE_URL: CONFIG.database.url,
      NODE_ENV: 'production',
      PORT: '3000',
    },
    'AUTHENTICATION': {
      JWT_SECRET: CONFIG.jwt.secret,
      JWT_REFRESH_SECRET: CONFIG.jwt.refreshSecret,
      JWT_EXPIRES_IN: '7d',
      JWT_REFRESH_EXPIRES_IN: '30d',
    },
    'CORS & NETWORK': {
      CORS_ORIGIN: 'https://raghhav-roadways.vercel.app',
    },
    'FILE UPLOAD & PAGINATION': {
      MAX_FILE_SIZE: '10485760',
      STORAGE_PATH: './storage',
      DEFAULT_PAGE_SIZE: '10',
      MAX_PAGE_SIZE: '100',
    },
    'OPTIONAL SERVICES': {
      SENTRY_DSN: '(leave empty)',
      RESEND_API_KEY: '(leave empty)',
      EMAIL_FROM: 'noreply@raghhavroadways.com',
    },
    'COMPANY DETAILS': {
      COMPANY_NAME: 'Raghhav Roadways',
      COMPANY_GSTIN: '27AABCT1234C1Z0',
      COMPANY_ADDRESS: '123 Transport Hub, Delhi, India',
      COMPANY_PHONE: '9876543210',
      COMPANY_EMAIL: 'info@raghhavroadways.com',
      COMPANY_BANK_NAME: 'HDFC Bank',
      COMPANY_BANK_ACCOUNT: '1234567890123456',
      COMPANY_BANK_IFSC: 'HDFC0001234',
      COMPANY_BANK_BRANCH: 'New Delhi',
    },
  };

  for (const [category, vars] of Object.entries(envVars)) {
    log(`\n📌 ${category}`, 'cyan');
    log('─'.repeat(70), 'blue');
    for (const [key, value] of Object.entries(vars)) {
      console.log(`  ${key}: ${value}`);
    }
  }

  console.log('\n');
  log('═'.repeat(70), 'blue');
  log('After adding all variables, click "Redeploy" in Vercel', 'yellow');
  log('═'.repeat(70), 'blue');
}

// ============================================================================
// STEP 5: DISPLAY TEST COMMANDS
// ============================================================================

function displayTestCommands() {
  logStep('STEP 5: Test Commands');

  console.log('Once Vercel deployment completes, test with:\n');

  log('🏥 Health Check:', 'cyan');
  console.log(`  curl ${CONFIG.vercel.backendUrl}/health\n`);

  log('🖥️  Frontend:', 'cyan');
  console.log(`  curl ${CONFIG.vercel.frontendUrl}\n`);

  log('🔐 Admin Login:', 'cyan');
  console.log(`  Open: ${CONFIG.vercel.frontendUrl}/admin/login`);
  console.log(`  Email: admin@raghhavroadways.com\n`);
}

// ============================================================================
// STEP 6: SUMMARY
// ============================================================================

function displaySummary() {
  logStep('DEPLOYMENT SUMMARY');

  logSuccess('Code pushed to GitHub');
  logWarning('Vercel auto-deployment started (1-2 minutes)');
  console.log('');
  logInfo('Next Steps:');
  console.log('  1. Add 25 environment variables in Vercel backend settings');
  console.log('  2. Click "Redeploy" after adding env vars');
  console.log('  3. Test health endpoint: curl ' + CONFIG.vercel.backendUrl + '/health');
  console.log('  4. Update CORS_ORIGIN with actual frontend URL');
  console.log('  5. Redeploy backend again');
  console.log('  6. Verify admin login works');
  console.log('');
  logInfo(`Dashboard: https://vercel.com/dashboard`);
  logInfo(`Backend: ${CONFIG.backend}`);
  logInfo(`Frontend: ${CONFIG.frontend}`);
  console.log('');
  logSuccess('Estimated total time: 20-30 minutes');
  console.log('');
  log('🚀 Production deployment is underway!', 'green');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    log('╔' + '═'.repeat(68) + '╗', 'blue');
    log('║  Raghhav Roadways - Automated Deployment Script (Node.js)' + ' '.repeat(8) + '║', 'blue');
    log('╚' + '═'.repeat(68) + '╝', 'blue');

    verifyPrerequisites();
    configureFrontendEnv();
    gitPush();
    displayEnvVars();
    displayTestCommands();
    displaySummary();

    process.exit(0);
  } catch (error) {
    console.error('');
    logError('Deployment script failed');
    console.error(error.message);
    process.exit(1);
  }
}

// ============================================================================
// RUN
// ============================================================================

if (require.main === module) {
  main();
}

module.exports = { CONFIG, log, exec };
