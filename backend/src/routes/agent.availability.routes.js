const express = require('express');
const router = express.Router();
const agentAvailabilityController = require('../controllers/agent.availability.controller');
const { authenticateAgent, ensureAgentOwnership } = require('../middleware/agent.auth');
const { validate } = require('../middleware/validator');
const { body, param, query } = require('express-validator');

// Validation rules
const setAvailabilityValidation = [
    body('vehicleId')
        .isInt({ min: 1 })
        .withMessage('Valid vehicle ID is required'),
    body('date')
        .isISO8601()
        .withMessage('Valid date is required'),
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),
    body('startTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('Start time must be in HH:MM format'),
    body('endTime')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('End time must be in HH:MM format'),
    body('preferredRoutes')
        .optional()
        .trim(),
    body('notes')
        .optional()
        .trim(),
];

const bulkAvailabilityValidation = [
    body('vehicleId')
        .isInt({ min: 1 })
        .withMessage('Valid vehicle ID is required'),
    body('dates')
        .isArray({ min: 1 })
        .withMessage('At least one date is required'),
    body('dates.*')
        .isISO8601()
        .withMessage('Each date must be valid'),
    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),
];

const toggleAvailabilityValidation = [
    body('vehicleId')
        .isInt({ min: 1 })
        .withMessage('Valid vehicle ID is required'),
    body('date')
        .isISO8601()
        .withMessage('Valid date is required'),
];

// All routes require agent authentication
router.use(authenticateAgent);

/**
 * @route   GET /api/v1/agent/availability
 * @desc    Get availability records
 * @access  Private (Agent)
 */
router.get('/', agentAvailabilityController.getAvailability);

/**
 * @route   GET /api/v1/agent/availability/calendar/:vehicleId
 * @desc    Get calendar view for vehicle
 * @access  Private (Agent)
 */
router.get(
    '/calendar/:vehicleId',
    param('vehicleId').isInt({ min: 1 }),
    validate,
    agentAvailabilityController.getCalendar
);

/**
 * @route   POST /api/v1/agent/availability
 * @desc    Set availability for a date
 * @access  Private (Agent)
 */
router.post(
    '/',
    setAvailabilityValidation,
    validate,
    agentAvailabilityController.setAvailability
);

/**
 * @route   POST /api/v1/agent/availability/bulk
 * @desc    Set availability for multiple dates
 * @access  Private (Agent)
 */
router.post(
    '/bulk',
    bulkAvailabilityValidation,
    validate,
    agentAvailabilityController.setBulkAvailability
);

/**
 * @route   POST /api/v1/agent/availability/toggle
 * @desc    Toggle availability status
 * @access  Private (Agent)
 */
router.post(
    '/toggle',
    toggleAvailabilityValidation,
    validate,
    agentAvailabilityController.toggleAvailability
);

/**
 * @route   PATCH /api/v1/agent/availability/:id
 * @desc    Update availability
 * @access  Private (Agent)
 */
router.patch(
    '/:id',
    param('id').isInt({ min: 1 }),
    ensureAgentOwnership('availability'),
    validate,
    agentAvailabilityController.updateAvailability
);

/**
 * @route   DELETE /api/v1/agent/availability/:id
 * @desc    Delete availability
 * @access  Private (Agent)
 */
router.delete(
    '/:id',
    param('id').isInt({ min: 1 }),
    ensureAgentOwnership('availability'),
    validate,
    agentAvailabilityController.deleteAvailability
);

module.exports = router;
