const agentAvailabilityService = require('../services/agent.availability.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get availability records
 * GET /api/v1/agent/availability
 */
const getAvailability = asyncHandler(async (req, res) => {
    const filters = {
        vehicleId: req.query.vehicleId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        isAvailable: req.query.isAvailable,
    };

    const availability = await agentAvailabilityService.getAvailability(
        req.agent.id,
        filters
    );

    res.status(200).json({
        success: true,
        data: availability,
    });
});

/**
 * Get calendar for a vehicle
 * GET /api/v1/agent/availability/calendar/:vehicleId
 */
const getCalendar = asyncHandler(async (req, res) => {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const calendar = await agentAvailabilityService.getCalendar(
        req.agent.id,
        parseInt(req.params.vehicleId),
        month
    );

    res.status(200).json({
        success: true,
        data: calendar,
    });
});

/**
 * Set availability
 * POST /api/v1/agent/availability
 */
const setAvailability = asyncHandler(async (req, res) => {
    const availability = await agentAvailabilityService.setAvailability(
        req.agent.id,
        req.body
    );

    res.status(201).json({
        success: true,
        message: 'Availability set successfully',
        data: availability,
    });
});

/**
 * Set bulk availability
 * POST /api/v1/agent/availability/bulk
 */
const setBulkAvailability = asyncHandler(async (req, res) => {
    const result = await agentAvailabilityService.setBulkAvailability(
        req.agent.id,
        req.body
    );

    res.status(201).json({
        success: true,
        message: `Availability updated for ${result.datesUpdated} dates`,
        data: result,
    });
});

/**
 * Update availability
 * PATCH /api/v1/agent/availability/:id
 */
const updateAvailability = asyncHandler(async (req, res) => {
    const availability = await agentAvailabilityService.updateAvailability(
        req.agent.id,
        parseInt(req.params.id),
        req.body
    );

    res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: availability,
    });
});

/**
 * Delete availability
 * DELETE /api/v1/agent/availability/:id
 */
const deleteAvailability = asyncHandler(async (req, res) => {
    await agentAvailabilityService.deleteAvailability(
        req.agent.id,
        parseInt(req.params.id)
    );

    res.status(200).json({
        success: true,
        message: 'Availability removed',
    });
});

/**
 * Toggle availability
 * POST /api/v1/agent/availability/toggle
 */
const toggleAvailability = asyncHandler(async (req, res) => {
    const { vehicleId, date } = req.body;

    const result = await agentAvailabilityService.toggleAvailability(
        req.agent.id,
        vehicleId,
        date
    );

    res.status(200).json({
        success: true,
        message: result.isAvailable ? 'Marked as available' : 'Marked as unavailable',
        data: result,
    });
});

module.exports = {
    getAvailability,
    getCalendar,
    setAvailability,
    setBulkAvailability,
    updateAvailability,
    deleteAvailability,
    toggleAvailability,
};
