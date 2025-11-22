const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Don't clone objects for better performance
  deleteOnExpire: true
});

// Cache keys constants
const CACHE_KEYS = {
  DASHBOARD_SUMMARY: 'dashboard_summary',
  STATES_LIST: 'states_list',
  CITIES_LIST: 'cities_list',
  PARTIES_LIST: 'parties_list',
  VEHICLES_LIST: 'vehicles_list',
  PERMISSIONS_LIST: 'permissions_list',
  ROLES_LIST: 'roles_list'
};

// Cache TTL constants (in seconds)
const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  EXTRA_LONG: 3600 // 1 hour
};

/**
 * Get cached data or fetch from source
 * @param {string} key - Cache key
 * @param {Function} fetchFunction - Function to fetch data if not cached
 * @param {number} ttl - Time to live in seconds
 */
const getOrSet = async (key, fetchFunction, ttl = CACHE_TTL.MEDIUM) => {
  const cached = cache.get(key);
  if (cached !== undefined) {
    logger.debug(`Cache hit for key: ${key}`);
    return cached;
  }

  logger.debug(`Cache miss for key: ${key}`);
  const data = await fetchFunction();
  cache.set(key, data, ttl);
  return data;
};

/**
 * Invalidate cache by key pattern
 * @param {string} pattern - Pattern to match keys (e.g., 'parties_*')
 */
const invalidateByPattern = (pattern) => {
  const keys = cache.keys();
  const regex = new RegExp(pattern.replace('*', '.*'));

  keys.forEach(key => {
    if (regex.test(key)) {
      cache.del(key);
      logger.debug(`Invalidated cache key: ${key}`);
    }
  });
};

/**
 * Invalidate specific cache key
 * @param {string} key - Cache key to invalidate
 */
const invalidate = (key) => {
  cache.del(key);
  logger.debug(`Invalidated cache key: ${key}`);
};

/**
 * Clear all cache
 */
const clearAll = () => {
  cache.flushAll();
  logger.info('All cache cleared');
};

/**
 * Express middleware for caching responses
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `route_${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached) {
      logger.debug(`Serving cached response for: ${req.originalUrl}`);
      return res.json(cached);
    }

    // Store original json function
    const originalJson = res.json.bind(res);

    // Override json function to cache response
    res.json = (data) => {
      if (res.statusCode === 200 && data.success !== false) {
        cache.set(key, data, ttl);
        logger.debug(`Cached response for: ${req.originalUrl}`);
      }
      return originalJson(data);
    };

    next();
  };
};

/**
 * Get cache statistics
 */
const getStats = () => {
  return cache.getStats();
};

module.exports = {
  cache,
  CACHE_KEYS,
  CACHE_TTL,
  getOrSet,
  invalidate,
  invalidateByPattern,
  clearAll,
  cacheMiddleware,
  getStats
};
