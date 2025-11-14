const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Get all consignor/consignees with pagination
 */
const getAll = async (filters) => {
  const { page = 1, limit = 50, search, stateId } = filters;
  const skip = (page - 1) * limit;

  const where = {
    isDeleted: false
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { gstin: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (stateId) {
    where.stateId = parseInt(stateId);
  }

  const [records, total] = await Promise.all([
    prisma.consignorConsignee.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        city: { select: { cityName: true } },
        state: { select: { stateName: true } }
      }
    }),
    prisma.consignorConsignee.count({ where })
  ]);

  return {
    records,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get by ID
 */
const getById = async (id) => {
  const record = await prisma.consignorConsignee.findUnique({
    where: { id: parseInt(id) },
    include: {
      city: { select: { cityName: true } },
      state: { select: { stateName: true } }
    }
  });

  if (!record || record.isDeleted) {
    throw new ApiError(404, 'Consignor/Consignee not found');
  }

  return record;
};

/**
 * Create new
 */
const create = async (data) => {
  const record = await prisma.consignorConsignee.create({
    data: {
      name: data.name,
      address: data.address,
      cityId: parseInt(data.cityId),
      stateId: parseInt(data.stateId),
      pincode: data.pincode,
      gstin: data.gstin,
      contact: data.contact,
      remarks: data.remarks
    },
    include: {
      city: { select: { cityName: true } },
      state: { select: { stateName: true } }
    }
  });

  return record;
};

/**
 * Update
 */
const update = async (id, data) => {
  const existing = await prisma.consignorConsignee.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Consignor/Consignee not found');
  }

  const record = await prisma.consignorConsignee.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      address: data.address,
      cityId: parseInt(data.cityId),
      stateId: parseInt(data.stateId),
      pincode: data.pincode,
      gstin: data.gstin,
      contact: data.contact,
      remarks: data.remarks
    },
    include: {
      city: { select: { cityName: true } },
      state: { select: { stateName: true } }
    }
  });

  return record;
};

/**
 * Delete (soft delete)
 */
const deleteRecord = async (id) => {
  const existing = await prisma.consignorConsignee.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Consignor/Consignee not found');
  }

  await prisma.consignorConsignee.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true }
  });
};

/**
 * Search for autocomplete
 */
const search = async (query, limit = 10) => {
  const records = await prisma.consignorConsignee.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      name: {
        contains: query,
        mode: 'insensitive'
      }
    },
    take: parseInt(limit),
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      address: true,
      gstin: true,
      city: { select: { cityName: true } },
      state: { select: { stateName: true } }
    }
  });

  return records;
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteRecord,
  search
};
