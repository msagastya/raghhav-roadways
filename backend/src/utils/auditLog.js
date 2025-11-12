const prisma = require('../config/database');
const logger = require('./logger');

/**
 * Create audit log entry
 * @param {Object} params
 * @param {string} params.tableName - Name of the table
 * @param {number} params.recordId - ID of the record
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, STATUS_CHANGE)
 * @param {Object} params.oldValues - Previous values (for UPDATE)
 * @param {Object} params.newValues - New values
 * @param {number} params.userId - User who performed the action
 * @param {string} params.ipAddress - IP address of the request
 * @param {string} params.userAgent - User agent string
 */
const createAuditLog = async ({
  tableName,
  recordId,
  action,
  oldValues = null,
  newValues = null,
  userId,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        tableName,
        recordId,
        action,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        changedBy: userId,
        ipAddress,
        userAgent,
      },
    });

    logger.info(`Audit log created: ${action} on ${tableName} ID ${recordId} by user ${userId}`);
  } catch (error) {
    logger.error('Failed to create audit log:', error);
    // Don't throw error - audit log failure shouldn't break the main operation
  }
};

/**
 * Get audit logs for a specific record
 * @param {string} tableName
 * @param {number} recordId
 */
const getAuditLogs = async (tableName, recordId) => {
  return await prisma.auditLog.findMany({
    where: {
      tableName,
      recordId,
    },
    include: {
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      changedAt: 'desc',
    },
  });
};

module.exports = {
  createAuditLog,
  getAuditLogs,
};
