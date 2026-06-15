const { initializeApp, getApps, cert } = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const logger = require('../utils/logger');

let bucket = null;

const initializeFirebase = () => {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId || !clientEmail || !privateKey || !bucketName) {
      logger.warn('Firebase configuration missing in environment. Local storage fallback will be active.');
      return null;
    }

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: bucketName,
      });
      logger.info('Firebase Admin SDK initialized successfully.');
    }

    bucket = getStorage().bucket();
    return bucket;
  } catch (error) {
    logger.error('Firebase initialization error:', error);
    return null;
  }
};

const getBucket = () => {
  if (!bucket) {
    return initializeFirebase();
  }
  return bucket;
};

module.exports = {
  initializeFirebase,
  getBucket,
};
