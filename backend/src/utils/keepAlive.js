const logger = require('./logger');

/**
 * Pings the server itself every 10 minutes to prevent Render free-tier from sleeping.
 * @param {string} serverUrl The URL to ping (e.g., 'https://raghhav-roadways.onrender.com/api/v1/health')
 */
function startKeepAlive(serverUrl) {
  if (!serverUrl || process.env.NODE_ENV !== 'production') {
    logger.info('Keep-alive disabled (not in production or no URL provided).');
    return;
  }

  logger.info(`Starting keep-alive ping for: ${serverUrl}`);

  // Ping every 10 minutes (600000 ms)
  setInterval(async () => {
    try {
      logger.info('Sending keep-alive ping...');
      const response = await fetch(serverUrl);
      if (response.ok) {
        logger.info('Keep-alive ping successful.');
      } else {
        logger.warn(`Keep-alive ping failed with status: ${response.status}`);
      }
    } catch (error) {
      logger.error('Keep-alive ping error:', error.message);
    }
  }, 10 * 60 * 1000);
}

module.exports = { startKeepAlive };
