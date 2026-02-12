const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Login Rate Limiter and Account Lockout
 * SECURITY: Prevents brute force attacks by temporarily locking accounts after failed attempts
 *
 * Configuration:
 * - Max attempts: 5 failed login attempts
 * - Lockout duration: 15 minutes
 * - Uses in-memory store (can be moved to Redis for distributed systems)
 */

class LoginAttemptTracker {
  constructor() {
    this.attempts = new Map(); // userId or username -> { count, lastAttempt, lockedUntil }
    this.maxAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.attemptWindow = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Record a failed login attempt
   */
  recordFailure(identifier) {
    const now = Date.now();
    let attempt = this.attempts.get(identifier);

    if (!attempt || now - attempt.lastAttempt > this.attemptWindow) {
      // Reset if window has passed
      attempt = {
        count: 1,
        lastAttempt: now,
        lockedUntil: null,
      };
    } else {
      attempt.count += 1;
      attempt.lastAttempt = now;

      // Lock account if max attempts exceeded
      if (attempt.count >= this.maxAttempts) {
        attempt.lockedUntil = now + this.lockoutDuration;
        logger.warn('Account locked due to multiple failed login attempts', {
          identifier,
          attempts: attempt.count,
          lockedUntil: new Date(attempt.lockedUntil).toISOString(),
        });
      }
    }

    this.attempts.set(identifier, attempt);
    return attempt;
  }

  /**
   * Record a successful login and reset attempts
   */
  recordSuccess(identifier) {
    this.attempts.delete(identifier);
  }

  /**
   * Check if account is locked
   */
  isLocked(identifier) {
    const attempt = this.attempts.get(identifier);
    if (!attempt || !attempt.lockedUntil) {
      return false;
    }

    const now = Date.now();
    if (now > attempt.lockedUntil) {
      // Unlock if lockout period has passed
      this.attempts.delete(identifier);
      return false;
    }

    return true;
  }

  /**
   * Get remaining lockout time in seconds
   */
  getRemainingLockoutTime(identifier) {
    const attempt = this.attempts.get(identifier);
    if (!attempt || !attempt.lockedUntil) {
      return 0;
    }

    const remaining = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Get attempt count
   */
  getAttemptCount(identifier) {
    const attempt = this.attempts.get(identifier);
    return attempt ? attempt.count : 0;
  }
}

const tracker = new LoginAttemptTracker();

/**
 * Middleware to check if account is locked
 */
const checkAccountLockout = (req, res, next) => {
  // Only for login endpoint
  if (req.path !== '/api/v1/auth/login' || req.method !== 'POST') {
    return next();
  }

  const identifier = req.body?.username;
  if (!identifier) {
    return next();
  }

  if (tracker.isLocked(identifier)) {
    const remainingTime = tracker.getRemainingLockoutTime(identifier);
    logger.warn('Login attempt on locked account', {
      identifier,
      remainingTime,
    });

    return res.status(429).json({
      success: false,
      error: `Account temporarily locked. Try again in ${remainingTime} seconds.`,
      retryAfter: remainingTime,
    });
  }

  next();
};

/**
 * Helper function to call from auth controller after failed login
 */
function recordFailedLogin(username) {
  tracker.recordFailure(username);
}

/**
 * Helper function to call from auth controller after successful login
 */
function recordSuccessfulLogin(username) {
  tracker.recordSuccess(username);
}

module.exports = {
  checkAccountLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
  LoginAttemptTracker,
};
