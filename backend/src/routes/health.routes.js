const express = require('express');
const prisma = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/v1/health
 * Returns system health status
 */
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'connected',
        api: 'operational',
      },
      version: '1.0.0',
    };

    logger.info('Health check passed', { requestId: req.id });
    res.status(200).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed', {
      requestId: req.id,
      error: error.message,
    });

    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
      checks: {
        database: 'disconnected',
        api: 'degraded',
      },
    });
  }
});

/**
 * Ready Check Endpoint
 * GET /api/v1/ready
 * Returns true if service is ready to accept traffic
 */
router.get('/ready', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ ready: false, timestamp: new Date().toISOString() });
  }
});

module.exports = router;
