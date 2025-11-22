const authService = require('../services/auth.service');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Cookie options for security
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge,
  path: '/',
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.login(username, password);

  // Set httpOnly cookies
  res.cookie('accessToken', result.accessToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days
  res.cookie('refreshToken', result.refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000)); // 30 days

  logger.info(`User ${username} logged in successfully`);

  // Return user data without tokens in response body
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Clear httpOnly cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

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
  // Get refresh token from cookie or body (for backward compatibility)
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required',
    });
  }

  const result = await authService.refreshAccessToken(token);

  // Set new access token cookie
  res.cookie('accessToken', result.accessToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: { refreshed: true },
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
