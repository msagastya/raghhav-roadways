const vehicleService = require('../services/vehicle.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all vehicles
 * GET /api/v1/vehicles
 */
const getVehicles = asyncHandler(async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    ownerType: req.query.ownerType,
    isActive: req.query.isActive,
  };

  const result = await vehicleService.getVehicles(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get vehicle by ID
 * GET /api/v1/vehicles/:id
 */
const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id);

  res.status(200).json({
    success: true,
    data: vehicle,
  });
});

/**
 * Create new vehicle
 * POST /api/v1/vehicles
 */
const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Vehicle created successfully',
    data: vehicle,
  });
});

/**
 * Update vehicle
 * PATCH /api/v1/vehicles/:id
 */
const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Vehicle updated successfully',
    data: vehicle,
  });
});

/**
 * Delete vehicle
 * DELETE /api/v1/vehicles/:id
 */
const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Vehicle deleted successfully',
  });
});

/**
 * Search vehicles (autocomplete)
 * GET /api/v1/vehicles/search
 */
const searchVehicles = asyncHandler(async (req, res) => {
  const { q, limit } = req.query;

  const vehicles = await vehicleService.searchVehicles(q, limit);

  res.status(200).json({
    success: true,
    data: vehicles,
  });
});

/**
 * Get vehicles with expiring documents
 * GET /api/v1/vehicles/expiring-documents
 */
const getExpiringDocuments = asyncHandler(async (req, res) => {
  const daysAhead = req.query.days || 30;

  const documents = await vehicleService.getExpiringDocuments(daysAhead);

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
  deleteVehicle,
  searchVehicles,
  getExpiringDocuments,
};
