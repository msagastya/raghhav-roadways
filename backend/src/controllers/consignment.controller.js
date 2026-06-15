const consignmentService = require('../services/consignment.service');
const pdfService = require('../services/pdf.service');
const { asyncHandler } = require('../middleware/errorHandler');
const { ApiError } = require('../middleware/errorHandler');
const firebaseStorage = require('../services/firebaseStorage.service');
const pdfQueue = require('../services/pdfQueue');
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

  // Generate PDF in the background if requested
  if (req.body.generatePdf) {
    const userId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');
    
    pdfQueue.enqueue(async () => {
      const consignmentWithDetails = await consignmentService.getConsignmentById(consignment.id);
      const generatedPath = await pdfService.generateConsignmentNotePDF(consignmentWithDetails);
      
      await consignmentService.updateConsignment(
        consignment.id,
        { consignmentNotePath: generatedPath },
        userId,
        ipAddress,
        userAgent
      );
    }, `generate-note-GR-${consignment.grNumber || consignment.id}`);
  }

  res.status(201).json({
    success: true,
    message: 'Consignment created successfully',
    data: {
      ...consignment,
      pdfUrl: req.body.generatePdf ? `/api/v1/consignments/${consignment.id}/download-note` : null,
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

  const fileName = `${req.params.id}_challan_${Date.now()}${path.extname(
    req.file.originalname
  )}`;
  const destinationPath = `challans/${new Date().getFullYear()}/${fileName}`;

  // Upload to Firebase (cleans up local temp file automatically)
  const uploadedPath = await firebaseStorage.uploadLocalFile(
    req.file.path,
    destinationPath,
    req.file.mimetype,
    true
  );

  // Update consignment
  const consignment = await consignmentService.uploadChallan(
    req.params.id,
    uploadedPath,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Challan uploaded successfully',
    data: {
      filePath: uploadedPath,
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

  // If pdfPath is a Firebase URL, redirect to it
  if (pdfPath && (pdfPath.startsWith('http://') || pdfPath.startsWith('https://'))) {
    return res.redirect(pdfPath);
  }

  // Get PDF file (local fallback)
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
