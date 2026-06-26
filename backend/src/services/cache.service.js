const NodeCache = require('node-cache');
const logger = require('../utils/logger');

// Create a new cache instance
// stdTTL: standard time to live in seconds (5 minutes)
// checkperiod: period in seconds used for the automatic delete check interval
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class CacheService {
  /**
   * Get value from cache
   * @param {string} key 
   * @returns {*} Cached value or undefined
   */
  get(key) {
    const value = cache.get(key);
    if (value !== undefined) {
      logger.debug(`[CACHE HIT] Key: ${key}`);
    } else {
      logger.debug(`[CACHE MISS] Key: ${key}`);
    }
    return value;
  }

  /**
   * Set value in cache
   * @param {string} key 
   * @param {*} value 
   * @param {number} ttl Time to live in seconds (optional)
   */
  set(key, value, ttl = 300) {
    logger.debug(`[CACHE SET] Key: ${key} (TTL: ${ttl}s)`);
    return cache.set(key, value, ttl);
  }

  /**
   * Delete value from cache
   * @param {string} key 
   */
  del(key) {
    logger.debug(`[CACHE DEL] Key: ${key}`);
    return cache.del(key);
  }

  /**
   * Flush all data from cache
   */
  flush() {
    logger.debug(`[CACHE FLUSH] All keys cleared`);
    return cache.flushAll();
  }

  /**
   * Helper to cache an async operation
   * @param {string} key 
   * @param {Function} fetchFunction Async function to fetch data if cache miss
   * @param {number} ttl Time to live in seconds
   */
  async getOrSet(key, fetchFunction, ttl = 300) {
    const cachedData = this.get(key);
    if (cachedData !== undefined) {
      return cachedData;
    }

    const data = await fetchFunction();
    this.set(key, data, ttl);
    return data;
  }
}

module.exports = new CacheService();
