const consignmentService = require('../services/consignment.service');
const pdfService = require('../services/pdf.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ApiError } = require('../middleware/errorHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get all consignments
 * GET /api/v1/consignments
 */
const getConsignments = asyncHandler(async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    consignorId: req.query.consignorId,
    consigneeId: req.query.consigneeId,
    vehicleId: req.query.vehicleId,
  };

  const result = await consignmentService.getConsignments(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get consignment by ID
 * GET /api/v1/consignments/:id
 */
const getConsignmentById = asyncHandler(async (req, res) => {
  const consignment = await consignmentService.getConsignmentById(req.params.id);

  res.status(200).json({
    success: true,
    data: consignment,
  });
});

/**
 * Create new consignment
 * POST /api/v1/consignments
 */
const createConsignment = asyncHandler(async (req, res) => {
  const consignment = await consignmentService.createConsignment(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  // Generate PDF if requested
  let pdfPath = null;
  if (req.body.generatePdf) {
    const consignmentWithDetails = await consignmentService.getConsignmentById(
      consignment.id
    );
    pdfPath = await pdfService.generateConsignmentNotePDF(consignmentWithDetails);

    // Update consignment with PDF path
    await consignmentService.updateConsignment(
      consignment.id,
      { consignmentNotePath: pdfPath },
      req.user.id,
      req.ip,
      req.get('user-agent')
    );
  }

  res.status(201).json({
    success: true,
    message: 'Consignment created successfully',
    data: {
      ...consignment,
      pdfUrl: pdfPath ? `/api/v1/consignments/${consignment.id}/download-note` : null,
    },
  });
});

/**
 * Update consignment
 * PATCH /api/v1/consignments/:id
 */
const updateConsignment = asyncHandler(async (req, res) => {
  const consignment = await consignmentService.updateConsignment(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Consignment updated successfully',
    data: consignment,
  });
});

/**
 * Update consignment status
 * PATCH /api/v1/consignments/:id/status
 */
const updateConsignmentStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;

  const consignment = await consignmentService.updateConsignmentStatus(
    req.params.id,
    status,
    remarks,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: `Status updated to ${status}`,
    data: consignment,
  });
});

/**
 * Delete consignment
 * DELETE /api/v1/consignments/:id
 */
const deleteConsignment = asyncHandler(async (req, res) => {
  await consignmentService.deleteConsignment(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Consignment deleted successfully',
  });
});

/**
 * Get consignments for invoicing
 * GET /api/v1/consignments/for-invoicing/:partyId
 */
const getConsignmentsForInvoicing = asyncHandler(async (req, res) => {
  const consignments = await consignmentService.getConsignmentsForInvoicing(
    req.params.partyId
  );

  res.status(200).json({
    success: true,
    data: consignments,
  });
});

/**
 * Upload challan document
 * POST /api/v1/consignments/:id/upload-challan
 */
const uploadChallan = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Challan file is required');
  }

  // Move file to appropriate location
  const fileName = `${req.params.id}_challan_${Date.now()}${path.extname(
    req.file.originalname
  )}`;
  const filePath = path.join('challans', new Date().getFullYear().toString(), fileName);
  const fullPath = path.join(__dirname, '../../storage', filePath);

  // Ensure directory exists
  const dir = path.dirname(fullPath);
  await fs.mkdir(dir, { recursive: true });

  // Move file
  await fs.rename(req.file.path, fullPath);

  // Update consignment
  const consignment = await consignmentService.uploadChallan(
    req.params.id,
    filePath,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Challan uploaded successfully',
    data: {
      filePath,
    },
  });
});

/**
 * Download consignment note PDF
 * GET /api/v1/consignments/:id/download-note
 */
const downloadConsignmentNote = asyncHandler(async (req, res) => {
  const consignment = await consignmentService.getConsignmentById(req.params.id);

  // Generate PDF if not exists
  let pdfPath = consignment.consignmentNotePath;
  if (!pdfPath) {
    pdfPath = await pdfService.generateConsignmentNotePDF(consignment);
    await consignmentService.updateConsignment(
      consignment.id,
      { consignmentNotePath: pdfPath },
      req.user.id,
      req.ip,
      req.get('user-agent')
    );
  }

  // Get PDF file
  const pdfBuffer = await pdfService.getPDFFile(pdfPath);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${consignment.grNumber}_Consignment_Note.pdf"`
  );
  res.send(pdfBuffer);
});

/**
 * Get status summary
 * GET /api/v1/consignments/summary/status
 */
const getStatusSummary = asyncHandler(async (req, res) => {
  const summary = await consignmentService.getStatusSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * Get today's bookings
 * GET /api/v1/consignments/summary/today
 */
const getTodaysBookings = asyncHandler(async (req, res) => {
  const result = await consignmentService.getTodaysBookings();

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get pending deliveries
 * GET /api/v1/consignments/summary/pending
 */
const getPendingDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await consignmentService.getPendingDeliveries();

  res.status(200).json({
    success: true,
    data: deliveries,
  });
});

module.exports = {
  getConsignments,
  getConsignmentById,
  createConsignment,
  updateConsignment,
  updateConsignmentStatus,
  deleteConsignment,
  getConsignmentsForInvoicing,
  uploadChallan,
  downloadConsignmentNote,
  getStatusSummary,
  getTodaysBookings,
  getPendingDeliveries,
};
