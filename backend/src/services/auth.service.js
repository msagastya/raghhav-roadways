const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Login user
 * @param {string} username
 * @param {string} password
 * @returns {Object} - tokens and user info
 */
const login = async (username, password) => {
  // Find user with role and permissions
  const user = await prisma.user.findUnique({
    where: { username },
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

  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Your account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Extract permissions
  const permissions = user.role.rolePermissions.map(
    (rp) => rp.permission.permissionCode
  );

  // Create token payload
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: user.role.roleName,
  };

  // Generate tokens
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  logger.info(`User ${username} logged in successfully`);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      mobile: user.mobile,
      role: user.role.roleName,
      permissions,
    },
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken
 * @returns {Object} - new tokens
 */
const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken } = require('../config/jwt');

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Get user to verify still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
      },
    });

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    // Create new token payload
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: user.role.roleName,
    };

    // Generate new tokens
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

/**
 * Get user by ID
 * @param {number} userId
 * @returns {Object} - user details
 */
const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      mobile: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      role: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const permissions = user.role.rolePermissions.map(
    (rp) => rp.permission.permissionCode
  );

  return {
    ...user,
    roleName: user.role.roleName,
    permissions,
  };
};

/**
 * Change password
 * @param {number} userId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  });

  logger.info(`User ${user.username} changed password`);
};

module.exports = {
  login,
  refreshAccessToken,
  getUserById,
  changePassword,
};
