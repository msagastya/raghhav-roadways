const { verifyAccessToken } = require('../config/jwt');
const { ApiError } = require('./errorHandler');
const prisma = require('../config/database');

/**
 * Authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie first, then fall back to header (for backward compatibility)
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    // Verify token
    const decoded = verifyAccessToken(token);

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

    if (!user.role) {
      throw new ApiError(401, 'User role not configured');
    }

    // Extract permissions
    const permissions = user.role.rolePermissions?.map(
      (rp) => rp.permission?.permissionCode
    ).filter(Boolean) || [];

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
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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
 * Authorize based on permission
 */
const authorize = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized'));
    }

    if (!req.user.permissions.includes(permission)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorize,
};
