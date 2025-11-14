const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/v1/permissions
 * @desc    Get all permissions
 * @access  Private - Admin only
 */
router.get(
  '/',
  authenticateToken,
  authorize('settings.roles'),
  userController.getAllPermissions
);

/**
 * @route   GET /api/v1/roles
 * @desc    Get all roles
 * @access  Private - Admin only
 */
router.get(
  '/roles',
  authenticateToken,
  authorize('settings.roles'),
  userController.getAllRoles
);

/**
 * @route   GET /api/v1/roles/:id
 * @desc    Get role with permissions
 * @access  Private - Admin only
 */
router.get(
  '/roles/:id',
  authenticateToken,
  authorize('settings.roles'),
  userController.getRoleWithPermissions
);

/**
 * @route   PUT /api/v1/roles/:id/permissions
 * @desc    Update role permissions
 * @access  Private - Admin only
 */
router.put(
  '/roles/:id/permissions',
  authenticateToken,
  authorize('settings.roles'),
  userController.updateRolePermissions
);

module.exports = router;
