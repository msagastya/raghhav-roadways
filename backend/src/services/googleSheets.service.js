const logger = require('../utils/logger');

const GOOGLE_SHEET_API_URL = process.env.GOOGLE_SHEET_API_URL;

/**
 * Execute request to Google Apps Script Web App
 */
async function executeRequest(payload) {
  if (!GOOGLE_SHEET_API_URL) {
    logger.error('GOOGLE_SHEET_API_URL is not configured in environment');
    throw new Error('Database configuration error: GOOGLE_SHEET_API_URL is missing.');
  }

  try {
    const response = await fetch(GOOGLE_SHEET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to execute query in Google Sheets');
    }
    return result.data;
  } catch (error) {
    logger.error('Google Sheets API error:', error);
    throw error;
  }
}

/**
 * Get all records from a worksheet
 */
async function readAll(sheet) {
  return await executeRequest({ action: 'readAll', sheet });
}

/**
 * Find records matching filters
 */
async function findMany(sheet, filters = {}) {
  const records = await readAll(sheet);
  return records.filter(row => {
    return Object.entries(filters).every(([key, val]) => {
      if (val === undefined || val === null) return true;
      return String(row[key]) === String(val);
    });
  });
}

/**
 * Find single record matching filters
 */
async function findFirst(sheet, filters = {}) {
  const records = await findMany(sheet, filters);
  return records[0] || null;
}

/**
 * Insert record into worksheet
 */
async function insert(sheet, data) {
  return await executeRequest({ action: 'insert', sheet, data });
}

/**
 * Update record matching ID
 */
async function update(sheet, idKey, idValue, data) {
  return await executeRequest({ action: 'update', sheet, idKey, idValue, data });
}

/**
 * Delete record matching ID
 */
async function deleteRecord(sheet, idKey, idValue) {
  return await executeRequest({ action: 'delete', sheet, idKey, idValue });
}

module.exports = {
  readAll,
  findMany,
  findFirst,
  insert,
  update,
  deleteRecord,
};
