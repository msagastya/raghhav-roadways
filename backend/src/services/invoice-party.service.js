const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

const getAll = async (filters) => {
  const { page = 1, limit = 50, search, stateId } = filters;
  const skip = (page - 1) * limit;

  const where = { isDeleted: false };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { gstin: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (stateId) where.stateId = parseInt(stateId);

  const [records, total] = await Promise.all([
    prisma.invoiceParty.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        city: { select: { cityName: true } },
        state: { select: { stateName: true } }
      }
    }),
    prisma.invoiceParty.count({ where })
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

const getById = async (id) => {
  const record = await prisma.invoiceParty.findUnique({
    where: { id: parseInt(id) },
    include: {
      city: { select: { cityName: true } },
      state: { select: { stateName: true } }
    }
  });

  if (!record || record.isDeleted) {
    throw new ApiError(404, 'Invoice Party not found');
  }

  return record;
};

const create = async (data) => {
  return await prisma.invoiceParty.create({
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
};

const update = async (id, data) => {
  const existing = await prisma.invoiceParty.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Invoice Party not found');
  }

  return await prisma.invoiceParty.update({
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
};

const deleteRecord = async (id) => {
  const existing = await prisma.invoiceParty.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Invoice Party not found');
  }

  await prisma.invoiceParty.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true }
  });
};

const search = async (query, limit = 10) => {
  return await prisma.invoiceParty.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      name: { contains: query, mode: 'insensitive' }
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
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteRecord,
  search
};
