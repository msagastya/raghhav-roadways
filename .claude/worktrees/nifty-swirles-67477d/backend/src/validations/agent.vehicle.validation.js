const { body, param } = require('express-validator');

const createVehicleValidation = [
    body('vehicleNo')
        .trim()
        .notEmpty()
        .withMessage('Vehicle number is required')
        .matches(/^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/i)
        .withMessage('Please provide a valid vehicle number (e.g., GJ01AB1234)'),
    body('vehicleType')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Vehicle type cannot exceed 50 characters'),
    body('vehicleCapacity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Vehicle capacity must be a positive number'),
    body('rcNumber')
        .optional()
        .trim(),
    body('rcExpiry')
        .optional()
        .isISO8601()
        .withMessage('RC expiry must be a valid date'),
    body('insuranceNumber')
        .optional()
        .trim(),
    body('insuranceExpiry')
        .optional()
        .isISO8601()
        .withMessage('Insurance expiry must be a valid date'),
    body('fitnessExpiry')
        .optional()
        .isISO8601()
        .withMessage('Fitness expiry must be a valid date'),
    body('pollutionExpiry')
        .optional()
        .isISO8601()
        .withMessage('Pollution expiry must be a valid date'),
    body('driverName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Driver name cannot exceed 100 characters'),
    body('driverMobile')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit mobile number'),
    body('driverLicense')
        .optional()
        .trim(),
    body('notes')
        .optional()
        .trim(),
];

const updateVehicleValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid vehicle ID'),
    body('vehicleType')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Vehicle type cannot exceed 50 characters'),
    body('vehicleCapacity')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Vehicle capacity must be a positive number'),
    body('rcNumber')
        .optional()
        .trim(),
    body('rcExpiry')
        .optional()
        .isISO8601()
        .withMessage('RC expiry must be a valid date'),
    body('insuranceNumber')
        .optional()
        .trim(),
    body('insuranceExpiry')
        .optional()
        .isISO8601()
        .withMessage('Insurance expiry must be a valid date'),
    body('fitnessExpiry')
        .optional()
        .isISO8601()
        .withMessage('Fitness expiry must be a valid date'),
    body('pollutionExpiry')
        .optional()
        .isISO8601()
        .withMessage('Pollution expiry must be a valid date'),
    body('driverName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Driver name cannot exceed 100 characters'),
    body('driverMobile')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit mobile number'),
    body('driverLicense')
        .optional()
        .trim(),
    body('notes')
        .optional()
        .trim(),
];

const documentTypeValidation = [
    param('type')
        .isIn(['rc', 'insurance', 'fitness', 'pollution', 'photo'])
        .withMessage('Invalid document type'),
];

module.exports = {
    createVehicleValidation,
    updateVehicleValidation,
    documentTypeValidation,
};
