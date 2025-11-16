const userService = require('../services/user.service');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all users
 * GET /api/v1/users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { approvalStatus, isActive, limit } = req.query;

  const users = await userService.getAllUsers({
    approvalStatus,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    limit,
  });

  res.status(200).json({
    success: true,
    data: {
      users: users,
      total: users.length,
    },
  });
});

/**
 * Update user approval status
 * PUT /api/v1/users/:id/approval
 */
const updateApprovalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const user = await userService.updateApprovalStatus(id, status);

  logger.info(`User ${user.username} approval status updated to ${status}`);

  res.status(200).json({
    success: true,
    message: `User ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
    data: user,
  });
});

/**
 * Update user role
 * PUT /api/v1/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;

  const user = await userService.updateUserRole(id, roleId);

  logger.info(`User ${user.username} role updated`);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user,
  });
});

/**
 * Get all permissions
 * GET /api/v1/permissions
 */
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await userService.getAllPermissions();

  res.status(200).json({
    success: true,
    data: permissions,
  });
});

/**
 * Get all roles
 * GET /api/v1/roles
 */
const getAllRoles = asyncHandler(async (req, res) => {
  const roles = await userService.getAllRoles();

  res.status(200).json({
    success: true,
    data: roles,
  });
});

/**
 * Get role with permissions
 * GET /api/v1/roles/:id
 */
const getRoleWithPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const role = await userService.getRoleWithPermissions(id);

  res.status(200).json({
    success: true,
    data: role,
  });
});

/**
 * Update role permissions
 * PUT /api/v1/roles/:id/permissions
 */
const updateRolePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  const role = await userService.updateRolePermissions(id, permissionIds);

  logger.info(`Role ${role.roleName} permissions updated`);

  res.status(200).json({
    success: true,
    message: 'Role permissions updated successfully',
    data: role,
  });
});

/**
 * Delete user
 * DELETE /api/v1/users/:id
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await userService.deleteUser(id);

  logger.info(`User deleted: ${id}`);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

module.exports = {
  getAllUsers,
  updateApprovalStatus,
  updateUserRole,
  getAllPermissions,
  getAllRoles,
  getRoleWithPermissions,
  updateRolePermissions,
  deleteUser,
};
