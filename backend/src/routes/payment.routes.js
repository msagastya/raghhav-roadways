const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/receipts/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, PNG) and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments
 * @access  Private
 */
router.get('/', authenticateToken, paymentController.getPayments);

/**
 * @route   GET /api/v1/payments/summary/today
 * @desc    Get today's payments summary
 * @access  Private
 */
router.get('/summary/today', authenticateToken, paymentController.getTodaysPayments);

/**
 * @route   GET /api/v1/payments/invoice/:invoiceId
 * @desc    Get payments by invoice
 * @access  Private
 */
router.get('/invoice/:invoiceId', authenticateToken, paymentController.getPaymentsByInvoice);

/**
 * @route   GET /api/v1/payments/party/:partyId
 * @desc    Get payments by party
 * @access  Private
 */
router.get('/party/:partyId', authenticateToken, paymentController.getPaymentsByParty);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, paymentController.getPaymentById);

/**
 * @route   POST /api/v1/payments
 * @desc    Create new payment (planned payment)
 * @access  Private
 */
router.post('/', authenticateToken, paymentController.createPayment);

/**
 * @route   PATCH /api/v1/payments/:id
 * @desc    Update payment (edit total amount)
 * @access  Private
 */
router.patch('/:id', authenticateToken, paymentController.updatePayment);

/**
 * @route   DELETE /api/v1/payments/:id
 * @desc    Delete payment
 * @access  Private
 */
router.delete('/:id', authenticateToken, paymentController.deletePayment);

/**
 * @route   POST /api/v1/payments/:id/transactions
 * @desc    Add payment transaction (partial payment) with optional file upload
 * @access  Private
 */
router.post(
  '/:id/transactions',
  authenticateToken,
  upload.single('receipt'),
  paymentController.addPaymentTransaction
);

/**
 * @route   DELETE /api/v1/payment-transactions/:id
 * @desc    Delete payment transaction
 * @access  Private
 */
router.delete('/transactions/:id', authenticateToken, paymentController.deletePaymentTransaction);

/**
 * @route   POST /api/v1/payments/amendments
 * @desc    Create payment amendment
 * @access  Private
 */
router.post('/amendments', authenticateToken, paymentController.createPaymentAmendment);

/**
 * @route   GET /api/v1/payments/amendments/pending
 * @desc    Get pending amendments
 * @access  Private
 */
router.get('/amendments/pending', authenticateToken, paymentController.getPendingAmendments);

/**
 * @route   PATCH /api/v1/payments/amendments/:id/approve
 * @desc    Approve payment amendment
 * @access  Private
 */
router.patch('/amendments/:id/approve', authenticateToken, paymentController.approvePaymentAmendment);

/**
 * @route   PATCH /api/v1/payments/amendments/:id/reject
 * @desc    Reject payment amendment
 * @access  Private
 */
router.patch('/amendments/:id/reject', authenticateToken, paymentController.rejectPaymentAmendment);

module.exports = router;
