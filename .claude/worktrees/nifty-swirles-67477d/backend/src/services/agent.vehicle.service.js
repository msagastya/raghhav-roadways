const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all vehicles for an agent
 * @param {number} agentId
 * @param {Object} filters
 * @returns {Object} - vehicles with pagination
 */
const getVehicles = async (agentId, filters = {}) => {
    const { page = 1, limit = 10, search, isActive } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
        agentId,
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(search && {
            OR: [
                { vehicleNo: { contains: search, mode: 'insensitive' } },
                { vehicleType: { contains: search, mode: 'insensitive' } },
                { driverName: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    const [vehicles, total] = await Promise.all([
        prisma.agentVehicle.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.agentVehicle.count({ where }),
    ]);

    return {
        vehicles,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / take),
        },
    };
};

/**
 * Get vehicle by ID (only if owned by agent)
 * @param {number} agentId
 * @param {number} vehicleId
 * @returns {Object} - vehicle details
 */
const getVehicleById = async (agentId, vehicleId) => {
    const vehicle = await prisma.agentVehicle.findFirst({
        where: {
            id: vehicleId,
            agentId,
        },
        include: {
            availability: {
                where: {
                    date: { gte: new Date() },
                },
                orderBy: { date: 'asc' },
                take: 7,
            },
        },
    });

    if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    return vehicle;
};

/**
 * Create new vehicle
 * @param {number} agentId
 * @param {Object} vehicleData
 * @returns {Object} - created vehicle
 */
const createVehicle = async (agentId, vehicleData) => {
    const {
        vehicleNo,
        vehicleType,
        vehicleCapacity,
        rcNumber,
        rcExpiry,
        insuranceNumber,
        insuranceExpiry,
        fitnessExpiry,
        pollutionExpiry,
        driverName,
        driverMobile,
        driverLicense,
        notes,
    } = vehicleData;

    // Check if vehicle number already exists
    const existingVehicle = await prisma.agentVehicle.findUnique({
        where: { vehicleNo: vehicleNo.toUpperCase().replace(/\s/g, '') },
    });

    if (existingVehicle) {
        throw new ApiError(400, 'Vehicle with this number already registered');
    }

    const vehicle = await prisma.agentVehicle.create({
        data: {
            agentId,
            vehicleNo: vehicleNo.toUpperCase().replace(/\s/g, ''),
            vehicleType,
            vehicleCapacity: vehicleCapacity ? parseFloat(vehicleCapacity) : null,
            rcNumber,
            rcExpiry: rcExpiry ? new Date(rcExpiry) : null,
            insuranceNumber,
            insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
            fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,
            pollutionExpiry: pollutionExpiry ? new Date(pollutionExpiry) : null,
            driverName,
            driverMobile,
            driverLicense,
            notes,
            isVerified: false, // Admin needs to verify
            isActive: true,
        },
    });

    logger.info(`Agent vehicle created: ${vehicle.vehicleNo}`);

    return vehicle;
};

/**
 * Update vehicle
 * @param {number} agentId
 * @param {number} vehicleId
 * @param {Object} updateData
 * @returns {Object} - updated vehicle
 */
const updateVehicle = async (agentId, vehicleId, updateData) => {
    // Verify ownership
    const existingVehicle = await prisma.agentVehicle.findFirst({
        where: { id: vehicleId, agentId },
    });

    if (!existingVehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    const {
        vehicleType,
        vehicleCapacity,
        rcNumber,
        rcExpiry,
        insuranceNumber,
        insuranceExpiry,
        fitnessExpiry,
        pollutionExpiry,
        driverName,
        driverMobile,
        driverLicense,
        notes,
    } = updateData;

    const vehicle = await prisma.agentVehicle.update({
        where: { id: vehicleId },
        data: {
            ...(vehicleType !== undefined && { vehicleType }),
            ...(vehicleCapacity !== undefined && {
                vehicleCapacity: vehicleCapacity ? parseFloat(vehicleCapacity) : null
            }),
            ...(rcNumber !== undefined && { rcNumber }),
            ...(rcExpiry !== undefined && { rcExpiry: rcExpiry ? new Date(rcExpiry) : null }),
            ...(insuranceNumber !== undefined && { insuranceNumber }),
            ...(insuranceExpiry !== undefined && {
                insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null
            }),
            ...(fitnessExpiry !== undefined && {
                fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null
            }),
            ...(pollutionExpiry !== undefined && {
                pollutionExpiry: pollutionExpiry ? new Date(pollutionExpiry) : null
            }),
            ...(driverName !== undefined && { driverName }),
            ...(driverMobile !== undefined && { driverMobile }),
            ...(driverLicense !== undefined && { driverLicense }),
            ...(notes !== undefined && { notes }),
            // Reset verification if critical fields are updated
            isVerified: false,
        },
    });

    logger.info(`Agent vehicle updated: ${vehicle.vehicleNo}`);

    return vehicle;
};

/**
 * Upload vehicle document
 * @param {number} agentId
 * @param {number} vehicleId
 * @param {string} documentType
 * @param {string} filePath
 * @returns {Object} - updated vehicle
 */
const uploadDocument = async (agentId, vehicleId, documentType, filePath) => {
    // Verify ownership
    const existingVehicle = await prisma.agentVehicle.findFirst({
        where: { id: vehicleId, agentId },
    });

    if (!existingVehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    const fieldMap = {
        rc: 'rcFilePath',
        insurance: 'insuranceFilePath',
        fitness: 'fitnessFilePath',
        pollution: 'pollutionFilePath',
        photo: 'vehiclePhoto',
    };

    const field = fieldMap[documentType];
    if (!field) {
        throw new ApiError(400, 'Invalid document type');
    }

    const vehicle = await prisma.agentVehicle.update({
        where: { id: vehicleId },
        data: {
            [field]: filePath,
            isVerified: false, // Require re-verification when documents change
        },
    });

    logger.info(`Agent vehicle document uploaded: ${vehicle.vehicleNo} - ${documentType}`);

    return vehicle;
};

/**
 * Delete vehicle (soft delete)
 * @param {number} agentId
 * @param {number} vehicleId
 */
const deleteVehicle = async (agentId, vehicleId) => {
    // Verify ownership
    const existingVehicle = await prisma.agentVehicle.findFirst({
        where: { id: vehicleId, agentId },
    });

    if (!existingVehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    await prisma.agentVehicle.update({
        where: { id: vehicleId },
        data: { isActive: false },
    });

    logger.info(`Agent vehicle deactivated: ${existingVehicle.vehicleNo}`);
};

/**
 * Get expiring documents for agent
 * @param {number} agentId
 * @param {number} daysAhead
 * @returns {Array} - vehicles with expiring documents
 */
const getExpiringDocuments = async (agentId, daysAhead = 30) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(daysAhead));

    const vehicles = await prisma.agentVehicle.findMany({
        where: {
            agentId,
            isActive: true,
            OR: [
                { rcExpiry: { lte: futureDate } },
                { insuranceExpiry: { lte: futureDate } },
                { fitnessExpiry: { lte: futureDate } },
                { pollutionExpiry: { lte: futureDate } },
            ],
        },
        select: {
            id: true,
            vehicleNo: true,
            vehicleType: true,
            rcExpiry: true,
            insuranceExpiry: true,
            fitnessExpiry: true,
            pollutionExpiry: true,
        },
    });

    // Transform to show which documents are expiring
    return vehicles.map(v => {
        const expiringDocs = [];
        const now = new Date();

        if (v.rcExpiry && v.rcExpiry <= futureDate) {
            expiringDocs.push({
                type: 'RC',
                expiryDate: v.rcExpiry,
                isExpired: v.rcExpiry < now,
            });
        }
        if (v.insuranceExpiry && v.insuranceExpiry <= futureDate) {
            expiringDocs.push({
                type: 'Insurance',
                expiryDate: v.insuranceExpiry,
                isExpired: v.insuranceExpiry < now,
            });
        }
        if (v.fitnessExpiry && v.fitnessExpiry <= futureDate) {
            expiringDocs.push({
                type: 'Fitness',
                expiryDate: v.fitnessExpiry,
                isExpired: v.fitnessExpiry < now,
            });
        }
        if (v.pollutionExpiry && v.pollutionExpiry <= futureDate) {
            expiringDocs.push({
                type: 'PUC',
                expiryDate: v.pollutionExpiry,
                isExpired: v.pollutionExpiry < now,
            });
        }

        return {
            id: v.id,
            vehicleNo: v.vehicleNo,
            vehicleType: v.vehicleType,
            expiringDocuments: expiringDocs,
        };
    });
};

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    uploadDocument,
    deleteVehicle,
    getExpiringDocuments,
};
