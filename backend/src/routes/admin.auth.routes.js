const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/admin.auth.controller');
const authMiddleware = require('../middleware/auth');
const { validateAdminLogin } = require('../middleware/validators');

/**
 * @route   POST /api/v1/admin/auth/login
 * @desc    Admin login with admin_id and password
 * @access  Public
 */
router.post('/login', validateAdminLogin, adminAuthController.login);

/**
 * @route   POST /api/v1/admin/auth/refresh
 * @desc    Refresh admin access token using refresh token
 * @access  Public (no auth required, uses refresh token)
 */
router.post('/refresh', adminAuthController.refresh);

/**
 * @route   POST /api/v1/admin/auth/logout
 * @desc    Admin logout - invalidate tokens
 * @access  Private (admin only)
 */
router.post('/logout', authMiddleware.adminOnly, adminAuthController.logout);

/**
 * @route   GET /api/v1/admin/auth/me
 * @desc    Get current admin user profile
 * @access  Private (admin only)
 */
router.get('/me', authMiddleware.adminOnly, adminAuthController.getCurrentAdmin);

/**
 * @route   PATCH /api/v1/admin/auth/change-password
 * @desc    Change admin password
 * @access  Private (admin only)
 */
router.patch('/change-password', authMiddleware.adminOnly, adminAuthController.changePassword);

module.exports = router;
