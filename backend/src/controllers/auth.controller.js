const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.login(username, password);

  logger.info(`User ${username} logged in successfully`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token. This endpoint is for logging purposes.

  logger.info(`User ${req.user.username} logged out`);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: result,
  });
});

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await authService.changePassword(req.user.id, oldPassword, newPassword);

  logger.info(`User ${req.user.username} changed password`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Sign up new user
 * POST /api/v1/auth/signup
 */
const signup = asyncHandler(async (req, res) => {
  const { username, email, password, fullName, mobile } = req.body;

  const user = await authService.signup({
    username,
    email,
    password,
    fullName,
    mobile,
  });

  logger.info(`New user signed up: ${username}`);

  res.status(201).json({
    success: true,
    message: 'Sign up successful. Please wait for admin approval.',
    data: user,
  });
});

module.exports = {
  login,
  logout,
  refreshToken,
  getProfile,
  changePassword,
  signup,
};
