const partyService = require('../services/party.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all parties
 * GET /api/v1/parties
 */
const getParties = asyncHandler(async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    type: req.query.type,
    isActive: req.query.isActive,
  };

  const result = await partyService.getParties(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get party by ID
 * GET /api/v1/parties/:id
 */
const getPartyById = asyncHandler(async (req, res) => {
  const party = await partyService.getPartyById(req.params.id);

  res.status(200).json({
    success: true,
    data: party,
  });
});

/**
 * Create new party
 * POST /api/v1/parties
 */
const createParty = asyncHandler(async (req, res) => {
  const party = await partyService.createParty(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Party created successfully',
    data: party,
  });
});

/**
 * Update party
 * PATCH /api/v1/parties/:id
 */
const updateParty = asyncHandler(async (req, res) => {
  const party = await partyService.updateParty(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Party updated successfully',
    data: party,
  });
});

/**
 * Delete party
 * DELETE /api/v1/parties/:id
 */
const deleteParty = asyncHandler(async (req, res) => {
  await partyService.deleteParty(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Party deleted successfully',
  });
});

/**
 * Search parties (autocomplete)
 * GET /api/v1/parties/search
 */
const searchParties = asyncHandler(async (req, res) => {
  const { q, type, limit } = req.query;

  const parties = await partyService.searchParties(q, type, limit);

  res.status(200).json({
    success: true,
    data: parties,
  });
});

module.exports = {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  searchParties,
};
