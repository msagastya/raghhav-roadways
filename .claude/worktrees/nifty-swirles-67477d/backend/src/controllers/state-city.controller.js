const stateCityService = require('../services/state-city.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all states
 * GET /api/v1/masters/states
 */
const getStates = asyncHandler(async (req, res) => {
  const states = await stateCityService.getStates();

  res.status(200).json({
    success: true,
    data: states
  });
});

/**
 * Get cities by state
 * GET /api/v1/masters/states/:stateId/cities
 */
const getCitiesByState = asyncHandler(async (req, res) => {
  const cities = await stateCityService.getCitiesByState(req.params.stateId);

  res.status(200).json({
    success: true,
    data: cities
  });
});

/**
 * Get all cities
 * GET /api/v1/masters/cities
 */
const getAllCities = asyncHandler(async (req, res) => {
  const cities = await stateCityService.getAllCities();

  res.status(200).json({
    success: true,
    data: cities
  });
});

/**
 * Add new city
 * POST /api/v1/masters/cities
 */
const addCity = asyncHandler(async (req, res) => {
  const city = await stateCityService.addCity(req.body);

  res.status(201).json({
    success: true,
    message: 'City added successfully',
    data: city
  });
});

/**
 * Search cities
 * GET /api/v1/masters/cities/search
 */
const searchCities = asyncHandler(async (req, res) => {
  const { q, stateId } = req.query;
  const cities = await stateCityService.searchCities(q, stateId);

  res.status(200).json({
    success: true,
    data: cities
  });
});

module.exports = {
  getStates,
  getCitiesByState,
  getAllCities,
  addCity,
  searchCities
};
