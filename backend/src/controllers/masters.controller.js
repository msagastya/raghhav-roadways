const consignorConsigneeService = require('../services/consignor-consignee.service');
const invoicePartyService = require('../services/invoice-party.service');
const vehicleOwnerBrokerService = require('../services/vehicle-owner-broker.service');
const { asyncHandler } = require('../middleware/errorHandler');

// ===== CONSIGNOR/CONSIGNEE CONTROLLERS =====
const getConsignorConsignees = asyncHandler(async (req, res) => {
  const result = await consignorConsigneeService.getAll(req.query);
  res.status(200).json({ success: true, data: result });
});

const getConsignorConsigneeById = asyncHandler(async (req, res) => {
  const result = await consignorConsigneeService.getById(req.params.id);
  res.status(200).json({ success: true, data: result });
});

const createConsignorConsignee = asyncHandler(async (req, res) => {
  const result = await consignorConsigneeService.create(req.body);
  res.status(201).json({ success: true, message: 'Created successfully', data: result });
});

const updateConsignorConsignee = asyncHandler(async (req, res) => {
  const result = await consignorConsigneeService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Updated successfully', data: result });
});

const deleteConsignorConsignee = asyncHandler(async (req, res) => {
  await consignorConsigneeService.deleteRecord(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

const searchConsignorConsignees = asyncHandler(async (req, res) => {
  const result = await consignorConsigneeService.search(req.query.q, req.query.limit);
  res.status(200).json({ success: true, data: result });
});

// ===== INVOICE PARTY CONTROLLERS =====
const getInvoiceParties = asyncHandler(async (req, res) => {
  const result = await invoicePartyService.getAll(req.query);
  res.status(200).json({ success: true, data: result });
});

const getInvoicePartyById = asyncHandler(async (req, res) => {
  const result = await invoicePartyService.getById(req.params.id);
  res.status(200).json({ success: true, data: result });
});

const createInvoiceParty = asyncHandler(async (req, res) => {
  const result = await invoicePartyService.create(req.body);
  res.status(201).json({ success: true, message: 'Created successfully', data: result });
});

const updateInvoiceParty = asyncHandler(async (req, res) => {
  const result = await invoicePartyService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Updated successfully', data: result });
});

const deleteInvoiceParty = asyncHandler(async (req, res) => {
  await invoicePartyService.deleteRecord(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

const searchInvoiceParties = asyncHandler(async (req, res) => {
  const result = await invoicePartyService.search(req.query.q, req.query.limit);
  res.status(200).json({ success: true, data: result });
});

// ===== VEHICLE OWNER/BROKER CONTROLLERS =====
const getVehicleOwnerBrokers = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.getAll(req.query);
  res.status(200).json({ success: true, data: result });
});

const getVehicleOwnerBrokerById = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.getById(req.params.id);
  res.status(200).json({ success: true, data: result });
});

const createVehicleOwnerBroker = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.create(req.body);
  res.status(201).json({ success: true, message: 'Created successfully', data: result });
});

const updateVehicleOwnerBroker = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.update(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Updated successfully', data: result });
});

const deleteVehicleOwnerBroker = asyncHandler(async (req, res) => {
  await vehicleOwnerBrokerService.deleteRecord(req.params.id);
  res.status(200).json({ success: true, message: 'Deleted successfully' });
});

const searchVehicleOwnerBrokers = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.search(req.query.q, req.query.type, req.query.limit);
  res.status(200).json({ success: true, data: result });
});

const addVehicleToOwner = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.addVehicle(req.params.id, req.body);
  res.status(201).json({ success: true, message: 'Vehicle added successfully', data: result });
});

const updateOwnerVehicle = asyncHandler(async (req, res) => {
  const result = await vehicleOwnerBrokerService.updateVehicle(req.params.vehicleId, req.body);
  res.status(200).json({ success: true, message: 'Vehicle updated successfully', data: result });
});

const deleteOwnerVehicle = asyncHandler(async (req, res) => {
  await vehicleOwnerBrokerService.deleteVehicle(req.params.vehicleId);
  res.status(200).json({ success: true, message: 'Vehicle deleted successfully' });
});

module.exports = {
  // Consignor/Consignee
  getConsignorConsignees,
  getConsignorConsigneeById,
  createConsignorConsignee,
  updateConsignorConsignee,
  deleteConsignorConsignee,
  searchConsignorConsignees,
  // Invoice Party
  getInvoiceParties,
  getInvoicePartyById,
  createInvoiceParty,
  updateInvoiceParty,
  deleteInvoiceParty,
  searchInvoiceParties,
  // Vehicle Owner/Broker
  getVehicleOwnerBrokers,
  getVehicleOwnerBrokerById,
  createVehicleOwnerBroker,
  updateVehicleOwnerBroker,
  deleteVehicleOwnerBroker,
  searchVehicleOwnerBrokers,
  addVehicleToOwner,
  updateOwnerVehicle,
  deleteOwnerVehicle
};
