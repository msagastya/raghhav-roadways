const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { generateCode, getPaginationMeta } = require('../utils/helpers');
const { createAuditLog } = require('../utils/auditLog');
const { AUDIT_ACTION } = require('../config/constants');
const { updatePaymentStatus } = require('./invoice.service');

/**
 * Get all payments with pagination and filters
 */
const getPayments = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    fromDate = null,
    toDate = null,
    partyId = null,
    invoiceId = null,
    paymentStatus = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { paymentNumber: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (fromDate) {
    where.paymentDate = {
      ...where.paymentDate,
      gte: new Date(fromDate),
    };
  }

  if (toDate) {
    where.paymentDate = {
      ...where.paymentDate,
      lte: new Date(toDate),
    };
  }

  if (partyId) {
    where.partyId = parseInt(partyId);
  }

  if (invoiceId) {
    where.invoiceId = parseInt(invoiceId);
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  // Get total count
  const totalRecords = await prisma.payment.count({ where });

  // Get payments
  const payments = await prisma.payment.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { paymentDate: 'desc' },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          balanceAmount: true,
        },
      },
      party: {
        select: {
          id: true,
          partyName: true,
        },
      },
      transactions: {
        orderBy: { transactionDate: 'desc' },
        take: 1, // Latest transaction
      },
      createdBy: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  return {
    payments,
    pagination: getPaginationMeta(totalRecords, parseInt(page), parseInt(limit)),
  };
};

/**
 * Get payment by ID
 */
const getPaymentById = async (id) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(id) },
    include: {
      invoice: {
        include: {
          party: {
            select: {
              partyName: true,
              gstin: true,
            },
          },
        },
      },
      party: true,
      transactions: {
        orderBy: { transactionDate: 'desc' },
        include: {
          createdBy: {
            select: {
              username: true,
              fullName: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  if (!payment || payment.isDeleted) {
    throw new ApiError(404, 'Payment not found');
  }

  return payment;
};

/**
 * Create new payment (planned payment)
 */
const createPayment = async (data, userId, ipAddress, userAgent) => {
  const { invoiceId, partyId, totalAmount, description } = data;

  // Validate that either invoiceId or partyId is provided
  if (!invoiceId && !partyId) {
    throw new ApiError(400, 'Either invoice ID or party ID is required');
  }

  if (!totalAmount || Number(totalAmount) <= 0) {
    throw new ApiError(400, 'Total amount must be greater than 0');
  }

  let invoice = null;
  let party = null;

  // If invoice payment
  if (invoiceId) {
    invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        party: true,
      },
    });

    if (!invoice || invoice.isDeleted) {
      throw new ApiError(404, 'Invoice not found');
    }

    party = invoice.party;
  } else {
    // Direct payment to party
    party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party || party.isDeleted) {
      throw new ApiError(404, 'Party not found');
    }
  }

  // Generate payment number
  const lastPayment = await prisma.payment.findFirst({
    orderBy: { paymentNumber: 'desc' },
  });

  const lastNumber = lastPayment
    ? parseInt(lastPayment.paymentNumber.replace('PAY', ''))
    : 0;
  const paymentNumber = generateCode('PAY', lastNumber, 4);

  // Create payment
  const payment = await prisma.payment.create({
    data: {
      paymentNumber,
      paymentDate: new Date(data.paymentDate || new Date()),
      invoiceId: invoiceId || null,
      partyId: party.id,
      description: description || null,
      totalAmount: Number(totalAmount),
      paidAmount: 0,
      balanceAmount: Number(totalAmount),
      paymentStatus: 'Pending',
      createdById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payments',
    recordId: payment.id,
    action: AUDIT_ACTION.CREATE,
    newValues: payment,
    userId,
    ipAddress,
    userAgent,
  });

  return payment;
};

/**
 * Update payment (edit total amount)
 */
const updatePayment = async (id, data, userId, ipAddress, userAgent) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!payment || payment.isDeleted) {
    throw new ApiError(404, 'Payment not found');
  }

  const { totalAmount, description, paymentDate } = data;

  const updateData = {};

  if (totalAmount !== undefined) {
    const newTotalAmount = Number(totalAmount);
    if (newTotalAmount <= 0) {
      throw new ApiError(400, 'Total amount must be greater than 0');
    }
    if (newTotalAmount < Number(payment.paidAmount)) {
      throw new ApiError(
        400,
        `Total amount cannot be less than paid amount (₹${payment.paidAmount})`
      );
    }
    updateData.totalAmount = newTotalAmount;
    updateData.balanceAmount = newTotalAmount - Number(payment.paidAmount);
  }

  if (description !== undefined) {
    updateData.description = description;
  }

  if (paymentDate !== undefined) {
    updateData.paymentDate = new Date(paymentDate);
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payments',
    recordId: parseInt(id),
    action: AUDIT_ACTION.UPDATE,
    oldValues: payment,
    newValues: updatedPayment,
    userId,
    ipAddress,
    userAgent,
  });

  return updatedPayment;
};

/**
 * Add payment transaction (partial payment)
 */
const addPaymentTransaction = async (paymentId, data, userId, ipAddress, userAgent, file = null) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(paymentId) },
  });

  if (!payment || payment.isDeleted) {
    throw new ApiError(404, 'Payment not found');
  }

  const { amount, transactionDate, paymentMode, paymentReference, bankName, bankAccountNo, bankIfsc, upiId, remarks } = data;

  if (!amount || Number(amount) <= 0) {
    throw new ApiError(400, 'Transaction amount must be greater than 0');
  }

  if (Number(amount) > Number(payment.balanceAmount)) {
    throw new ApiError(
      400,
      `Transaction amount (₹${amount}) exceeds balance amount (₹${payment.balanceAmount})`
    );
  }

  // Calculate new amounts
  const newPaidAmount = Number(payment.paidAmount) + Number(amount);
  const newBalanceAmount = Number(payment.totalAmount) - newPaidAmount;
  const newStatus = newBalanceAmount === 0 ? 'Completed' : newPaidAmount > 0 ? 'Partial' : 'Pending';

  // Create transaction in database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment transaction
    const transaction = await tx.paymentTransaction.create({
      data: {
        paymentId: parseInt(paymentId),
        transactionDate: new Date(transactionDate || new Date()),
        amount: Number(amount),
        paymentMode: paymentMode || null,
        paymentReference: paymentReference || null,
        bankName: bankName || null,
        bankAccountNo: bankAccountNo || null,
        bankIfsc: bankIfsc || null,
        upiId: upiId || null,
        receiptFilePath: file ? file.path : null,
        remarks: remarks || null,
        createdById: userId,
      },
    });

    // Update payment
    await tx.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newStatus,
      },
    });

    return transaction;
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payment_transactions',
    recordId: result.id,
    action: AUDIT_ACTION.CREATE,
    newValues: result,
    userId,
    ipAddress,
    userAgent,
  });

  return result;
};

/**
 * Delete payment transaction
 */
const deletePaymentTransaction = async (transactionId, userId, ipAddress, userAgent) => {
  const transaction = await prisma.paymentTransaction.findUnique({
    where: { id: parseInt(transactionId) },
    include: {
      payment: true,
    },
  });

  if (!transaction) {
    throw new ApiError(404, 'Payment transaction not found');
  }

  const payment = transaction.payment;

  // Calculate new amounts
  const newPaidAmount = Number(payment.paidAmount) - Number(transaction.amount);
  const newBalanceAmount = Number(payment.totalAmount) - newPaidAmount;
  const newStatus = newBalanceAmount === 0 ? 'Completed' : newPaidAmount > 0 ? 'Partial' : 'Pending';

  // Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Delete transaction
    await tx.paymentTransaction.delete({
      where: { id: parseInt(transactionId) },
    });

    // Update payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        paymentStatus: newStatus,
      },
    });
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payment_transactions',
    recordId: parseInt(transactionId),
    action: AUDIT_ACTION.DELETE,
    oldValues: transaction,
    userId,
    ipAddress,
    userAgent,
  });

  return { message: 'Payment transaction deleted successfully' };
};

/**
 * Delete payment (soft delete)
 */
const deletePayment = async (id, userId, ipAddress, userAgent) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(id) },
    include: {
      transactions: true,
    },
  });

  if (!payment || payment.isDeleted) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.transactions.length > 0) {
    throw new ApiError(
      400,
      'Cannot delete payment with existing transactions. Delete transactions first.'
    );
  }

  // Soft delete payment
  await prisma.payment.update({
    where: { id: parseInt(id) },
    data: {
      isDeleted: true,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payments',
    recordId: parseInt(id),
    action: AUDIT_ACTION.DELETE,
    oldValues: payment,
    userId,
    ipAddress,
    userAgent,
  });

  return { message: 'Payment deleted successfully' };
};

/**
 * Get today's payments
 */
const getTodaysPayments = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const payments = await prisma.payment.findMany({
    where: {
      isDeleted: false,
      paymentDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
        },
      },
      party: {
        select: {
          partyName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.totalAmount),
    0
  );

  const paidAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.paidAmount),
    0
  );

  return {
    count: payments.length,
    totalAmount,
    paidAmount,
    payments,
  };
};

/**
 * Get payments by invoice
 */
const getPaymentsByInvoice = async (invoiceId) => {
  return await prisma.payment.findMany({
    where: {
      invoiceId: parseInt(invoiceId),
      isDeleted: false,
    },
    include: {
      transactions: {
        orderBy: { transactionDate: 'desc' },
      },
      createdBy: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
    orderBy: {
      paymentDate: 'desc',
    },
  });
};

/**
 * Get payments by party
 */
const getPaymentsByParty = async (partyId, fromDate = null, toDate = null) => {
  const where = {
    partyId: parseInt(partyId),
    isDeleted: false,
  };

  if (fromDate) {
    where.paymentDate = {
      ...where.paymentDate,
      gte: new Date(fromDate),
    };
  }

  if (toDate) {
    where.paymentDate = {
      ...where.paymentDate,
      lte: new Date(toDate),
    };
  }

  return await prisma.payment.findMany({
    where,
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          totalAmount: true,
        },
      },
      transactions: {
        orderBy: { transactionDate: 'desc' },
      },
    },
    orderBy: {
      paymentDate: 'desc',
    },
  });
};

/**
 * Create payment amendment
 */
const createPaymentAmendment = async (data, userId, ipAddress, userAgent) => {
  const { invoiceId, consignmentId, amendmentType, amount, reason } = data;

  // Validate that either invoiceId or consignmentId is provided
  if (!invoiceId && !consignmentId) {
    throw new ApiError(
      400,
      'Either invoice ID or consignment ID is required'
    );
  }

  // Verify invoice exists
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.isDeleted) {
      throw new ApiError(404, 'Invoice not found');
    }
  }

  // Verify consignment exists
  if (consignmentId) {
    const consignment = await prisma.consignment.findUnique({
      where: { id: consignmentId },
    });

    if (!consignment || consignment.isDeleted) {
      throw new ApiError(404, 'Consignment not found');
    }
  }

  // Create amendment
  const amendment = await prisma.paymentAmendment.create({
    data: {
      invoiceId: invoiceId || null,
      consignmentId: consignmentId || null,
      amendmentType,
      amount: Number(amount),
      reason,
      createdById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payment_amendments',
    recordId: amendment.id,
    action: AUDIT_ACTION.CREATE,
    newValues: amendment,
    userId,
    ipAddress,
    userAgent,
  });

  return amendment;
};

/**
 * Get pending amendments
 */
const getPendingAmendments = async () => {
  return await prisma.paymentAmendment.findMany({
    where: {
      approvedBy: null,
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          partyName: true,
        },
      },
      consignment: {
        select: {
          grNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

/**
 * Approve payment amendment
 */
const approvePaymentAmendment = async (
  id,
  userId,
  ipAddress,
  userAgent
) => {
  const amendment = await prisma.paymentAmendment.findUnique({
    where: { id: parseInt(id) },
    include: {
      invoice: true,
    },
  });

  if (!amendment) {
    throw new ApiError(404, 'Amendment not found');
  }

  if (amendment.approvedBy) {
    throw new ApiError(400, 'Amendment already approved');
  }

  // Approve in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update amendment as approved
    const approvedAmendment = await tx.paymentAmendment.update({
      where: { id: parseInt(id) },
      data: {
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    // If invoice amendment, update invoice
    if (amendment.invoiceId) {
      const invoice = amendment.invoice;
      let newTotalAmount = Number(invoice.totalAmount);

      // Apply amendment based on type
      if (amendment.amendmentType === 'Additional Charge') {
        newTotalAmount += Number(amendment.amount);
      } else if (amendment.amendmentType === 'Discount') {
        newTotalAmount -= Number(amendment.amount);
      } else if (amendment.amendmentType === 'Correction') {
        // For correction, amount can be positive or negative
        newTotalAmount += Number(amendment.amount);
      }

      const newBalanceAmount = newTotalAmount - Number(invoice.paidAmount);

      await tx.invoice.update({
        where: { id: amendment.invoiceId },
        data: {
          totalAmount: newTotalAmount,
          balanceAmount: newBalanceAmount,
          amountInWords: require('./numberToWords.service').convertAmountToWords(
            newTotalAmount
          ),
          updatedById: userId,
        },
      });
    }

    return approvedAmendment;
  });

  // Update payment status if invoice amendment
  if (amendment.invoiceId) {
    await updatePaymentStatus(amendment.invoiceId);
  }

  // Create audit log
  await createAuditLog({
    tableName: 'payment_amendments',
    recordId: result.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: amendment,
    newValues: result,
    userId,
    ipAddress,
    userAgent,
  });

  return result;
};

/**
 * Reject payment amendment
 */
const rejectPaymentAmendment = async (id, userId, ipAddress, userAgent) => {
  const amendment = await prisma.paymentAmendment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!amendment) {
    throw new ApiError(404, 'Amendment not found');
  }

  if (amendment.approvedBy) {
    throw new ApiError(400, 'Amendment already processed');
  }

  // Delete amendment (rejection = deletion)
  await prisma.paymentAmendment.delete({
    where: { id: parseInt(id) },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'payment_amendments',
    recordId: parseInt(id),
    action: AUDIT_ACTION.DELETE,
    oldValues: amendment,
    userId,
    ipAddress,
    userAgent,
  });

  return { message: 'Amendment rejected successfully' };
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  addPaymentTransaction,
  deletePaymentTransaction,
  deletePayment,
  getTodaysPayments,
  getPaymentsByInvoice,
  getPaymentsByParty,
  createPaymentAmendment,
  getPendingAmendments,
  approvePaymentAmendment,
  rejectPaymentAmendment,
};
