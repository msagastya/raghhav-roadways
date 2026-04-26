const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { getPaginationMeta } = require('../utils/helpers');
const { createAuditLog } = require('../utils/auditLog');
const { AUDIT_ACTION } = require('../config/constants');

/**
 * Get all vehicles with pagination and filters
 */
const getVehicles = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    ownerType = null,
    isActive = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { vehicleNo: { contains: search, mode: 'insensitive' } },
      { ownerName: { contains: search, mode: 'insensitive' } },
      { driverName: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (ownerType) {
    where.ownerType = ownerType;
  }

  if (isActive !== null) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  // Get total count
  const totalRecords = await prisma.vehicle.count({ where });

  // Get vehicles
  const vehicles = await prisma.vehicle.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { vehicleNo: 'asc' },
    include: {
      broker: {
        select: {
          id: true,
          partyName: true,
          mobile: true,
        },
      },
    },
  });

  return {
    vehicles,
    pagination: getPaginationMeta(totalRecords, parseInt(page), parseInt(limit)),
  };
};

/**
 * Get vehicle by ID
 */
const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parseInt(id) },
    include: {
      broker: {
        select: {
          id: true,
          partyName: true,
          mobile: true,
          addressLine1: true,
          city: true,
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

  if (!vehicle || vehicle.isDeleted) {
    throw new ApiError(404, 'Vehicle not found');
  }

  return vehicle;
};

/**
 * Create new vehicle
 */
const createVehicle = async (data, userId, ipAddress, userAgent) => {
  // Check for duplicate vehicle number
  const existing = await prisma.vehicle.findUnique({
    where: { vehicleNo: data.vehicleNo.toUpperCase() },
  });

  if (existing && !existing.isDeleted) {
    throw new ApiError(400, 'Vehicle with this number already exists');
  }

  // If broker, verify broker exists
  if (data.ownerType === 'broker' && data.brokerId) {
    const broker = await prisma.party.findUnique({
      where: { id: data.brokerId },
    });

    if (!broker || broker.isDeleted) {
      throw new ApiError(404, 'Broker not found');
    }
  }

  // Create vehicle
  const vehicle = await prisma.vehicle.create({
    data: {
      ...data,
      vehicleNo: data.vehicleNo.toUpperCase(),
      createdById: userId,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'vehicles',
    recordId: vehicle.id,
    action: AUDIT_ACTION.CREATE,
    newValues: vehicle,
    userId,
    ipAddress,
    userAgent,
  });

  return vehicle;
};

/**
 * Update vehicle
 */
const updateVehicle = async (id, data, userId, ipAddress, userAgent) => {
  // Get existing vehicle
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingVehicle || existingVehicle.isDeleted) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Check for duplicate vehicle number (excluding current vehicle)
  if (data.vehicleNo) {
    const duplicate = await prisma.vehicle.findFirst({
      where: {
        vehicleNo: data.vehicleNo.toUpperCase(),
        id: { not: parseInt(id) },
        isDeleted: false,
      },
    });

    if (duplicate) {
      throw new ApiError(400, 'Vehicle with this number already exists');
    }
  }

  // If broker, verify broker exists
  if (data.ownerType === 'broker' && data.brokerId) {
    const broker = await prisma.party.findUnique({
      where: { id: data.brokerId },
    });

    if (!broker || broker.isDeleted) {
      throw new ApiError(404, 'Broker not found');
    }
  }

  // Update vehicle
  const updatedVehicle = await prisma.vehicle.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      ...(data.vehicleNo && { vehicleNo: data.vehicleNo.toUpperCase() }),
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'vehicles',
    recordId: updatedVehicle.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: existingVehicle,
    newValues: updatedVehicle,
    userId,
    ipAddress,
    userAgent,
  });

  return updatedVehicle;
};

/**
 * Delete vehicle (soft delete)
 */
const deleteVehicle = async (id, userId, ipAddress, userAgent) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parseInt(id) },
  });

  if (!vehicle || vehicle.isDeleted) {
    throw new ApiError(404, 'Vehicle not found');
  }

  // Check if vehicle is used in any consignments
  const consignmentCount = await prisma.consignment.count({
    where: {
      vehicleId: parseInt(id),
      isDeleted: false,
    },
  });

  if (consignmentCount > 0) {
    throw new ApiError(
      400,
      'Cannot delete vehicle that is used in consignments. Please deactivate instead.'
    );
  }

  // Soft delete
  const deletedVehicle = await prisma.vehicle.update({
    where: { id: parseInt(id) },
    data: {
      isDeleted: true,
      isActive: false,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'vehicles',
    recordId: deletedVehicle.id,
    action: AUDIT_ACTION.DELETE,
    oldValues: vehicle,
    userId,
    ipAddress,
    userAgent,
  });

  return deletedVehicle;
};

/**
 * Search vehicles (for autocomplete)
 */
const searchVehicles = async (query, limit = 10) => {
  return await prisma.vehicle.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      vehicleNo: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: parseInt(limit),
    orderBy: { vehicleNo: 'asc' },
    select: {
      id: true,
      vehicleNo: true,
      vehicleType: true,
      vehicleCapacity: true,
      ownerType: true,
      ownerName: true,
      driverName: true,
      driverMobile: true,
    },
  });
};

/**
 * Get vehicles with expiring documents
 */
const getExpiringDocuments = async (daysAhead = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      OR: [
        {
          rcExpiry: {
            lte: futureDate,
            gte: new Date(),
          },
        },
        {
          insuranceExpiry: {
            lte: futureDate,
            gte: new Date(),
          },
        },
        {
          fitnessExpiry: {
            lte: futureDate,
            gte: new Date(),
          },
        },
        {
          pollutionExpiry: {
            lte: futureDate,
            gte: new Date(),
          },
        },
      ],
    },
    select: {
      id: true,
      vehicleNo: true,
      vehicleType: true,
      ownerName: true,
      ownerMobile: true,
      rcExpiry: true,
      insuranceExpiry: true,
      fitnessExpiry: true,
      pollutionExpiry: true,
    },
  });

  // Format expiring documents
  const expiringDocuments = [];

  vehicles.forEach((vehicle) => {
    if (vehicle.rcExpiry && vehicle.rcExpiry <= futureDate) {
      expiringDocuments.push({
        vehicleId: vehicle.id,
        vehicleNo: vehicle.vehicleNo,
        documentType: 'RC',
        expiryDate: vehicle.rcExpiry,
        daysRemaining: Math.ceil(
          (vehicle.rcExpiry - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    }

    if (vehicle.insuranceExpiry && vehicle.insuranceExpiry <= futureDate) {
      expiringDocuments.push({
        vehicleId: vehicle.id,
        vehicleNo: vehicle.vehicleNo,
        documentType: 'Insurance',
        expiryDate: vehicle.insuranceExpiry,
        daysRemaining: Math.ceil(
          (vehicle.insuranceExpiry - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    }

    if (vehicle.fitnessExpiry && vehicle.fitnessExpiry <= futureDate) {
      expiringDocuments.push({
        vehicleId: vehicle.id,
        vehicleNo: vehicle.vehicleNo,
        documentType: 'Fitness',
        expiryDate: vehicle.fitnessExpiry,
        daysRemaining: Math.ceil(
          (vehicle.fitnessExpiry - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    }

    if (vehicle.pollutionExpiry && vehicle.pollutionExpiry <= futureDate) {
      expiringDocuments.push({
        vehicleId: vehicle.id,
        vehicleNo: vehicle.vehicleNo,
        documentType: 'Pollution',
        expiryDate: vehicle.pollutionExpiry,
        daysRemaining: Math.ceil(
          (vehicle.pollutionExpiry - new Date()) / (1000 * 60 * 60 * 24)
        ),
      });
    }
  });

  return expiringDocuments.sort((a, b) => a.daysRemaining - b.daysRemaining);
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  searchVehicles,
  getExpiringDocuments,
};
