const { ApiError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Check if user has required permission
 * @param {string|string[]} requiredPermission - Single permission or array of permissions
 * @param {string} logic - 'AND' (all required) or 'OR' (at least one required)
 */
const checkPermission = (requiredPermission, logic = 'OR') => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const userPermissions = req.user.permissions || [];
      const requiredPermissions = Array.isArray(requiredPermission)
        ? requiredPermission
        : [requiredPermission];

      let hasPermission = false;

      if (logic === 'AND') {
        // User must have ALL required permissions
        hasPermission = requiredPermissions.every((perm) =>
          userPermissions.includes(perm)
        );
      } else {
        // User must have AT LEAST ONE required permission
        hasPermission = requiredPermissions.some((perm) =>
          userPermissions.includes(perm)
        );
      }

      if (!hasPermission) {
        logger.warn(
          `Permission denied for user ${req.user.username}: Required ${requiredPermissions.join(
            `, ${logic} `
          )}`
        );
        throw new ApiError(
          403,
          'You do not have permission to perform this action'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has specific role
 * @param {string|string[]} allowedRoles
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(req.user.roleName)) {
        logger.warn(
          `Role check failed for user ${req.user.username}: Required ${roles.join(
            ' or '
          )}, got ${req.user.roleName}`
        );
        throw new ApiError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is Super Admin
 */
const isSuperAdmin = () => checkRole('Super Admin');

module.exports = {
  checkPermission,
  checkRole,
  isSuperAdmin,
};
