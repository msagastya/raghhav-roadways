const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const {
  generateCode,
  getPaginationMeta,
  calculateTotal,
} = require('../utils/helpers');
const { createAuditLog } = require('../utils/auditLog');
const { AUDIT_ACTION, PAYMENT_STATUS } = require('../config/constants');
const { convertAmountToWords } = require('./numberToWords.service');

/**
 * Get all invoices with pagination and filters
 */
const getInvoices = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    paymentStatus = null,
    fromDate = null,
    toDate = null,
    partyId = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { partyName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (fromDate) {
    where.invoiceDate = {
      ...where.invoiceDate,
      gte: new Date(fromDate),
    };
  }

  if (toDate) {
    where.invoiceDate = {
      ...where.invoiceDate,
      lte: new Date(toDate),
    };
  }

  if (partyId) {
    where.partyId = parseInt(partyId);
  }

  // Get total count
  const totalRecords = await prisma.invoice.count({ where });

  // Get invoices
  const invoices = await prisma.invoice.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { invoiceDate: 'desc' },
    include: {
      party: {
        select: {
          id: true,
          partyName: true,
          city: true,
          mobile: true,
        },
      },
      items: {
        select: {
          id: true,
          grNumber: true,
          amount: true,
        },
      },
    },
  });

  return {
    invoices,
    pagination: getPaginationMeta(totalRecords, parseInt(page), parseInt(limit)),
  };
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (id) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      party: true,
      items: {
        include: {
          consignment: {
            select: {
              id: true,
              grNumber: true,
              grDate: true,
              fromLocation: true,
              toLocation: true,
              vehicleNumber: true,
            },
          },
        },
      },
      payments: {
        orderBy: {
          paymentDate: 'desc',
        },
      },
      paymentAmendments: {
        include: {
          approver: {
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
      updatedBy: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  if (!invoice || invoice.isDeleted) {
    throw new ApiError(404, 'Invoice not found');
  }

  return invoice;
};

/**
 * Create new invoice
 */
const createInvoice = async (data, userId, ipAddress, userAgent) => {
  const { partyId, consignmentIds, grCharge = 0, dueDate = null } = data;

  // Verify party exists
  const party = await prisma.party.findUnique({
    where: { id: partyId },
  });

  if (!party || party.isDeleted) {
    throw new ApiError(404, 'Party not found');
  }

  // Get consignments
  const consignments = await prisma.consignment.findMany({
    where: {
      id: { in: consignmentIds },
      isDeleted: false,
    },
  });

  if (consignments.length === 0) {
    throw new ApiError(404, 'No valid consignments found');
  }

  if (consignments.length !== consignmentIds.length) {
    throw new ApiError(400, 'Some consignment IDs are invalid');
  }

  // Check if any consignment is already invoiced
  const alreadyInvoiced = consignments.find((c) => c.isInvoiced);
  if (alreadyInvoiced) {
    throw new ApiError(
      400,
      `Consignment ${alreadyInvoiced.grNumber} is already invoiced`
    );
  }

  // Generate invoice number
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { invoiceNumber: 'desc' },
  });

  const lastNumber = lastInvoice
    ? parseInt(lastInvoice.invoiceNumber.replace('INV', ''))
    : 0;
  const invoiceNumber = generateCode('INV', lastNumber, 4);

  // Calculate subtotal
  const subtotal = consignments.reduce(
    (sum, consignment) => sum + Number(consignment.totalAmount),
    0
  );

  // Calculate total with GR charge
  const totalAmount = subtotal + Number(grCharge);

  // Convert amount to words
  const amountInWords = convertAmountToWords(totalAmount);

  // Build party address
  const partyAddress = [
    party.addressLine1,
    party.addressLine2,
    party.city,
    party.state,
    party.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  // Create invoice in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        invoiceDate: new Date(data.invoiceDate),
        branch: data.branch || 'Surat',
        partyId,
        partyName: party.partyName,
        partyAddress,
        partyGstin: party.gstin,
        subtotal,
        grCharge,
        totalAmount,
        amountInWords,
        balanceAmount: totalAmount,
        paymentStatus: PAYMENT_STATUS.PENDING,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: userId,
        updatedById: userId,
      },
    });

    // Create invoice items
    for (const consignment of consignments) {
      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          consignmentId: consignment.id,
          grNumber: consignment.grNumber,
          grDate: consignment.grDate,
          vehicleNumber: consignment.vehicleNumber,
          fromLocation: consignment.fromLocation,
          toLocation: consignment.toLocation,
          contents: consignment.description,
          qtyInMt: consignment.actualWeight,
          rateMt:
            consignment.actualWeight > 0
              ? Number(consignment.freightAmount) / Number(consignment.actualWeight)
              : null,
          amount: consignment.totalAmount,
        },
      });

      // Update consignment as invoiced
      await tx.consignment.update({
        where: { id: consignment.id },
        data: {
          isInvoiced: true,
          invoiceId: invoice.id,
          updatedById: userId,
        },
      });
    }

    return invoice;
  });

  // Create audit log
  await createAuditLog({
    tableName: 'invoices',
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
 * Update invoice
 */
const updateInvoice = async (id, data, userId, ipAddress, userAgent) => {
  // Get existing invoice
  const existingInvoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      payments: true,
    },
  });

  if (!existingInvoice || existingInvoice.isDeleted) {
    throw new ApiError(404, 'Invoice not found');
  }

  // Check if invoice has payments
  if (existingInvoice.payments.length > 0) {
    throw new ApiError(
      400,
      'Cannot update invoice that has payments. Use amendments instead.'
    );
  }

  let updateData = { ...data };

  // If grCharge is updated, recalculate total
  if (data.grCharge !== undefined) {
    const totalAmount = Number(existingInvoice.subtotal) + Number(data.grCharge);
    updateData.totalAmount = totalAmount;
    updateData.balanceAmount = totalAmount - Number(existingInvoice.paidAmount);
    updateData.amountInWords = convertAmountToWords(totalAmount);
  }

  // Update invoice
  const updatedInvoice = await prisma.invoice.update({
    where: { id: parseInt(id) },
    data: {
      ...updateData,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'invoices',
    recordId: updatedInvoice.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: existingInvoice,
    newValues: updatedInvoice,
    userId,
    ipAddress,
    userAgent,
  });

  return updatedInvoice;
};

/**
 * Delete invoice (soft delete)
 */
const deleteInvoice = async (id, userId, ipAddress, userAgent) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: parseInt(id) },
    include: {
      payments: true,
    },
  });

  if (!invoice || invoice.isDeleted) {
    throw new ApiError(404, 'Invoice not found');
  }

  // Check if invoice has payments
  if (invoice.payments.length > 0) {
    throw new ApiError(400, 'Cannot delete invoice that has payments');
  }

  // Delete in transaction
  await prisma.$transaction(async (tx) => {
    // Soft delete invoice
    await tx.invoice.update({
      where: { id: parseInt(id) },
      data: {
        isDeleted: true,
        updatedById: userId,
      },
    });

    // Unlink consignments
    await tx.consignment.updateMany({
      where: { invoiceId: parseInt(id) },
      data: {
        isInvoiced: false,
        invoiceId: null,
        updatedById: userId,
      },
    });
  });

  // Create audit log
  await createAuditLog({
    tableName: 'invoices',
    recordId: parseInt(id),
    action: AUDIT_ACTION.DELETE,
    oldValues: invoice,
    userId,
    ipAddress,
    userAgent,
  });

  return { message: 'Invoice deleted successfully' };
};

/**
 * Update payment status based on paid amount
 */
const updatePaymentStatus = async (invoiceId) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw new ApiError(404, 'Invoice not found');
  }

  let paymentStatus;
  const paidAmount = Number(invoice.paidAmount);
  const totalAmount = Number(invoice.totalAmount);
  const balanceAmount = totalAmount - paidAmount;

  if (balanceAmount === 0) {
    paymentStatus = PAYMENT_STATUS.PAID;
  } else if (paidAmount > 0 && balanceAmount > 0) {
    paymentStatus = PAYMENT_STATUS.PARTIAL;
  } else if (invoice.dueDate && new Date() > new Date(invoice.dueDate)) {
    paymentStatus = PAYMENT_STATUS.OVERDUE;
  } else {
    paymentStatus = PAYMENT_STATUS.PENDING;
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paymentStatus,
      balanceAmount,
    },
  });
};

/**
 * Get overdue invoices
 */
const getOverdueInvoices = async () => {
  const today = new Date();

  return await prisma.invoice.findMany({
    where: {
      isDeleted: false,
      dueDate: {
        lt: today,
      },
      balanceAmount: {
        gt: 0,
      },
    },
    include: {
      party: {
        select: {
          id: true,
          partyName: true,
          mobile: true,
          email: true,
        },
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
  });
};

/**
 * Get payment summary for dashboard
 */
const getPaymentSummary = async () => {
  const statusCounts = await prisma.invoice.groupBy({
    by: ['paymentStatus'],
    where: {
      isDeleted: false,
    },
    _count: {
      paymentStatus: true,
    },
    _sum: {
      balanceAmount: true,
    },
  });

  const summary = {};
  statusCounts.forEach((item) => {
    summary[item.paymentStatus] = {
      count: item._count.paymentStatus,
      totalBalance: item._sum.balanceAmount || 0,
    };
  });

  return summary;
};

module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updatePaymentStatus,
  getOverdueInvoices,
  getPaymentSummary,
};
