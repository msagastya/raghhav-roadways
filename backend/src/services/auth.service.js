const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const googleSheetsService = require('./googleSheets.service');

const ADMIN_PERMISSIONS = [
  'view_consignments', 'create_consignment', 'update_consignment', 'delete_consignment',
  'view_invoices', 'create_invoice', 'update_invoice', 'delete_invoice',
  'view_payments', 'create_payment', 'approve_amendment',
  'view_parties', 'create_party', 'update_party', 'delete_party',
  'view_vehicles', 'create_vehicle', 'update_vehicle', 'delete_vehicle',
  'view_reports'
];

/**
 * Login user
 */
const login = async (username, password) => {
  const user = await googleSheetsService.findFirst('users', { username });

  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Google sheets reads booleans as string 'TRUE' / 'FALSE' or raw booleans
  const isActive = String(user.isActive).toUpperCase() === 'TRUE' || user.isActive === true;
  if (!isActive) {
    throw new ApiError(401, 'Your account has been deactivated');
  }

  if (user.approvalStatus === 'pending') {
    throw new ApiError(401, 'Your account is pending approval');
  }

  if (user.approvalStatus === 'rejected') {
    throw new ApiError(401, 'Your account has been rejected');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Extract permissions
  const permissions = ADMIN_PERMISSIONS;

  // Create token payload
  const tokenPayload = {
    userId: user.id,
    username: user.username,
    roleId: user.roleId,
    roleName: 'Admin',
  };

  // Generate tokens
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await googleSheetsService.update('users', 'id', user.id, { lastLogin: new Date().toISOString() });

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
      role: 'Admin',
      permissions,
    },
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken } = require('../config/jwt');

  try {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await googleSheetsService.findFirst('users', { id: decoded.userId });

    const isActive = String(user?.isActive).toUpperCase() === 'TRUE' || user?.isActive === true;
    if (!user || !isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId,
      roleName: 'Admin',
    };

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
 */
const getUserById = async (userId) => {
  const user = await googleSheetsService.findFirst('users', { id: userId });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    mobile: user.mobile,
    roleName: 'Admin',
    permissions: ADMIN_PERMISSIONS,
  };
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await googleSheetsService.findFirst('users', { id: userId });

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
  await googleSheetsService.update('users', 'id', userId, { passwordHash: hashedPassword });

  logger.info(`User ${user.username} changed password`);
};

/**
 * Sign up new user
 */
const signup = async (userData) => {
  const { username, email, password, fullName, mobile } = userData;

  const users = await googleSheetsService.readAll('users');
  const existingUser = users.find(u => u.username === username || u.email === email);

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ApiError(400, 'Username already exists');
    }
    if (existingUser.email === email) {
      throw new ApiError(400, 'Email already exists');
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await googleSheetsService.insert('users', {
    username,
    email,
    passwordHash: hashedPassword,
    fullName,
    mobile,
    roleId: 2,
    isActive: false,
    approvalStatus: 'pending',
  });

  logger.info(`New user signed up: ${username}`);

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    mobile: user.mobile,
  };
};

module.exports = {
  login,
  refreshAccessToken,
  getUserById,
  changePassword,
  signup,
};
