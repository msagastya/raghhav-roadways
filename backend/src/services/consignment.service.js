const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const {
  generateCode,
  getPaginationMeta,
  calculateTotal,
  isValidStatusTransition,
} = require('../utils/helpers');
const { createAuditLog } = require('../utils/auditLog');
const { AUDIT_ACTION, CONSIGNMENT_STATUS } = require('../config/constants');
const { convertAmountToWords } = require('./numberToWords.service');

/**
 * Get all consignments with pagination and filters
 */
const getConsignments = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = null,
    fromDate = null,
    toDate = null,
    consignorId = null,
    consigneeId = null,
    vehicleId = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { grNumber: { contains: search, mode: 'insensitive' } },
      { vehicleNumber: { contains: search, mode: 'insensitive' } },
      { fromLocation: { contains: search, mode: 'insensitive' } },
      { toLocation: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (fromDate) {
    where.grDate = {
      ...where.grDate,
      gte: new Date(fromDate),
    };
  }

  if (toDate) {
    where.grDate = {
      ...where.grDate,
      lte: new Date(toDate),
    };
  }

  if (consignorId) {
    where.consignorId = parseInt(consignorId);
  }

  if (consigneeId) {
    where.consigneeId = parseInt(consigneeId);
  }

  if (vehicleId) {
    where.vehicleId = parseInt(vehicleId);
  }

  // Get total count
  const totalRecords = await prisma.consignment.count({ where });

  // Get consignments
  const consignments = await prisma.consignment.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { grDate: 'desc' },
    include: {
      consignor: {
        select: {
          id: true,
          partyName: true,
          city: true,
        },
      },
      consignee: {
        select: {
          id: true,
          partyName: true,
          city: true,
        },
      },
      vehicle: {
        select: {
          id: true,
          vehicleNo: true,
          vehicleType: true,
        },
      },
    },
  });

  return {
    consignments,
    pagination: getPaginationMeta(totalRecords, parseInt(page), parseInt(limit)),
  };
};

/**
 * Get consignment by ID
 */
const getConsignmentById = async (id) => {
  const consignment = await prisma.consignment.findUnique({
    where: { id: parseInt(id) },
    include: {
      consignor: true,
      consignee: true,
      vehicle: {
        include: {
          broker: {
            select: {
              id: true,
              partyName: true,
              mobile: true,
            },
          },
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          invoiceDate: true,
          totalAmount: true,
          paymentStatus: true,
        },
      },
      statusHistory: {
        include: {
          user: {
            select: {
              username: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          changedAt: 'asc',
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

  if (!consignment || consignment.isDeleted) {
    throw new ApiError(404, 'Consignment not found');
  }

  return consignment;
};

/**
 * Create new consignment
 */
const createConsignment = async (data, userId, ipAddress, userAgent) => {
  // Verify consignor exists
  const consignor = await prisma.party.findUnique({
    where: { id: data.consignorId },
  });

  if (!consignor || consignor.isDeleted) {
    throw new ApiError(404, 'Consignor not found');
  }

  // Verify consignee exists
  const consignee = await prisma.party.findUnique({
    where: { id: data.consigneeId },
  });

  if (!consignee || consignee.isDeleted) {
    throw new ApiError(404, 'Consignee not found');
  }

  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: data.vehicleId },
  });

  if (!vehicle || vehicle.isDeleted) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Generate GR number
  const lastConsignment = await prisma.consignment.findFirst({
    orderBy: { grNumber: 'desc' },
  });

  const lastNumber = lastConsignment
    ? parseInt(lastConsignment.grNumber.replace('GR', ''))
    : 0;
  const grNumber = generateCode('GR', lastNumber, 4);

  // Calculate total amount
  const totalAmount = calculateTotal(
    data.freightAmount,
    data.surcharge || 0,
    data.otherCharges || 0,
    data.grCharge || 0
  );

  // Convert amount to words
  const amountInWords = convertAmountToWords(totalAmount);

  // Create consignment
  const consignment = await prisma.consignment.create({
    data: {
      grNumber,
      grDate: new Date(data.grDate),
      consignmentNo: data.consignmentNo || null,
      consignorId: data.consignorId,
      consigneeId: data.consigneeId,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      issuingBranch: data.issuingBranch || 'Surat',
      deliveryOffice: data.deliveryOffice || null,
      vehicleId: data.vehicleId,
      vehicleNumber: vehicle.vehicleNo,
      vehicleSize: data.vehicleSize || null,
      noOfPackages: data.noOfPackages || null,
      description: data.description || null,
      vehicleType: data.vehicleType || null,
      actualWeight: data.actualWeight || null,
      chargedWeight: data.chargedWeight || null,
      weightUnit: data.weightUnit || 'MT',
      shipmentValue: data.shipmentValue || null,
      freightAmount: data.freightAmount,
      surcharge: data.surcharge || 0,
      otherCharges: data.otherCharges || 0,
      grCharge: data.grCharge || 0,
      totalAmount,
      amountInWords,
      rateType: data.rateType || null,
      rateCalculationText: data.rateCalculationText || null,
      atRisk: data.atRisk || "Owner's Risk",
      paymentMode: data.paymentMode || 'To Pay',
      ewayBillNo: data.ewayBillNo || null,
      ewayBillFromDate: data.ewayBillFromDate ? new Date(data.ewayBillFromDate) : null,
      ewayBillValidUpto: data.ewayBillValidUpto ? new Date(data.ewayBillValidUpto) : null,
      policyNo: data.policyNo || null,
      policyAmount: data.policyAmount || null,
      status: CONSIGNMENT_STATUS.BOOKED,
      notes: data.notes || null,
      createdById: userId,
      updatedById: userId,
    },
  });

  // Create initial status history
  await prisma.statusHistory.create({
    data: {
      consignmentId: consignment.id,
      fromStatus: null,
      toStatus: CONSIGNMENT_STATUS.BOOKED,
      remarks: 'Consignment created',
      changedBy: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'consignments',
    recordId: consignment.id,
    action: AUDIT_ACTION.CREATE,
    newValues: consignment,
    userId,
    ipAddress,
    userAgent,
  });

  return consignment;
};

/**
 * Update consignment
 */
const updateConsignment = async (id, data, userId, ipAddress, userAgent) => {
  // Get existing consignment
  const existingConsignment = await prisma.consignment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingConsignment || existingConsignment.isDeleted) {
    throw new ApiError(404, 'Consignment not found');
  }

  // Check if consignment is invoiced
  if (existingConsignment.isInvoiced) {
    throw new ApiError(
      400,
      'Cannot update consignment that has been invoiced. Please use payment amendments.'
    );
  }

  // If amount fields are updated, recalculate total
  let updateData = { ...data };

  if (
    data.freightAmount !== undefined ||
    data.surcharge !== undefined ||
    data.otherCharges !== undefined ||
    data.grCharge !== undefined
  ) {
    const totalAmount = calculateTotal(
      data.freightAmount ?? existingConsignment.freightAmount,
      data.surcharge ?? existingConsignment.surcharge,
      data.otherCharges ?? existingConsignment.otherCharges,
      data.grCharge ?? existingConsignment.grCharge
    );

    updateData.totalAmount = totalAmount;
    updateData.amountInWords = convertAmountToWords(totalAmount);
  }

  // Update consignment
  const updatedConsignment = await prisma.consignment.update({
    where: { id: parseInt(id) },
    data: {
      ...updateData,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'consignments',
    recordId: updatedConsignment.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: existingConsignment,
    newValues: updatedConsignment,
    userId,
    ipAddress,
    userAgent,
  });

  return updatedConsignment;
};

/**
 * Update consignment status
 */
const updateConsignmentStatus = async (
  id,
  newStatus,
  remarks,
  userId,
  ipAddress,
  userAgent
) => {
  // Get existing consignment
  const consignment = await prisma.consignment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!consignment || consignment.isDeleted) {
    throw new ApiError(404, 'Consignment not found');
  }

  // Validate status transition
  if (!isValidStatusTransition(consignment.status, newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${consignment.status} to ${newStatus}`
    );
  }

  // Prepare update data
  const updateData = {
    status: newStatus,
    updatedById: userId,
  };

  // Set timestamp based on status
  const now = new Date();
  switch (newStatus) {
    case CONSIGNMENT_STATUS.LOADED:
      updateData.loadedAt = now;
      break;
    case CONSIGNMENT_STATUS.IN_TRANSIT:
      updateData.inTransitAt = now;
      break;
    case CONSIGNMENT_STATUS.DELIVERED:
      updateData.deliveredAt = now;
      break;
    case CONSIGNMENT_STATUS.SETTLED:
      updateData.settledAt = now;
      break;
  }

  // Update consignment
  const updatedConsignment = await prisma.consignment.update({
    where: { id: parseInt(id) },
    data: updateData,
  });

  // Create status history
  await prisma.statusHistory.create({
    data: {
      consignmentId: parseInt(id),
      fromStatus: consignment.status,
      toStatus: newStatus,
      remarks: remarks || null,
      changedBy: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'consignments',
    recordId: updatedConsignment.id,
    action: AUDIT_ACTION.STATUS_CHANGE,
    oldValues: { status: consignment.status },
    newValues: { status: newStatus },
    userId,
    ipAddress,
    userAgent,
  });

  return updatedConsignment;
};

/**
 * Delete consignment (soft delete)
 */
const deleteConsignment = async (id, userId, ipAddress, userAgent) => {
  const consignment = await prisma.consignment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!consignment || consignment.isDeleted) {
    throw new ApiError(404, 'Consignment not found');
  }

  // Check if consignment is invoiced
  if (consignment.isInvoiced) {
    throw new ApiError(400, 'Cannot delete consignment that has been invoiced');
  }

  // Soft delete
  const deletedConsignment = await prisma.consignment.update({
    where: { id: parseInt(id) },
    data: {
      isDeleted: true,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'consignments',
    recordId: deletedConsignment.id,
    action: AUDIT_ACTION.DELETE,
    oldValues: consignment,
    userId,
    ipAddress,
    userAgent,
  });

  return deletedConsignment;
};

/**
 * Get consignments ready for invoicing (delivered but not invoiced)
 */
const getConsignmentsForInvoicing = async (partyId) => {
  return await prisma.consignment.findMany({
    where: {
      isDeleted: false,
      isInvoiced: false,
      status: CONSIGNMENT_STATUS.DELIVERED,
      OR: [{ consignorId: parseInt(partyId) }, { consigneeId: parseInt(partyId) }],
    },
    include: {
      vehicle: {
        select: {
          vehicleNo: true,
          vehicleType: true,
        },
      },
    },
    orderBy: {
      grDate: 'asc',
    },
  });
};

/**
 * Get status summary
 */
const getStatusSummary = async () => {
  const statusCounts = await prisma.consignment.groupBy({
    by: ['status'],
    where: {
      isDeleted: false,
    },
    _count: {
      status: true,
    },
  });

  const summary = {};
  statusCounts.forEach((item) => {
    summary[item.status] = item._count.status;
  });

  return summary;
};

/**
 * Get today's bookings
 */
const getTodaysBookings = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookings = await prisma.consignment.findMany({
    where: {
      isDeleted: false,
      grDate: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      consignor: {
        select: {
          partyName: true,
        },
      },
      consignee: {
        select: {
          partyName: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalAmount = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount),
    0
  );

  return {
    count: bookings.length,
    totalAmount,
    bookings,
  };
};

/**
 * Get pending deliveries
 */
const getPendingDeliveries = async () => {
  return await prisma.consignment.findMany({
    where: {
      isDeleted: false,
      status: {
        in: [
          CONSIGNMENT_STATUS.BOOKED,
          CONSIGNMENT_STATUS.LOADED,
          CONSIGNMENT_STATUS.IN_TRANSIT,
        ],
      },
    },
    include: {
      consignor: {
        select: {
          partyName: true,
        },
      },
      consignee: {
        select: {
          partyName: true,
        },
      },
      vehicle: {
        select: {
          vehicleNo: true,
        },
      },
    },
    orderBy: {
      grDate: 'asc',
    },
  });
};

/**
 * Upload challan document
 */
const uploadChallan = async (id, filePath, userId, ipAddress, userAgent) => {
  const consignment = await prisma.consignment.findUnique({
    where: { id: parseInt(id) },
  });

  if (!consignment || consignment.isDeleted) {
    throw new ApiError(404, 'Consignment not found');
  }

  const updatedConsignment = await prisma.consignment.update({
    where: { id: parseInt(id) },
    data: {
      challanUploaded: true,
      challanFilePath: filePath,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'consignments',
    recordId: updatedConsignment.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: { challanFilePath: consignment.challanFilePath },
    newValues: { challanFilePath: filePath },
    userId,
    ipAddress,
    userAgent,
  });

  return updatedConsignment;
};

module.exports = {
  getConsignments,
  getConsignmentById,
  createConsignment,
  updateConsignment,
  updateConsignmentStatus,
  deleteConsignment,
  getConsignmentsForInvoicing,
  getStatusSummary,
  getTodaysBookings,
  getPendingDeliveries,
  uploadChallan,
};
