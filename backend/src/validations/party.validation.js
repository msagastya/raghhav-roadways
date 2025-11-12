const { body, param, query } = require('express-validator');

const createPartyValidation = [
  body('partyName')
    .trim()
    .notEmpty()
    .withMessage('Party name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Party name must be between 2 and 200 characters'),
  
  body('partyType')
    .notEmpty()
    .withMessage('Party type is required')
    .isIn(['consignor', 'consignee', 'both'])
    .withMessage('Invalid party type'),
  
  body('gstin')
    .optional()
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format'),
  
  body('pan')
    .optional()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage('Invalid PAN format'),
  
  body('mobile')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid mobile number'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address'),
  
  body('pincode')
    .optional()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Invalid pincode'),
  
  body('creditLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Credit limit must be a positive number'),
  
  body('creditDays')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Credit days must be a positive integer'),
];

const updatePartyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid party ID'),
  
  ...createPartyValidation.slice(1), // Reuse create validations except the first one
];

const getPartiesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('type')
    .optional()
    .isIn(['consignor', 'consignee', 'both'])
    .withMessage('Invalid party type filter'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const partyIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid party ID'),
];

module.exports = {
  createPartyValidation,
  updatePartyValidation,
  getPartiesValidation,
  partyIdValidation,
};
