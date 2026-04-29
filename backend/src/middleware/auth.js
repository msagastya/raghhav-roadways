const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../config/jwt');
const { ApiError } = require('./errorHandler');
const prisma = require('../config/database');
const { isTokenBlacklisted } = require('../config/redis');

/**
 * Authenticate JWT token
 * SECURITY: First tries httpOnly cookie (primary), then Authorization header (backup)
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Try to get token from httpOnly cookie first (more secure)
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header for backward compatibility and API tools
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    // Verify token signature and expiry
    const decoded = verifyAccessToken(token);

    // Check if token was revoked on logout
    if (decoded.jti && await isTokenBlacklisted(decoded.jti)) {
      throw new ApiError(401, 'Token has been revoked. Please log in again.');
    }

    // Get user details with role and permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    // Extract permissions
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.permissionCode
    );

    // Attach user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.role.roleName,
      permissions,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 * SECURITY: Checks httpOnly cookie first, then Authorization header
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Try to get token from httpOnly cookie first
    let token = req.cookies?.accessToken;

    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
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

      if (user && user.isActive) {
        const permissions = user.role.rolePermissions.map(
          (rp) => rp.permission.permissionCode
        );

        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          roleId: user.roleId,
          roleName: user.role.roleName,
          permissions,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};

/**
 * Authorize based on permission(s)
 * @param {string|string[]|function} requiredPermission - Single permission, array of permissions, or check function
 */
const authorize = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    // Handle function-based authorization
    if (typeof requiredPermission === 'function') {
      if (!requiredPermission(req.user)) {
        return next(new ApiError(403, 'Insufficient permissions'));
      }
      return next();
    }

    // Handle array of required permissions (user must have at least one)
    const requiredPerms = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    // Check if user has any of the required permissions
    const hasPermission = requiredPerms.some((perm) => {
      // Support both role names and permission codes
      return req.user.permissions.includes(perm) || req.user.roleName === perm;
    });

    if (!hasPermission) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Authenticate Admin JWT token
 * Admin authentication uses separate JWT_SECRET
 */
const authenticateAdminToken = async (req, res, next) => {
  try {
    // Try to get token from httpOnly cookie first (more secure)
    let token = req.cookies?.adminAccessToken;

    // Fallback to Authorization header for API tools
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      throw new ApiError(401, 'Admin access token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== 'admin') {
      throw new ApiError(401, 'Invalid token type');
    }

    // Get admin user details
    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id }
    });

    if (!admin || !admin.isActive) {
      throw new ApiError(401, 'Admin not found or inactive');
    }

    // Attach admin info to request
    req.admin = {
      id: admin.id,
      adminId: admin.adminId,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Admin token expired'));
    } else {
      next(new ApiError(401, 'Invalid or expired admin token'));
    }
  }
};

/**
 * Middleware to ensure request is from authenticated admin
 */
const adminOnly = (req, res, next) => {
  if (!req.admin) {
    return next(new ApiError(401, 'Admin authentication required'));
  }
  next();
};

/**
 * Authorize admin based on role
 */
const authorizeAdminRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new ApiError(401, 'Admin authentication required'));
    }

    // super_admin can access everything
    if (req.admin.role === 'super_admin') {
      return next();
    }

    if (requiredRole && req.admin.role !== requiredRole) {
      return next(new ApiError(403, 'Insufficient admin permissions'));
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorize,
  authenticateAdminToken,
  adminOnly,
  authorizeAdminRole,
};
