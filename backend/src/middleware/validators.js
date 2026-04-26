const { ApiError } = require('./errorHandler');

/**
 * Validate admin login input
 */
const validateAdminLogin = (req, res, next) => {
  const { adminId, password } = req.body;

  // Check required fields
  if (!adminId || !password) {
    throw new ApiError(400, 'Admin ID and password are required');
  }

  // Validate adminId format (alphanumeric, 3-50 chars)
  if (!/^[a-zA-Z0-9_-]{3,50}$/.test(adminId)) {
    throw new ApiError(400, 'Invalid admin ID format');
  }

  // Validate password length
  if (password.length < 6) {
    throw new ApiError(400, 'Password is too short');
  }

  if (password.length > 255) {
    throw new ApiError(400, 'Password is too long');
  }

  next();
};

/**
 * Validate user login input
 */
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password is too short');
  }

  next();
};

/**
 * Validate user registration input
 */
const validateUserRegistration = (req, res, next) => {
  const { email, password, confirmPassword, fullName } = req.body;

  if (!email || !password || !confirmPassword || !fullName) {
    throw new ApiError(400, 'All fields are required');
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  // Password validation
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  if (password !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  // Check password strength
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!strongPasswordRegex.test(password)) {
    throw new ApiError(400, 'Password must contain uppercase, lowercase, and numbers');
  }

  // Full name validation
  if (fullName.length < 2 || fullName.length > 100) {
    throw new ApiError(400, 'Full name must be between 2 and 100 characters');
  }

  next();
};

/**
 * Validate change password input
 */
const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, 'All fields are required');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'New passwords do not match');
  }

  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must be different from current password');
  }

  next();
};

module.exports = {
  validateAdminLogin,
  validateUserLogin,
  validateUserRegistration,
  validateChangePassword,
};
