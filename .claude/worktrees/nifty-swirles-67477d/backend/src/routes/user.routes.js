const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Private - Admin only
 */
router.get(
  '/',
  authenticateToken,
  authorize('settings.users'),
  userController.getAllUsers
);

/**
 * @route   PUT /api/v1/users/:id/approval
 * @desc    Approve or reject user
 * @access  Private - Admin only
 */
router.put(
  '/:id/approval',
  authenticateToken,
  authorize('settings.users'),
  userController.updateApprovalStatus
);

/**
 * @route   PUT /api/v1/users/:id/role
 * @desc    Update user role
 * @access  Private - Admin only
 */
router.put(
  '/:id/role',
  authenticateToken,
  authorize('settings.users'),
  userController.updateUserRole
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user
 * @access  Private - Admin only
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize('settings.users'),
  userController.deleteUser
);

/**
 * @route   PUT /api/v1/users/:id/reset-password
 * @desc    Reset user password (Admin only)
 * @access  Private - Admin only
 */
router.put(
  '/:id/reset-password',
  authenticateToken,
  authorize('settings.users'),
  userController.resetPassword
);

module.exports = router;
