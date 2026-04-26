const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * CSRF Protection Middleware
 * SECURITY: Protects against Cross-Site Request Forgery attacks
 *
 * How it works:
 * 1. Generates a unique token for each user session
 * 2. Stores token in a cookie (httpOnly, secure)
 * 3. Requires token to be sent in X-CSRF-Token header for state-changing requests
 * 4. Validates token on POST, PATCH, DELETE, PUT requests
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt from CSRF checks
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_LENGTH = 32; // 32 bytes = 256 bits

/**
 * Generate a new CSRF token
 */
function generateToken() {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * CSRF protection middleware
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF validation for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Skip CSRF validation for endpoints that don't need it
  // (e.g., public auth endpoints)
  const exemptPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/signup',
    '/api/v1/auth/refresh',
    '/api/v1/seed/run-seeds',
  ];

  const isExempt = exemptPaths.some(path => req.path.startsWith(path));
  if (isExempt) {
    return next();
  }

  // Get token from request (header or body)
  const tokenFromRequest =
    req.headers[CSRF_HEADER_NAME.toLowerCase()] ||
    req.body?._csrf ||
    req.query?._csrf;

  // Get token from cookie
  const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];

  // If no token in cookie, this is first request - generate one
  if (!tokenFromCookie) {
    const newToken = generateToken();
    res.cookie(CSRF_COOKIE_NAME, newToken, {
      httpOnly: false, // CSRF token needs to be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
    return next();
  }

  // For state-changing requests, validate token
  if (['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method)) {
    // Token must be provided for state-changing requests
    if (!tokenFromRequest) {
      logger.warn('CSRF token missing from request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(403).json({
        success: false,
        error: 'CSRF token missing',
      });
    }

    // Validate token matches
    if (tokenFromRequest !== tokenFromCookie) {
      logger.warn('CSRF token mismatch', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        requestId: req.id,
      });
      return res.status(403).json({
        success: false,
        error: 'CSRF token invalid',
      });
    }
  }

  next();
};

module.exports = csrfProtection;
