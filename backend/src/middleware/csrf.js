const { doubleCsrf } = require('csrf-csrf');
const logger = require('../utils/logger');

// CSRF Protection Configuration
const {
  generateToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || process.env.JWT_SECRET,
  cookieName: '__Host-csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Middleware to set CSRF token in response header
const setCsrfToken = (req, res, next) => {
  const token = generateToken(req, res);
  res.setHeader('X-CSRF-Token', token);
  next();
};

// Error handler for CSRF errors
const csrfErrorHandler = (err, req, res, next) => {
  if (err === invalidCsrfTokenError) {
    logger.warn(`CSRF token validation failed for ${req.method} ${req.path} from ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      error: 'CSRF_TOKEN_INVALID',
    });
  }
  next(err);
};

module.exports = {
  generateToken,
  doubleCsrfProtection,
  setCsrfToken,
  csrfErrorHandler,
};
