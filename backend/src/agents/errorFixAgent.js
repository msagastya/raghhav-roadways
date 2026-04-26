const { analyzeError } = require('./claudeAgent');

// Map error to a category — drives whether we call Claude and at what cost tier
function classifyError(err) {
  const status = err.statusCode || 500;

  if (err.code === 'P2002') return 'DB_CONSTRAINT'; // Prisma unique violation
  if (err.code === 'P2003') return 'DB_CONSTRAINT'; // Prisma FK violation
  if (err.code === 'P2025') return 'NOT_FOUND';     // Prisma record not found

  if (status === 400 || err.name === 'ValidationError') return 'VALIDATION';
  if (status === 401 || status === 403) return 'AUTH';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMIT';

  const msg = err.message?.toLowerCase() || '';
  if (msg.includes('email') || msg.includes('resend') || msg.includes('smtp')) return 'EXTERNAL';
  if (msg.includes('pdf') || msg.includes('puppeteer') || msg.includes('chromium')) return 'EXTERNAL';

  if (status >= 500) return 'CODE_BUG';

  return 'UNKNOWN';
}

// Skip Claude for trivial/expected errors — no API key = no call, auth/404 = no value
function shouldAnalyze(errorType) {
  if (!process.env.ANTHROPIC_API_KEY) return false;
  if (errorType === 'AUTH') return false;
  if (errorType === 'NOT_FOUND') return false;
  if (errorType === 'RATE_LIMIT') return false;
  return true;
}

async function processError(err, req) {
  const errorType = classifyError(err);

  if (!shouldAnalyze(errorType)) {
    return { errorType, aiEnhanced: false };
  }

  const errorContext = {
    errorType,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode || 500,
    endpoint: `${req.method} ${req.path}`,
    // Only include body for mutation requests, and strip sensitive fields
    ...(req.method !== 'GET' && req.body && {
      body: sanitizeBody(req.body),
    }),
  };

  // Haiku for everything — fast and cheap ($1/$5 per 1M tokens)
  // Prompt caching on the system prompt saves ~75% after first call
  const analysis = await analyzeError(errorContext, 'claude-haiku-4-5');

  return {
    errorType,
    aiEnhanced: !!analysis,
    analysis,
  };
}

function sanitizeBody(body) {
  const safe = { ...body };
  // Strip secrets from context sent to Claude
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth', 'pin', 'cvv'];
  for (const key of Object.keys(safe)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
      safe[key] = '[REDACTED]';
    }
  }
  return safe;
}

module.exports = { processError, classifyError };
