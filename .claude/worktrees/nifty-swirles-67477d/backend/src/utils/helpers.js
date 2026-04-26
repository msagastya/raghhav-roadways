const crypto = require('crypto');

/**
 * Generate unique code with prefix
 * @param {string} prefix - Code prefix (e.g., 'GR', 'INV', 'PAY')
 * @param {number} lastNumber - Last generated number
 * @param {number} padding - Number of digits (default: 4)
 */
const generateCode = (prefix, lastNumber = 0, padding = 4) => {
  const nextNumber = lastNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(padding, '0');
  return `${prefix}${paddedNumber}`;
};

/**
 * Parse and validate date
 * @param {string|Date} date
 */
const parseDate = (date) => {
  if (date instanceof Date) {
    return date;
  }
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid date format');
  }
  return parsed;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date
 */
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format currency (Indian Rupees)
 * @param {number} amount
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate pagination metadata
 * @param {number} totalRecords
 * @param {number} page
 * @param {number} limit
 */
const getPaginationMeta = (totalRecords, page, limit) => {
  const totalPages = Math.ceil(totalRecords / limit);
  return {
    currentPage: page,
    totalPages,
    totalRecords,
    perPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

/**
 * Sanitize filename for storage
 * @param {string} filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Generate random string
 * @param {number} length
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
};

/**
 * Check if status transition is valid
 * @param {string} fromStatus
 * @param {string} toStatus
 */
const isValidStatusTransition = (fromStatus, toStatus) => {
  const { STATUS_TRANSITIONS } = require('../config/constants');
  
  if (!fromStatus) {
    return toStatus === 'Booked';
  }
  
  const allowedTransitions = STATUS_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
};

/**
 * Extract file extension
 * @param {string} filename
 */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Build file path for storage
 * @param {string} type - 'consignment', 'invoice', 'challan'
 * @param {string} filename
 */
const buildFilePath = (type, filename) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  return `${type}s/${year}/${month}/${filename}`;
};

/**
 * Deep clone object
 * @param {Object} obj
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Remove null/undefined values from object
 * @param {Object} obj
 */
const removeEmpty = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v != null && v !== '')
  );
};

/**
 * Calculate total amount
 * @param {number} freight
 * @param {number} surcharge
 * @param {number} otherCharges
 * @param {number} grCharge
 */
const calculateTotal = (freight, surcharge = 0, otherCharges = 0, grCharge = 0) => {
  return Number(freight) + Number(surcharge) + Number(otherCharges) + Number(grCharge);
};

module.exports = {
  generateCode,
  parseDate,
  formatDate,
  formatCurrency,
  getPaginationMeta,
  sanitizeFilename,
  generateRandomString,
  isValidStatusTransition,
  getFileExtension,
  buildFilePath,
  deepClone,
  removeEmpty,
  calculateTotal,
};
