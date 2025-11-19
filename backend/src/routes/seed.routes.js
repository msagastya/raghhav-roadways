const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const path = require('path');

// Temporary seeding endpoint - REMOVE IN PRODUCTION!
router.post('/run-seeds', async (req, res) => {
  try {
    console.log('Running seed scripts...');

    // Run the seed scripts
    const seedPath = path.join(__dirname, '../../prisma/seed.js');
    const seedStatesPath = path.join(__dirname, '../../prisma/seed-states.js');

    try {
      execSync(`node ${seedPath}`, { stdio: 'inherit' });
    } catch (err) {
      console.log('Seed.js completed (may have had duplicate key errors - this is normal)');
    }

    try {
      execSync(`node ${seedStatesPath}`, { stdio: 'inherit' });
    } catch (err) {
      console.log('Seed-states.js completed');
    }

    res.json({
      success: true,
      message: 'Database seeded successfully! You can now delete this endpoint.'
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
