const xss = require('xss');

/**
 * Input Sanitization Middleware
 * SECURITY: Removes potentially malicious HTML/JavaScript from inputs
 *
 * This prevents stored XSS attacks where user input is saved to database
 * and displayed to other users
 */

const allowedTags = []; // No HTML tags allowed in most fields
const allowedAttributes = [];

const xssOptions = {
  whiteList: {}, // Empty whitelist - strip all HTML
  stripIgnoredTag: true,
  stripLeadingAndTrailingWhitespace: true,
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => {
      if (typeof item === 'string') {
        return xss(item, xssOptions);
      } else if (typeof item === 'object') {
        return sanitizeObject(item);
      }
      return item;
    });
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = xss(value, xssOptions);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

/**
 * Middleware to sanitize request body and query
 */
const inputSanitization = (req, res, next) => {
  // Sanitize body
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

module.exports = inputSanitization;
