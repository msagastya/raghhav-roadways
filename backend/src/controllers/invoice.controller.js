const invoiceService = require('../services/invoice.service');
const pdfService = require('../services/pdf.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all invoices
 * GET /api/v1/invoices
 */
const getInvoices = asyncHandler(async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    paymentStatus: req.query.paymentStatus,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    partyId: req.query.partyId,
  };

  const result = await invoiceService.getInvoices(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get invoice by ID
 * GET /api/v1/invoices/:id
 */
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);

  res.status(200).json({
    success: true,
    data: invoice,
  });
});

/**
 * Create new invoice
 * POST /api/v1/invoices
 */
const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  // Generate PDF if requested
  let pdfPath = null;
  if (req.body.generatePdf !== false) {
    const invoiceWithDetails = await invoiceService.getInvoiceById(invoice.id);
    pdfPath = await pdfService.generateInvoicePDF(invoiceWithDetails);

    // Update invoice with PDF path
    await invoiceService.updateInvoice(
      invoice.id,
      { pdfFilePath: pdfPath, pdfGenerated: true },
      req.user.id,
      req.ip,
      req.get('user-agent')
    );
  }

  res.status(201).json({
    success: true,
    message: 'Invoice generated successfully',
    data: {
      ...invoice,
      pdfUrl: pdfPath ? `/api/v1/invoices/${invoice.id}/download` : null,
    },
  });
});

/**
 * Update invoice
 * PATCH /api/v1/invoices/:id
 */
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Invoice updated successfully',
    data: invoice,
  });
});

/**
 * Delete invoice
 * DELETE /api/v1/invoices/:id
 */
const deleteInvoice = asyncHandler(async (req, res) => {
  await invoiceService.deleteInvoice(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Invoice deleted successfully',
  });
});

/**
 * Download invoice PDF
 * GET /api/v1/invoices/:id/download
 */
const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);

  // Generate PDF if not exists
  let pdfPath = invoice.pdfFilePath;
  if (!pdfPath) {
    pdfPath = await pdfService.generateInvoicePDF(invoice);
    await invoiceService.updateInvoice(
      invoice.id,
      { pdfFilePath: pdfPath, pdfGenerated: true },
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
    `attachment; filename="${invoice.invoiceNumber}_Invoice.pdf"`
  );
  res.send(pdfBuffer);
});

/**
 * Get overdue invoices
 * GET /api/v1/invoices/overdue
 */
const getOverdueInvoices = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.getOverdueInvoices();

  res.status(200).json({
    success: true,
    data: invoices,
  });
});

/**
 * Get payment summary
 * GET /api/v1/invoices/summary/payments
 */
const getPaymentSummary = asyncHandler(async (req, res) => {
  const summary = await invoiceService.getPaymentSummary();

  res.status(200).json({
    success: true,
    data: summary,
  });
});

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
  getOverdueInvoices,
  getPaymentSummary,
};
