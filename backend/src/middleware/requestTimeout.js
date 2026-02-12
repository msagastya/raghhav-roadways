const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Request Timeout Middleware
 * SECURITY & RELIABILITY: Prevents slow client attacks and hanging connections
 *
 * Configuration:
 * - Default timeout: 30 seconds
 * - Long operations (file uploads, PDF generation): 120 seconds
 */

const DEFAULT_TIMEOUT = 30 * 1000; // 30 seconds
const LONG_TIMEOUT = 120 * 1000; // 120 seconds for file uploads

/**
 * Request timeout middleware
 */
const requestTimeout = (req, res, next) => {
  // Determine timeout based on endpoint
  const longTimeoutPaths = [
    '/api/v1/consignments',
    '/api/v1/invoices',
    '/api/v1/payments',
  ];

  const isLongOperation = longTimeoutPaths.some((path) =>
    req.path.startsWith(path) && ['POST', 'PATCH'].includes(req.method)
  );

  const timeout = isLongOperation ? LONG_TIMEOUT : DEFAULT_TIMEOUT;

  // Set request timeout
  req.setTimeout(timeout, () => {
    logger.warn('Request timeout', {
      method: req.method,
      path: req.path,
      timeout,
      requestId: req.id,
    });

    res.status(408).json({
      success: false,
      error: 'Request timeout',
    });
  });

  next();
};

module.exports = requestTimeout;
