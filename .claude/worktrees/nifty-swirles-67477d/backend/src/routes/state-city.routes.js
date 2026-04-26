const express = require('express');
const router = express.Router();
const stateCityController = require('../controllers/state-city.controller');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/v1/masters/cities/search
 * @desc    Search cities
 * @access  Private
 */
router.get('/cities/search', authenticateToken, stateCityController.searchCities);

/**
 * @route   GET /api/v1/masters/states
 * @desc    Get all states
 * @access  Private
 */
router.get('/states', authenticateToken, stateCityController.getStates);

/**
 * @route   GET /api/v1/masters/states/:stateId/cities
 * @desc    Get cities by state
 * @access  Private
 */
router.get('/states/:stateId/cities', authenticateToken, stateCityController.getCitiesByState);

/**
 * @route   GET /api/v1/masters/cities
 * @desc    Get all cities
 * @access  Private
 */
router.get('/cities', authenticateToken, stateCityController.getAllCities);

/**
 * @route   POST /api/v1/masters/cities
 * @desc    Add new city
 * @access  Private
 */
router.post('/cities', authenticateToken, stateCityController.addCity);

module.exports = router;
