const express = require('express');
const router = express.Router();
const partyController = require('../controllers/party.controller');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { validate } = require('../middleware/validator');
const {
  createPartyValidation,
  updatePartyValidation,
  getPartiesValidation,
  partyIdValidation,
} = require('../validations/party.validation');

/**
 * @route   GET /api/v1/parties/search
 * @desc    Search parties (autocomplete)
 * @access  Private
 */
router.get(
  '/search',
  authenticateToken,
  checkPermission('master.party.view'),
  partyController.searchParties
);

/**
 * @route   GET /api/v1/parties
 * @desc    Get all parties
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  checkPermission('master.party.view'),
  getPartiesValidation,
  validate,
  partyController.getParties
);

/**
 * @route   GET /api/v1/parties/:id
 * @desc    Get party by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  checkPermission('master.party.view'),
  partyIdValidation,
  validate,
  partyController.getPartyById
);

/**
 * @route   POST /api/v1/parties
 * @desc    Create new party
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  checkPermission('master.party.create'),
  createPartyValidation,
  validate,
  partyController.createParty
);

/**
 * @route   PATCH /api/v1/parties/:id
 * @desc    Update party
 * @access  Private
 */
router.patch(
  '/:id',
  authenticateToken,
  checkPermission('master.party.edit'),
  updatePartyValidation,
  validate,
  partyController.updateParty
);

/**
 * @route   DELETE /api/v1/parties/:id
 * @desc    Delete party
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('master.party.delete'),
  partyIdValidation,
  validate,
  partyController.deleteParty
);

module.exports = router;
