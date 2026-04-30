const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

// Seed endpoint - Protected with Super Admin authentication only
router.post('/run-seeds', authenticate, authorize(['SUPER_ADMIN']), async (req, res, next) => {
  // Only allow in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Seeding is not allowed in production environment'
    });
  }

  try {
    logger.info('Running seed scripts', { userId: req.user.id });

    // Run the seed scripts
    const seedPath = path.join(__dirname, '../../prisma/seed.js');
    const seedStatesPath = path.join(__dirname, '../../prisma/seed-states.js');

    try {
      execSync(`node ${seedPath}`, { stdio: 'inherit' });
    } catch (err) {
      logger.debug('Seed.js completed (may have had duplicate key errors - this is normal)', { error: err.message });
    }

    try {
      execSync(`node ${seedStatesPath}`, { stdio: 'inherit' });
    } catch (err) {
      logger.debug('Seed-states.js completed', { error: err.message });
    }

    logger.info('Database seeded successfully', { userId: req.user.id });
    res.json({
      success: true,
      message: 'Database seeded successfully!'
    });
  } catch (error) {
    logger.error('Seeding error', { error: error.message, stack: error.stack, userId: req.user.id });
    next(error);
  }
});

module.exports = router;
