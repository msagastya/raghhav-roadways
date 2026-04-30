const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { validate } = require('../middleware/validator');
const {
  createVehicleValidation,
  updateVehicleValidation,
  getVehiclesValidation,
  vehicleIdValidation,
} = require('../validations/vehicle.validation');

/**
 * @route   GET /api/v1/vehicles/search
 * @desc    Search vehicles (autocomplete)
 * @access  Private
 */
router.get(
  '/search',
  authenticateToken,
  checkPermission('master.vehicle.view'),
  vehicleController.searchVehicles
);

/**
 * @route   GET /api/v1/vehicles/expiring-documents
 * @desc    Get vehicles with expiring documents
 * @access  Private
 */
router.get(
  '/expiring-documents',
  authenticateToken,
  checkPermission('master.vehicle.view'),
  vehicleController.getExpiringDocuments
);

/**
 * @route   GET /api/v1/vehicles
 * @desc    Get all vehicles
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  checkPermission('master.vehicle.view'),
  getVehiclesValidation,
  validate,
  vehicleController.getVehicles
);

/**
 * @route   GET /api/v1/vehicles/:id
 * @desc    Get vehicle by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  checkPermission('master.vehicle.view'),
  vehicleIdValidation,
  validate,
  vehicleController.getVehicleById
);

/**
 * @route   POST /api/v1/vehicles
 * @desc    Create new vehicle
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  checkPermission('master.vehicle.create'),
  createVehicleValidation,
  validate,
  vehicleController.createVehicle
);

/**
 * @route   PATCH /api/v1/vehicles/:id
 * @desc    Update vehicle
 * @access  Private
 */
router.patch(
  '/:id',
  authenticateToken,
  checkPermission('master.vehicle.edit'),
  updateVehicleValidation,
  validate,
  vehicleController.updateVehicle
);

/**
 * @route   DELETE /api/v1/vehicles/:id
 * @desc    Delete vehicle
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('master.vehicle.delete'),
  vehicleIdValidation,
  validate,
  vehicleController.deleteVehicle
);

module.exports = router;
