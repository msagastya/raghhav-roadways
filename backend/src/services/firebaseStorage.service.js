const { getBucket } = require('../config/firebase');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

/**
 * Upload a memory buffer directly to Firebase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} destination - Path inside the bucket (e.g. 'invoices/INV001.pdf')
 * @param {string} mimetype - Content type of the file
 * @returns {Promise<string>} - Public URL or fallback local relative path
 */
const uploadBuffer = async (buffer, destination, mimetype) => {
  try {
    const bucket = getBucket();
    if (!bucket) {
      logger.warn(`Firebase not configured. Storing buffer locally to fallback path: ${destination}`);
      
      // Save locally as fallback
      const fallbackPath = path.join(__dirname, '../../storage', destination);
      await fs.mkdir(path.dirname(fallbackPath), { recursive: true });
      await fs.writeFile(fallbackPath, buffer);
      return destination;
    }

    const file = bucket.file(destination);
    await file.save(buffer, {
      metadata: {
        contentType: mimetype,
      },
      resumable: false,
    });

    // Make the file public (or use standard firebase/google cloud format)
    await file.makePublic();
    
    // Construct the public download URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    logger.info(`Successfully uploaded buffer to Firebase: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    logger.error('Error uploading buffer to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Upload a local file to Firebase Storage and clean it up locally if specified
 * @param {string} localFilePath - Path to local file
 * @param {string} destination - Path inside the bucket
 * @param {string} mimetype - Content type
 * @param {boolean} cleanupLocal - Whether to delete local file after upload
 * @returns {Promise<string>} - Public URL or fallback local relative path
 */
const uploadLocalFile = async (localFilePath, destination, mimetype, cleanupLocal = true) => {
  try {
    const bucket = getBucket();
    if (!bucket) {
      logger.warn(`Firebase not configured. Keeping local file at: ${destination}`);
      return destination; // Return relative storage path
    }

    const file = bucket.file(destination);
    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: mimetype,
      },
    });

    await file.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;
    logger.info(`Successfully uploaded local file to Firebase: ${publicUrl}`);

    if (cleanupLocal) {
      try {
        await fs.unlink(localFilePath);
      } catch (err) {
        logger.error(`Failed to delete temporary local file: ${localFilePath}`, err);
      }
    }

    return publicUrl;
  } catch (error) {
    logger.error('Error uploading local file to Firebase Storage:', error);
    throw error;
  }
};

module.exports = {
  uploadBuffer,
  uploadLocalFile,
};
