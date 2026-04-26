const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * @route   GET /api/v1/reports/dashboard
 * @desc    Get dashboard summary
 * @access  Private
 */
router.get(
  '/dashboard',
  authenticateToken,
  checkPermission('report.daily'),
  reportController.getDashboardSummary
);

/**
 * @route   GET /api/v1/reports/daily
 * @desc    Get daily report
 * @access  Private
 */
router.get(
  '/daily',
  authenticateToken,
  checkPermission('report.daily'),
  reportController.getDailyReport
);

/**
 * @route   GET /api/v1/reports/monthly-statement
 * @desc    Get monthly statement (party-wise)
 * @access  Private
 */
router.get(
  '/monthly-statement',
  authenticateToken,
  checkPermission('report.monthly'),
  reportController.getMonthlyStatement
);

/**
 * @route   GET /api/v1/reports/vehicle-settlement
 * @desc    Get vehicle owner settlement sheet
 * @access  Private
 */
router.get(
  '/vehicle-settlement',
  authenticateToken,
  checkPermission('report.monthly'),
  reportController.getVehicleSettlement
);

module.exports = router;
