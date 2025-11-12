const { body, param, query } = require('express-validator');

const createInvoiceValidation = [
  body('invoiceDate')
    .notEmpty()
    .withMessage('Invoice date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('partyId')
    .notEmpty()
    .withMessage('Party is required')
    .isInt({ min: 1 })
    .withMessage('Invalid party ID'),
  
  body('consignmentIds')
    .notEmpty()
    .withMessage('At least one consignment is required')
    .isArray({ min: 1 })
    .withMessage('Consignment IDs must be an array with at least one item'),
  
  body('consignmentIds.*')
    .isInt({ min: 1 })
    .withMessage('Invalid consignment ID'),
  
  body('grCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('GR charge must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
  
  body('generatePdf')
    .optional()
    .isBoolean()
    .withMessage('generatePdf must be a boolean'),
];

const updateInvoiceValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid invoice ID'),
  
  body('grCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('GR charge must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid due date format'),
];

const getInvoicesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('paymentStatus')
    .optional()
    .isIn(['Pending', 'Partial', 'Paid', 'Overdue'])
    .withMessage('Invalid payment status filter'),
  
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
];

const invoiceIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid invoice ID'),
];

module.exports = {
  createInvoiceValidation,
  updateInvoiceValidation,
  getInvoicesValidation,
  invoiceIdValidation,
};
