const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

const getAll = async (filters) => {
  const { page = 1, limit = 50, search, type, stateId } = filters;
  const skip = (page - 1) * limit;

  const where = { isDeleted: false };

  if (search) {
    where.name = { contains: search, mode: 'insensitive' };
  }

  if (type) where.type = type;
  if (stateId) where.stateId = parseInt(stateId);

  const [records, total] = await Promise.all([
    prisma.vehicleOwnerBroker.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        city: { select: { cityName: true } },
        state: { select: { stateName: true } },
        vehicles: {
          where: { isActive: true },
          select: {
            id: true,
            vehicleNo: true,
            vehicleSize: true,
            vehicleType: true,
            remarks: true
          }
        },
        _count: { select: { vehicles: true } }
      }
    }),
    prisma.vehicleOwnerBroker.count({ where })
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
  const record = await prisma.vehicleOwnerBroker.findUnique({
    where: { id: parseInt(id) },
    include: {
      city: { select: { cityName: true } },
      state: { select: { stateName: true } },
      vehicles: {
        where: { isActive: true },
        orderBy: { vehicleNo: 'asc' }
      }
    }
  });

  if (!record || record.isDeleted) {
    throw new ApiError(404, 'Vehicle Owner/Broker not found');
  }

  return record;
};

const create = async (data) => {
  return await prisma.vehicleOwnerBroker.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
      cityId: parseInt(data.cityId),
      stateId: parseInt(data.stateId),
      pincode: data.pincode,
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
  const existing = await prisma.vehicleOwnerBroker.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Vehicle Owner/Broker not found');
  }

  return await prisma.vehicleOwnerBroker.update({
    where: { id: parseInt(id) },
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
      cityId: parseInt(data.cityId),
      stateId: parseInt(data.stateId),
      pincode: data.pincode,
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
  const existing = await prisma.vehicleOwnerBroker.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing || existing.isDeleted) {
    throw new ApiError(404, 'Vehicle Owner/Broker not found');
  }

  await prisma.vehicleOwnerBroker.update({
    where: { id: parseInt(id) },
    data: { isDeleted: true }
  });
};

// Vehicle management
const addVehicle = async (ownerId, vehicleData) => {
  const owner = await prisma.vehicleOwnerBroker.findUnique({
    where: { id: parseInt(ownerId) }
  });

  if (!owner || owner.isDeleted) {
    throw new ApiError(404, 'Vehicle Owner/Broker not found');
  }

  return await prisma.ownerVehicle.create({
    data: {
      ownerId: parseInt(ownerId),
      vehicleNo: vehicleData.vehicleNo,
      vehicleSize: vehicleData.vehicleSize,
      vehicleType: vehicleData.vehicleType,
      noOfTrips: vehicleData.noOfTrips || 0,
      remarks: vehicleData.remarks
    }
  });
};

const updateVehicle = async (vehicleId, vehicleData) => {
  return await prisma.ownerVehicle.update({
    where: { id: parseInt(vehicleId) },
    data: {
      vehicleNo: vehicleData.vehicleNo,
      vehicleSize: vehicleData.vehicleSize,
      vehicleType: vehicleData.vehicleType,
      noOfTrips: vehicleData.noOfTrips !== undefined ? parseInt(vehicleData.noOfTrips) : undefined,
      remarks: vehicleData.remarks
    }
  });
};

const deleteVehicle = async (vehicleId) => {
  await prisma.ownerVehicle.update({
    where: { id: parseInt(vehicleId) },
    data: { isActive: false }
  });
};

const search = async (query, type, limit = 10) => {
  const where = {
    isDeleted: false,
    isActive: true,
    name: { contains: query, mode: 'insensitive' }
  };

  if (type) where.type = type;

  return await prisma.vehicleOwnerBroker.findMany({
    where,
    take: parseInt(limit),
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      contact: true,
      city: { select: { cityName: true } },
      state: { select: { stateName: true } },
      _count: { select: { vehicles: true } }
    }
  });
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  deleteRecord,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  search
};
