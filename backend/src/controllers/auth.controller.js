const authService = require('../services/auth.service');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { recordFailedLogin, recordSuccessfulLogin } = require('../middleware/loginRateLimiter');
const { blacklistToken } = require('../config/redis');
const { verifyAccessToken } = require('../config/jwt');

/**
 * Login user
 * POST /api/v1/auth/login
 * SECURITY: Sets httpOnly cookies for tokens (not accessible to JavaScript)
 */
const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const result = await authService.login(username, password);

    // Record successful login (clears failed attempt counter)
    recordSuccessfulLogin(username);

    // SECURITY: Set tokens as httpOnly cookies to prevent XSS token theft
    // httpOnly prevents JavaScript from accessing the token
    // Secure flag ensures cookies only sent over HTTPS in production
    // SameSite=Strict prevents CSRF attacks
    const cookieOptions = {
      httpOnly: true, // Prevent JavaScript from accessing tokens
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // Lax allows same-site cross-origin requests (different ports)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for access token
      path: '/',
    };

    res.cookie('accessToken', result.accessToken, cookieOptions);

    // Refresh token with longer expiry
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    logger.info(`User ${username} logged in successfully`);

    // Send user info (but NOT tokens) in response body
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        // Tokens are now in httpOnly cookies, not in response body
      },
    });
  } catch (error) {
    // Record failed login attempt (increments counter, may lock account)
    if (username) {
      recordFailedLogin(username);
    }
    next(error);
  }
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Blacklist the current token so it cannot be reused after logout
  const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      if (decoded.jti) {
        // TTL matches token lifetime so Redis entry auto-expires
        const ttl = Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0);
        await blacklistToken(decoded.jti, ttl);
      }
    } catch { /* token already invalid — nothing to blacklist */ }
  }

  res.clearCookie('accessToken', { path: '/', httpOnly: true });
  res.clearCookie('refreshToken', { path: '/', httpOnly: true });

  logger.info(`User ${req.user?.username} logged out`);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 * SECURITY: Gets refreshToken from httpOnly cookie, returns new accessToken in cookie
 */
const refreshToken = asyncHandler(async (req, res) => {
  // Get refresh token from cookie (more secure than from body)
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    throw new ApiError(401, 'Refresh token not found');
  }

  const result = await authService.refreshAccessToken(refreshTokenFromCookie);

  // Set new access token as httpOnly cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  res.cookie('accessToken', result.accessToken, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      // Don't send tokens in response body - they're in cookies
    },
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
