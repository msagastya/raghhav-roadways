const { body, param, query } = require('express-validator');

const createVehicleValidation = [
  body('vehicleNo')
    .trim()
    .notEmpty()
    .withMessage('Vehicle number is required')
    .matches(/^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/)
    .withMessage('Invalid vehicle number format (e.g., GJ01AB1234)'),
  
  body('vehicleType')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Vehicle type too long'),
  
  body('vehicleCapacity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Vehicle capacity must be a positive number'),
  
  body('ownerType')
    .notEmpty()
    .withMessage('Owner type is required')
    .isIn(['owned', 'broker'])
    .withMessage('Invalid owner type'),
  
  body('ownerName')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Owner name too long'),
  
  body('ownerMobile')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid mobile number'),
  
  body('brokerId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Invalid broker ID'),
  
  body('rcExpiry')
    .optional()
    .isISO8601()
    .withMessage('Invalid RC expiry date'),
  
  body('insuranceExpiry')
    .optional()
    .isISO8601()
    .withMessage('Invalid insurance expiry date'),
  
  body('fitnessExpiry')
    .optional()
    .isISO8601()
    .withMessage('Invalid fitness expiry date'),
  
  body('driverMobile')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid driver mobile number'),
];

const updateVehicleValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid vehicle ID'),
  
  ...createVehicleValidation.slice(1), // Reuse create validations
];

const getVehiclesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('ownerType')
    .optional()
    .isIn(['owned', 'broker'])
    .withMessage('Invalid owner type filter'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const vehicleIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid vehicle ID'),
];

module.exports = {
  createVehicleValidation,
  updateVehicleValidation,
  getVehiclesValidation,
  vehicleIdValidation,
};
