const agentVehicleService = require('../services/agent.vehicle.service');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all vehicles for agent
 * GET /api/v1/agent/vehicles
 */
const getVehicles = asyncHandler(async (req, res) => {
    const filters = {
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        isActive: req.query.isActive,
    };

    const result = await agentVehicleService.getVehicles(req.agent.id, filters);

    res.status(200).json({
        success: true,
        data: result,
    });
});

/**
 * Get vehicle by ID
 * GET /api/v1/agent/vehicles/:id
 */
const getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await agentVehicleService.getVehicleById(
        req.agent.id,
        parseInt(req.params.id)
    );

    res.status(200).json({
        success: true,
        data: vehicle,
    });
});

/**
 * Create new vehicle
 * POST /api/v1/agent/vehicles
 */
const createVehicle = asyncHandler(async (req, res) => {
    const vehicle = await agentVehicleService.createVehicle(req.agent.id, req.body);

    logger.info(`Agent ${req.agent.agentCode} added vehicle ${vehicle.vehicleNo}`);

    res.status(201).json({
        success: true,
        message: 'Vehicle added successfully. It will be verified by our team.',
        data: vehicle,
    });
});

/**
 * Update vehicle
 * PATCH /api/v1/agent/vehicles/:id
 */
const updateVehicle = asyncHandler(async (req, res) => {
    const vehicle = await agentVehicleService.updateVehicle(
        req.agent.id,
        parseInt(req.params.id),
        req.body
    );

    res.status(200).json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle,
    });
});

/**
 * Upload vehicle document
 * POST /api/v1/agent/vehicles/:id/documents/:type
 */
const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }

    const filePath = `/uploads/vehicle-documents/${req.file.filename}`;
    const vehicle = await agentVehicleService.uploadDocument(
        req.agent.id,
        parseInt(req.params.id),
        req.params.type,
        filePath
    );

    res.status(200).json({
        success: true,
        message: 'Document uploaded successfully',
        data: vehicle,
    });
});

/**
 * Delete vehicle
 * DELETE /api/v1/agent/vehicles/:id
 */
const deleteVehicle = asyncHandler(async (req, res) => {
    await agentVehicleService.deleteVehicle(req.agent.id, parseInt(req.params.id));

    res.status(200).json({
        success: true,
        message: 'Vehicle removed successfully',
    });
});

/**
 * Get expiring documents
 * GET /api/v1/agent/vehicles/expiring
 */
const getExpiringDocuments = asyncHandler(async (req, res) => {
    const daysAhead = req.query.days || 30;
    const documents = await agentVehicleService.getExpiringDocuments(
        req.agent.id,
        daysAhead
    );

    res.status(200).json({
        success: true,
        data: documents,
    });
});

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    uploadDocument,
    deleteVehicle,
    getExpiringDocuments,
};
