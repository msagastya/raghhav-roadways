const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/v1/payments
 * @desc    Get all payments
 * @access  Private
 */
router.get('/', authenticateToken, paymentController.getPayments);

/**
 * @route   POST /api/v1/payments
 * @desc    Create new payment
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  paymentController.createPayment
);

/**
 * @route   POST /api/v1/payments/amendments
 * @desc    Create payment amendment
 * @access  Private
 */
router.post(
  '/amendments',
  authenticateToken,
  paymentController.createPaymentAmendment
);

/**
 * @route   PATCH /api/v1/payments/amendments/:id/approve
 * @desc    Approve payment amendment
 * @access  Private
 */
router.patch(
  '/amendments/:id/approve',
  authenticateToken,
  paymentController.approvePaymentAmendment
);

module.exports = router;
