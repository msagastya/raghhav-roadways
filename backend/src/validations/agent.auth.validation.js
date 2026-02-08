const { body } = require('express-validator');

const agentRegisterValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
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
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .custom((value, { req }) => {
            if (value === req.body.oldPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),
    body('confirmPassword')
        .notEmpty()
        .withMessage('Please confirm your new password')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
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
