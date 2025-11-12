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
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { paymentNumber: { contains: search, mode: 'insensitive' } },
      { paymentReference: { contains: search, mode: 'insensitive' } },
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
 * Create new payment
 */
const createPayment = async (data, userId, ipAddress, userAgent) => {
  const { invoiceId, partyId, amount } = data;

  // Validate that either invoiceId or partyId is provided
  if (!invoiceId && !partyId) {
    throw new ApiError(400, 'Either invoice ID or party ID is required');
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

    // Validate payment amount
    if (Number(amount) > Number(invoice.balanceAmount)) {
      throw new ApiError(
        400,
        `Payment amount (₹${amount}) exceeds invoice balance (₹${invoice.balanceAmount})`
      );
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

  // Create payment in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment
    const payment = await tx.payment.create({
      data: {
        paymentNumber,
        paymentDate: new Date(data.paymentDate),
        invoiceId: invoiceId || null,
        partyId: party.id,
        paymentMode: data.paymentMode || null,
        paymentReference: data.paymentReference || null,
        amount: Number(amount),
        bankName: data.bankName || null,
        bankAccountNo: data.bankAccountNo || null,
        bankIfsc: data.bankIfsc || null,
        remarks: data.remarks || null,
        createdById: userId,
      },
    });

    // If invoice payment, update invoice
    if (invoiceId) {
      const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
      const newBalanceAmount = Number(invoice.totalAmount) - newPaidAmount;

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          updatedById: userId,
        },
      });
    }

    return payment;
  });

  // Update payment status if invoice payment
  if (invoiceId) {
    await updatePaymentStatus(invoiceId);
  }

  // Create audit log
  await createAuditLog({
    tableName: 'payments',
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
 * Delete payment (soft delete)
 */
const deletePayment = async (id, userId, ipAddress, userAgent) => {
  const payment = await prisma.payment.findUnique({
    where: { id: parseInt(id) },
    include: {
      invoice: true,
    },
  });

  if (!payment || payment.isDeleted) {
    throw new ApiError(404, 'Payment not found');
  }

  // Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Soft delete payment
    await tx.payment.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
      },
    });

    // If invoice payment, update invoice
    if (payment.invoiceId) {
      const invoice = payment.invoice;
      const newPaidAmount = Number(invoice.paidAmount) - Number(payment.amount);
      const newBalanceAmount = Number(invoice.totalAmount) - newPaidAmount;

      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          updatedById: userId,
        },
      });
    }
  });

  // Update payment status if invoice payment
  if (payment.invoiceId) {
    await updatePaymentStatus(payment.invoiceId);
  }

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
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  return {
    count: payments.length,
    totalAmount,
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
  deletePayment,
  getTodaysPayments,
  getPaymentsByInvoice,
  getPaymentsByParty,
  createPaymentAmendment,
  getPendingAmendments,
  approvePaymentAmendment,
  rejectPaymentAmendment,
};
