const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { generateCode, getPaginationMeta } = require('../utils/helpers');
const { createAuditLog } = require('../utils/auditLog');
const { AUDIT_ACTION } = require('../config/constants');

/**
 * Get all parties with pagination and filters
 */
const getParties = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    type = null,
    isActive = null,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { partyName: { contains: search, mode: 'insensitive' } },
      { partyCode: { contains: search, mode: 'insensitive' } },
      { gstin: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (type) {
    where.partyType = type;
  }

  if (isActive !== null) {
    where.isActive = isActive === 'true' || isActive === true;
  }

  // Get total count
  const totalRecords = await prisma.party.count({ where });

  // Get parties
  const parties = await prisma.party.findMany({
    where,
    skip,
    take: parseInt(limit),
    orderBy: { partyName: 'asc' },
    select: {
      id: true,
      partyCode: true,
      partyName: true,
      partyType: true,
      gstin: true,
      addressLine1: true,
      city: true,
      state: true,
      contactPerson: true,
      mobile: true,
      email: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    parties,
    pagination: getPaginationMeta(totalRecords, parseInt(page), parseInt(limit)),
  };
};

/**
 * Get party by ID
 */
const getPartyById = async (id) => {
  const party = await prisma.party.findUnique({
    where: { id: parseInt(id) },
    include: {
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

  if (!party || party.isDeleted) {
    throw new ApiError(404, 'Party not found');
  }

  return party;
};

/**
 * Create new party
 */
const createParty = async (data, userId, ipAddress, userAgent) => {
  // Check for duplicate party name or GSTIN
  const existing = await prisma.party.findFirst({
    where: {
      OR: [
        { partyName: data.partyName },
        ...(data.gstin ? [{ gstin: data.gstin }] : []),
      ],
      isDeleted: false,
    },
  });

  if (existing) {
    if (existing.partyName === data.partyName) {
      throw new ApiError(400, 'Party with this name already exists');
    }
    if (existing.gstin === data.gstin) {
      throw new ApiError(400, 'Party with this GSTIN already exists');
    }
  }

  // Generate party code
  const lastParty = await prisma.party.findFirst({
    orderBy: { partyCode: 'desc' },
  });

  const lastNumber = lastParty
    ? parseInt(lastParty.partyCode.replace('PARTY', ''))
    : 0;
  const partyCode = generateCode('PARTY', lastNumber, 3);

  // Create party
  const party = await prisma.party.create({
    data: {
      partyCode,
      ...data,
      createdById: userId,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'parties',
    recordId: party.id,
    action: AUDIT_ACTION.CREATE,
    newValues: party,
    userId,
    ipAddress,
    userAgent,
  });

  return party;
};

/**
 * Update party
 */
const updateParty = async (id, data, userId, ipAddress, userAgent) => {
  // Get existing party
  const existingParty = await prisma.party.findUnique({
    where: { id: parseInt(id) },
  });

  if (!existingParty || existingParty.isDeleted) {
    throw new ApiError(404, 'Party not found');
  }

  // Check for duplicate name or GSTIN (excluding current party)
  if (data.partyName || data.gstin) {
    const duplicate = await prisma.party.findFirst({
      where: {
        id: { not: parseInt(id) },
        OR: [
          ...(data.partyName ? [{ partyName: data.partyName }] : []),
          ...(data.gstin ? [{ gstin: data.gstin }] : []),
        ],
        isDeleted: false,
      },
    });

    if (duplicate) {
      if (duplicate.partyName === data.partyName) {
        throw new ApiError(400, 'Party with this name already exists');
      }
      if (duplicate.gstin === data.gstin) {
        throw new ApiError(400, 'Party with this GSTIN already exists');
      }
    }
  }

  // Update party
  const updatedParty = await prisma.party.update({
    where: { id: parseInt(id) },
    data: {
      ...data,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'parties',
    recordId: updatedParty.id,
    action: AUDIT_ACTION.UPDATE,
    oldValues: existingParty,
    newValues: updatedParty,
    userId,
    ipAddress,
    userAgent,
  });

  return updatedParty;
};

/**
 * Delete party (soft delete)
 */
const deleteParty = async (id, userId, ipAddress, userAgent) => {
  const party = await prisma.party.findUnique({
    where: { id: parseInt(id) },
  });

  if (!party || party.isDeleted) {
    throw new ApiError(404, 'Party not found');
  }

  // Check if party is used in any consignments
  const consignmentCount = await prisma.consignment.count({
    where: {
      OR: [{ consignorId: parseInt(id) }, { consigneeId: parseInt(id) }],
      isDeleted: false,
    },
  });

  if (consignmentCount > 0) {
    throw new ApiError(
      400,
      'Cannot delete party that is used in consignments. Please deactivate instead.'
    );
  }

  // Soft delete
  const deletedParty = await prisma.party.update({
    where: { id: parseInt(id) },
    data: {
      isDeleted: true,
      isActive: false,
      updatedById: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    tableName: 'parties',
    recordId: deletedParty.id,
    action: AUDIT_ACTION.DELETE,
    oldValues: party,
    userId,
    ipAddress,
    userAgent,
  });

  return deletedParty;
};

/**
 * Search parties (for autocomplete)
 */
const searchParties = async (query, type = null, limit = 10) => {
  const where = {
    isDeleted: false,
    isActive: true,
    partyName: {
      contains: query,
      mode: 'insensitive',
    },
  };

  if (type) {
    where.partyType = type;
  }

  return await prisma.party.findMany({
    where,
    take: parseInt(limit),
    orderBy: { partyName: 'asc' },
    select: {
      id: true,
      partyCode: true,
      partyName: true,
      partyType: true,
      gstin: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      pincode: true,
      contactPerson: true,
      mobile: true,
      email: true,
    },
  });
};

module.exports = {
  getParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  searchParties,
};
