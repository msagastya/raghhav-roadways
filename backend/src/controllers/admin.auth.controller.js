const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');

/**
 * Generate JWT tokens (access and refresh)
 */
const generateTokens = (adminId, adminUserId, role) => {
  const accessToken = jwt.sign(
    {
      id: adminUserId,
      adminId: adminId,
      role: role,
      type: 'admin'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    {
      id: adminUserId,
      adminId: adminId,
      role: role,
      type: 'admin'
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

/**
 * Admin Login
 * @route   POST /api/v1/admin/auth/login
 * @desc    Authenticate admin user with admin_id and password
 */
exports.login = async (req, res) => {
  try {
    const { adminId, password } = req.body;

    // Find admin user
    const admin = await prisma.adminUser.findUnique({
      where: { adminId }
    });

    if (!admin) {
      logger.warn('Admin login failed: admin not found', { adminId });
      return res.status(401).json({
        success: false,
        message: 'Invalid admin ID or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      logger.warn('Admin login failed: account inactive', { adminId });
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      logger.warn('Admin login failed: invalid password', { adminId });
      return res.status(401).json({
        success: false,
        message: 'Invalid admin ID or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      admin.adminId,
      admin.id,
      admin.role
    );

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });

    // Set refresh token as secure HTTP-only cookie
    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    logger.info('Admin login successful', {
      adminId: admin.adminId,
      adminUserId: admin.id
    });

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        accessToken,
        refreshToken,
        admin: {
          id: admin.id,
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    logger.error('Admin login error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Refresh Admin Token
 * @route   POST /api/v1/admin/auth/refresh
 * @desc    Generate new access token using refresh token
 */
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      logger.warn('Invalid refresh token', { error: error.message });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Verify token type
    if (decoded.type !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Get admin user
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      admin.adminId,
      admin.id,
      admin.role
    );

    // Update refresh token cookie
    res.cookie('adminRefreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};

/**
 * Admin Logout
 * @route   POST /api/v1/admin/auth/logout
 * @desc    Logout admin user and clear tokens
 */
exports.logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('adminRefreshToken');

    logger.info('Admin logout', { adminUserId: req.admin.id });

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

/**
 * Get Current Admin Profile
 * @route   GET /api/v1/admin/auth/me
 * @desc    Get current authenticated admin user
 */
exports.getCurrentAdmin = async (req, res) => {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id },
      select: {
        id: true,
        adminId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Get current admin error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin profile'
    });
  }
};

/**
 * Change Admin Password
 * @route   PATCH /api/v1/admin/auth/change-password
 * @desc    Change admin password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    // Get admin user
    const admin = await prisma.adminUser.findUnique({
      where: { id: req.admin.id }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: hashedPassword }
    });

    logger.info('Admin password changed', { adminUserId: admin.id });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};
