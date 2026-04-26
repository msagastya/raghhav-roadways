const express = require('express');
const router = express.Router();
const agentVehicleController = require('../controllers/agent.vehicle.controller');
const { authenticateAgent, ensureAgentOwnership } = require('../middleware/agent.auth');
const { validate } = require('../middleware/validator');
const {
    createVehicleValidation,
    updateVehicleValidation,
    documentTypeValidation,
} = require('../validations/agent.vehicle.validation');
const multer = require('multer');
const path = require('path');

// Configure multer for document uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/vehicle-documents'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.agent.agentCode}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only jpeg, jpg, png, and pdf files are allowed'));
    }
});

// All routes require agent authentication
router.use(authenticateAgent);

/**
 * @route   GET /api/v1/agent/vehicles/expiring
 * @desc    Get vehicles with expiring documents
 * @access  Private (Agent)
 */
router.get('/expiring', agentVehicleController.getExpiringDocuments);

/**
 * @route   GET /api/v1/agent/vehicles
 * @desc    Get all vehicles for agent
 * @access  Private (Agent)
 */
router.get('/', agentVehicleController.getVehicles);

/**
 * @route   GET /api/v1/agent/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Private (Agent)
 */
router.get(
    '/:id',
    ensureAgentOwnership('vehicle'),
    agentVehicleController.getVehicleById
);

/**
 * @route   POST /api/v1/agent/vehicles
 * @desc    Create new vehicle
 * @access  Private (Agent)
 */
router.post(
    '/',
    createVehicleValidation,
    validate,
    agentVehicleController.createVehicle
);

/**
 * @route   PATCH /api/v1/agent/vehicles/:id
 * @desc    Update vehicle
 * @access  Private (Agent)
 */
router.patch(
    '/:id',
    ensureAgentOwnership('vehicle'),
    updateVehicleValidation,
    validate,
    agentVehicleController.updateVehicle
);

/**
 * @route   POST /api/v1/agent/vehicles/:id/documents/:type
 * @desc    Upload vehicle document
 * @access  Private (Agent)
 */
router.post(
    '/:id/documents/:type',
    ensureAgentOwnership('vehicle'),
    documentTypeValidation,
    validate,
    upload.single('document'),
    agentVehicleController.uploadDocument
);

/**
 * @route   DELETE /api/v1/agent/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private (Agent)
 */
router.delete(
    '/:id',
    ensureAgentOwnership('vehicle'),
    agentVehicleController.deleteVehicle
);

module.exports = router;
