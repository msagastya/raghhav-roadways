const logger = require('./logger');

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   * @param {number} ttlMs - TTL in milliseconds (default 5 minutes)
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {any|null} - Cache value or null if not found/expired
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete specific cache key
   * @param {string} key 
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix (e.g. 'party_*')
   * @param {string} prefix 
   */
  invalidatePrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      logger.info(`Invalidated ${count} cache keys matching prefix: "${prefix}"`);
    }
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.store.clear();
    logger.info('Cache cleared completely');
  }
}

// Export singleton instance
module.exports = new MemoryCache();
