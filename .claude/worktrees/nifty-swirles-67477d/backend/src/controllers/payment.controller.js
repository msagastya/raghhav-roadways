const paymentService = require('../services/payment.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all payments
 * GET /api/v1/payments
 */
const getPayments = asyncHandler(async (req, res) => {
  const filters = {
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    fromDate: req.query.fromDate,
    toDate: req.query.toDate,
    partyId: req.query.partyId,
    invoiceId: req.query.invoiceId,
    paymentStatus: req.query.paymentStatus,
  };

  const result = await paymentService.getPayments(filters);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get payment by ID
 * GET /api/v1/payments/:id
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.params.id);

  res.status(200).json({
    success: true,
    data: payment,
  });
});

/**
 * Create new payment
 * POST /api/v1/payments
 */
const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Payment recorded successfully',
    data: payment,
  });
});

/**
 * Delete payment
 * DELETE /api/v1/payments/:id
 */
const deletePayment = asyncHandler(async (req, res) => {
  await paymentService.deletePayment(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Payment deleted successfully',
  });
});

/**
 * Get today's payments
 * GET /api/v1/payments/summary/today
 */
const getTodaysPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.getTodaysPayments();

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get payments by invoice
 * GET /api/v1/payments/invoice/:invoiceId
 */
const getPaymentsByInvoice = asyncHandler(async (req, res) => {
  const payments = await paymentService.getPaymentsByInvoice(req.params.invoiceId);

  res.status(200).json({
    success: true,
    data: payments,
  });
});

/**
 * Get payments by party
 * GET /api/v1/payments/party/:partyId
 */
const getPaymentsByParty = asyncHandler(async (req, res) => {
  const { fromDate, toDate } = req.query;

  const payments = await paymentService.getPaymentsByParty(
    req.params.partyId,
    fromDate,
    toDate
  );

  res.status(200).json({
    success: true,
    data: payments,
  });
});

/**
 * Create payment amendment
 * POST /api/v1/payment-amendments
 */
const createPaymentAmendment = asyncHandler(async (req, res) => {
  const amendment = await paymentService.createPaymentAmendment(
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Amendment submitted for approval',
    data: amendment,
  });
});

/**
 * Get pending amendments
 * GET /api/v1/payment-amendments/pending
 */
const getPendingAmendments = asyncHandler(async (req, res) => {
  const amendments = await paymentService.getPendingAmendments();

  res.status(200).json({
    success: true,
    data: amendments,
  });
});

/**
 * Approve payment amendment
 * PATCH /api/v1/payment-amendments/:id/approve
 */
const approvePaymentAmendment = asyncHandler(async (req, res) => {
  const amendment = await paymentService.approvePaymentAmendment(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Amendment approved successfully',
    data: amendment,
  });
});

/**
 * Reject payment amendment
 * PATCH /api/v1/payment-amendments/:id/reject
 */
const rejectPaymentAmendment = asyncHandler(async (req, res) => {
  await paymentService.rejectPaymentAmendment(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Amendment rejected successfully',
  });
});

/**
 * Update payment (edit total amount)
 * PATCH /api/v1/payments/:id
 */
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.updatePayment(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Payment updated successfully',
    data: payment,
  });
});

/**
 * Add payment transaction (partial payment)
 * POST /api/v1/payments/:id/transactions
 */
const addPaymentTransaction = asyncHandler(async (req, res) => {
  const transaction = await paymentService.addPaymentTransaction(
    req.params.id,
    req.body,
    req.user.id,
    req.ip,
    req.get('user-agent'),
    req.file
  );

  res.status(201).json({
    success: true,
    message: 'Payment transaction added successfully',
    data: transaction,
  });
});

/**
 * Delete payment transaction
 * DELETE /api/v1/payment-transactions/:id
 */
const deletePaymentTransaction = asyncHandler(async (req, res) => {
  await paymentService.deletePaymentTransaction(
    req.params.id,
    req.user.id,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Payment transaction deleted successfully',
  });
});

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getTodaysPayments,
  getPaymentsByInvoice,
  getPaymentsByParty,
  addPaymentTransaction,
  deletePaymentTransaction,
  createPaymentAmendment,
  getPendingAmendments,
  approvePaymentAmendment,
  rejectPaymentAmendment,
};
