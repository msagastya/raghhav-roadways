const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all users
 * @param {Object} filters
 * @returns {Array} - list of users
 */
const getAllUsers = async (filters = {}) => {
  const { approvalStatus, isActive, limit = 100 } = filters;

  const where = {};
  if (approvalStatus) where.approvalStatus = approvalStatus;
  if (isActive !== undefined) where.isActive = isActive;

  const users = await prisma.user.findMany({
    where,
    include: {
      role: true,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      mobile: true,
      isActive: true,
      approvalStatus: true,
      lastLogin: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          roleName: true,
          description: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: parseInt(limit),
  });

  return users;
};

/**
 * Approve or reject user
 * @param {number} userId
 * @param {string} status - 'approved' or 'rejected'
 * @returns {Object} - updated user
 */
const updateApprovalStatus = async (userId, status) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid approval status');
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updated = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      approvalStatus: status,
      isActive: status === 'approved',
    },
    include: {
      role: true,
    },
  });

  logger.info(`User ${user.username} ${status === 'approved' ? 'approved' : 'rejected'}`);

  return updated;
};

/**
 * Update user role
 * @param {number} userId
 * @param {number} roleId
 * @returns {Object} - updated user
 */
const updateUserRole = async (userId, roleId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const role = await prisma.role.findUnique({
    where: { id: parseInt(roleId) },
  });

  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  const updated = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { roleId: parseInt(roleId) },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  logger.info(`User ${user.username} role updated to ${role.roleName}`);

  return updated;
};

/**
 * Get all permissions
 * @returns {Array} - list of permissions
 */
const getAllPermissions = async () => {
  const permissions = await prisma.permission.findMany({
    orderBy: [
      { module: 'asc' },
      { action: 'asc' },
    ],
  });

  return permissions;
};

/**
 * Get all roles
 * @returns {Array} - list of roles
 */
const getAllRoles = async () => {
  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return roles;
};

/**
 * Get role with permissions
 * @param {number} roleId
 * @returns {Object} - role with permissions
 */
const getRoleWithPermissions = async (roleId) => {
  const role = await prisma.role.findUnique({
    where: { id: parseInt(roleId) },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  return role;
};

/**
 * Update role permissions
 * @param {number} roleId
 * @param {Array} permissionIds
 * @returns {Object} - updated role
 */
const updateRolePermissions = async (roleId, permissionIds) => {
  const role = await prisma.role.findUnique({
    where: { id: parseInt(roleId) },
  });

  if (!role) {
    throw new ApiError(404, 'Role not found');
  }

  // Delete existing permissions
  await prisma.rolePermission.deleteMany({
    where: { roleId: parseInt(roleId) },
  });

  // Add new permissions
  const rolePermissions = permissionIds.map((permissionId) => ({
    roleId: parseInt(roleId),
    permissionId: parseInt(permissionId),
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
  });

  const updated = await getRoleWithPermissions(roleId);

  logger.info(`Role ${role.roleName} permissions updated`);

  return updated;
};

/**
 * Delete user
 * @param {number} userId
 */
const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Don't allow deleting the master admin
  if (user.username === 'msagastya') {
    throw new ApiError(403, 'Cannot delete master admin user');
  }

  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });

  logger.info(`User ${user.username} deleted`);
};

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
