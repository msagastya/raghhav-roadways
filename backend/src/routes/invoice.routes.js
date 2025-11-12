const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { validate } = require('../middleware/validator');
const {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoicesValidation,
  invoiceIdValidation,
} = require('../validations/invoice.validation');

/**
 * @route   GET /api/v1/invoices/overdue
 * @desc    Get overdue invoices
 * @access  Private
 */
router.get(
  '/overdue',
  authenticateToken,
  checkPermission('invoice.view'),
  invoiceController.getOverdueInvoices
);

/**
 * @route   GET /api/v1/invoices/summary/payments
 * @desc    Get payment summary
 * @access  Private
 */
router.get(
  '/summary/payments',
  authenticateToken,
  checkPermission('invoice.view'),
  invoiceController.getPaymentSummary
);

/**
 * @route   GET /api/v1/invoices/:id/download
 * @desc    Download invoice PDF
 * @access  Private
 */
router.get(
  '/:id/download',
  authenticateToken,
  checkPermission('invoice.view'),
  invoiceIdValidation,
  validate,
  invoiceController.downloadInvoice
);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get all invoices
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  checkPermission('invoice.view'),
  getInvoicesValidation,
  validate,
  invoiceController.getInvoices
);

/**
 * @route   GET /api/v1/invoices/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  checkPermission('invoice.view'),
  invoiceIdValidation,
  validate,
  invoiceController.getInvoiceById
);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create new invoice
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  checkPermission('invoice.create'),
  createInvoiceValidation,
  validate,
  invoiceController.createInvoice
);

/**
 * @route   PATCH /api/v1/invoices/:id
 * @desc    Update invoice
 * @access  Private
 */
router.patch(
  '/:id',
  authenticateToken,
  checkPermission('invoice.edit'),
  updateInvoiceValidation,
  validate,
  invoiceController.updateInvoice
);

/**
 * @route   DELETE /api/v1/invoices/:id
 * @desc    Delete invoice
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('invoice.delete'),
  invoiceIdValidation,
  validate,
  invoiceController.deleteInvoice
);

module.exports = router;
