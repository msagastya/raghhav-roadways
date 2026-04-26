const { body, param, query } = require('express-validator');

const createConsignmentValidation = [
  body('grDate')
    .notEmpty()
    .withMessage('GR date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('consignorId')
    .notEmpty()
    .withMessage('Consignor is required')
    .isInt({ min: 1 })
    .withMessage('Invalid consignor ID'),
  
  body('consigneeId')
    .notEmpty()
    .withMessage('Consignee is required')
    .isInt({ min: 1 })
    .withMessage('Invalid consignee ID'),
  
  body('fromLocation')
    .trim()
    .notEmpty()
    .withMessage('From location is required')
    .isLength({ max: 100 })
    .withMessage('From location too long'),
  
  body('toLocation')
    .trim()
    .notEmpty()
    .withMessage('To location is required')
    .isLength({ max: 100 })
    .withMessage('To location too long'),
  
  body('vehicleId')
    .notEmpty()
    .withMessage('Vehicle is required')
    .isInt({ min: 1 })
    .withMessage('Invalid vehicle ID'),
  
  body('freightAmount')
    .notEmpty()
    .withMessage('Freight amount is required')
    .isFloat({ min: 0 })
    .withMessage('Freight amount must be a positive number'),
  
  body('surcharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Surcharge must be a positive number'),
  
  body('otherCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other charges must be a positive number'),
  
  body('grCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('GR charge must be a positive number'),
  
  body('actualWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  
  body('noOfPackages')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of packages must be at least 1'),
  
  body('vehicleType')
    .optional()
    .isIn(['Open', 'Closed', 'Container', 'Other'])
    .withMessage('Invalid vehicle type'),
  
  body('atRisk')
    .optional()
    .isIn(["Owner's Risk", "Carrier's Risk", "Company Risk"])
    .withMessage('Invalid risk type'),
  
  body('paymentMode')
    .optional()
    .isIn(['To Pay', 'Paid', 'Party Paid'])
    .withMessage('Invalid payment mode'),
];

const updateConsignmentValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid consignment ID'),
  
  body('freightAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Freight amount must be a positive number'),
  
  body('surcharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Surcharge must be a positive number'),
  
  body('otherCharges')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other charges must be a positive number'),
  
  body('grCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('GR charge must be a positive number'),
];

const updateStatusValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid consignment ID'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Booked', 'Loaded', 'In Transit', 'Delivered', 'Settled', 'Cancelled'])
    .withMessage('Invalid status'),
  
  body('remarks')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Remarks too long (max 500 characters)'),
];

const getConsignmentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Limit must be between 1 and 10000'),
  
  query('status')
    .optional()
    .isIn(['Booked', 'Loaded', 'In Transit', 'Delivered', 'Settled', 'Cancelled'])
    .withMessage('Invalid status filter'),
  
  query('fromDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid from date format'),
  
  query('toDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid to date format'),
];

const consignmentIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid consignment ID'),
];

module.exports = {
  createConsignmentValidation,
  updateConsignmentValidation,
  updateStatusValidation,
  getConsignmentsValidation,
  consignmentIdValidation,
};
