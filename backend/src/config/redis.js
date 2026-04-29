// Upstash Redis client — used for JWT blacklist and distributed rate limiting
// Free tier: 10,000 commands/day at upstash.com (no credit card required)
// If UPSTASH_REDIS_REST_URL is not set, all operations silently no-op (graceful degradation)

let redis = null;

function getRedis() {
  if (redis) return redis;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  try {
    const { Redis } = require('@upstash/redis');
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch {
    // @upstash/redis not installed yet — install it when setting up Upstash
    redis = null;
  }

  return redis;
}

async function blacklistToken(jti, ttlSeconds) {
  const r = getRedis();
  if (!r || !jti) return;
  try {
    await r.set(`bl:${jti}`, '1', { ex: ttlSeconds });
  } catch { /* silent — blacklist failure should not break logout */ }
}

async function isTokenBlacklisted(jti) {
  const r = getRedis();
  if (!r || !jti) return false;
  try {
    return !!(await r.get(`bl:${jti}`));
  } catch {
    return false;
  }
}

module.exports = { getRedis, blacklistToken, isTokenBlacklisted };
