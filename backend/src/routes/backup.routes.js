const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const { authenticateToken } = require('../middleware/auth');
const { isSuperAdmin } = require('../middleware/permissions');

// All backup routes require Super Admin access

/**
 * @route   POST /api/v1/backup/export
 * @desc    Export all data as JSON backup
 * @access  Super Admin only
 */
router.post('/export', authenticateToken, isSuperAdmin, backupController.exportAllData);

/**
 * @route   GET /api/v1/backup/list
 * @desc    List all available backups
 * @access  Super Admin only
 */
router.get('/list', authenticateToken, isSuperAdmin, backupController.listBackups);

/**
 * @route   GET /api/v1/backup/download/:filename
 * @desc    Download a specific backup file
 * @access  Super Admin only
 */
router.get('/download/:filename', authenticateToken, isSuperAdmin, backupController.downloadBackup);

/**
 * @route   DELETE /api/v1/backup/:filename
 * @desc    Delete a specific backup file
 * @access  Super Admin only
 */
router.delete('/:filename', authenticateToken, isSuperAdmin, backupController.deleteBackup);

/**
 * @route   GET /api/v1/backup/stats
 * @desc    Get database statistics
 * @access  Super Admin only
 */
router.get('/stats', authenticateToken, isSuperAdmin, backupController.getDatabaseStats);

/**
 * @route   POST /api/v1/backup/clean
 * @desc    Clean old backups (keep last N)
 * @access  Super Admin only
 */
router.post('/clean', authenticateToken, isSuperAdmin, backupController.cleanOldBackups);

module.exports = router;
