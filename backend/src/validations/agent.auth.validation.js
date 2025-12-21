const { body } = require('express-validator');

const agentRegisterValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),
    body('mobile')
        .trim()
        .notEmpty()
        .withMessage('Mobile number is required')
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian mobile number'),
    body('address')
        .optional()
        .trim(),
    body('cityId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid city'),
    body('stateId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid state'),
    body('pincode')
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Please provide a valid 6-digit pincode'),
];

const agentLoginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

const agentRefreshTokenValidation = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
];

const agentChangePasswordValidation = [
    body('oldPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters'),
];

const agentProfileUpdateValidation = [
    body('fullName')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Full name must be between 1 and 100 characters'),
    body('mobile')
        .optional()
        .matches(/^[6-9]\d{9}$/)
        .withMessage('Please provide a valid 10-digit Indian mobile number'),
    body('address')
        .optional()
        .trim(),
    body('cityId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid city'),
    body('stateId')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid state'),
    body('pincode')
        .optional()
        .matches(/^\d{6}$/)
        .withMessage('Please provide a valid 6-digit pincode'),
];

module.exports = {
    agentRegisterValidation,
    agentLoginValidation,
    agentRefreshTokenValidation,
    agentChangePasswordValidation,
    agentProfileUpdateValidation,
};
