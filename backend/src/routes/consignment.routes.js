const express = require('express');
const router = express.Router();
const multer = require('multer');
const consignmentController = require('../controllers/consignment.controller');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { validate } = require('../middleware/validator');
const {
  createConsignmentValidation,
  updateConsignmentValidation,
  updateStatusValidation,
  getConsignmentsValidation,
  consignmentIdValidation,
} = require('../validations/consignment.validation');

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
    }
  },
});

/**
 * @route   GET /api/v1/consignments/summary/status
 * @desc    Get status summary
 * @access  Private
 */
router.get(
  '/summary/status',
  authenticateToken,
  checkPermission('consignment.view'),
  consignmentController.getStatusSummary
);

/**
 * @route   GET /api/v1/consignments/summary/today
 * @desc    Get today's bookings
 * @access  Private
 */
router.get(
  '/summary/today',
  authenticateToken,
  checkPermission('consignment.view'),
  consignmentController.getTodaysBookings
);

/**
 * @route   GET /api/v1/consignments/summary/pending
 * @desc    Get pending deliveries
 * @access  Private
 */
router.get(
  '/summary/pending',
  authenticateToken,
  checkPermission('consignment.view'),
  consignmentController.getPendingDeliveries
);

/**
 * @route   GET /api/v1/consignments/for-invoicing/:partyId
 * @desc    Get consignments ready for invoicing
 * @access  Private
 */
router.get(
  '/for-invoicing/:partyId',
  authenticateToken,
  checkPermission('invoice.create'),
  consignmentController.getConsignmentsForInvoicing
);

/**
 * @route   GET /api/v1/consignments/:id/download-note
 * @desc    Download consignment note PDF
 * @access  Private
 */
router.get(
  '/:id/download-note',
  authenticateToken,
  checkPermission('consignment.view'),
  consignmentIdValidation,
  validate,
  consignmentController.downloadConsignmentNote
);

/**
 * @route   POST /api/v1/consignments/:id/upload-challan
 * @desc    Upload challan document
 * @access  Private
 */
router.post(
  '/:id/upload-challan',
  authenticateToken,
  checkPermission('consignment.edit'),
  upload.single('challan'),
  consignmentIdValidation,
  validate,
  consignmentController.uploadChallan
);

/**
 * @route   PATCH /api/v1/consignments/:id/status
 * @desc    Update consignment status
 * @access  Private
 */
router.patch(
  '/:id/status',
  authenticateToken,
  checkPermission('consignment.status_update'),
  updateStatusValidation,
  validate,
  consignmentController.updateConsignmentStatus
);

/**
 * @route   GET /api/v1/consignments
 * @desc    Get all consignments
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  checkPermission('consignment.view'),
  getConsignmentsValidation,
  validate,
  consignmentController.getConsignments
);

/**
 * @route   GET /api/v1/consignments/:id
 * @desc    Get consignment by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  checkPermission('consignment.view'),
  consignmentIdValidation,
  validate,
  consignmentController.getConsignmentById
);

/**
 * @route   POST /api/v1/consignments
 * @desc    Create new consignment
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  checkPermission('consignment.create'),
  createConsignmentValidation,
  validate,
  consignmentController.createConsignment
);

/**
 * @route   PATCH /api/v1/consignments/:id
 * @desc    Update consignment
 * @access  Private
 */
router.patch(
  '/:id',
  authenticateToken,
  checkPermission('consignment.edit'),
  updateConsignmentValidation,
  validate,
  consignmentController.updateConsignment
);

/**
 * @route   DELETE /api/v1/consignments/:id
 * @desc    Delete consignment
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('consignment.delete'),
  consignmentIdValidation,
  validate,
  consignmentController.deleteConsignment
);

module.exports = router;
