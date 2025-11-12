const { body, param, query } = require('express-validator');

const createPaymentValidation = [
  body('paymentDate')
    .notEmpty()
    .withMessage('Payment date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('invoiceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid invoice ID'),
  
  body('partyId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid party ID'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('paymentMode')
    .optional()
    .isIn(['Bank Transfer', 'Cash', 'Cheque', 'UPI'])
    .withMessage('Invalid payment mode'),
  
  body('paymentReference')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Payment reference too long'),
  
  body('bankName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Bank name too long'),
  
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks too long (max 500 characters)'),
];

const createAmendmentValidation = [
  body('invoiceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid invoice ID'),
  
  body('consignmentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid consignment ID'),
  
  body('amendmentType')
    .notEmpty()
    .withMessage('Amendment type is required')
    .isIn(['Additional Charge', 'Discount', 'Correction'])
    .withMessage('Invalid amendment type'),
  
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
];

const getPaymentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid from date format'),
  
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid to date format'),
  
  query('partyId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid party ID'),
  
  query('invoiceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid invoice ID'),
];

const paymentIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid payment ID'),
];

const amendmentIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid amendment ID'),
];

module.exports = {
  createPaymentValidation,
  createAmendmentValidation,
  getPaymentsValidation,
  paymentIdValidation,
  amendmentIdValidation,
};
