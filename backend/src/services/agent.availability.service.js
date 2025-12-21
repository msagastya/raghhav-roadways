const prisma = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get availability for agent
 * @param {number} agentId
 * @param {Object} filters
 * @returns {Array} - availability records
 */
const getAvailability = async (agentId, filters = {}) => {
    const { vehicleId, startDate, endDate, isAvailable } = filters;

    const where = {
        agentId,
        ...(vehicleId && { vehicleId: parseInt(vehicleId) }),
        ...(isAvailable !== undefined && { isAvailable: isAvailable === 'true' }),
    };

    // Date range filter
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    const availability = await prisma.agentAvailability.findMany({
        where,
        include: {
            vehicle: {
                select: {
                    id: true,
                    vehicleNo: true,
                    vehicleType: true,
                },
            },
        },
        orderBy: [
            { date: 'asc' },
            { vehicleId: 'asc' },
        ],
    });

    return availability;
};

/**
 * Get availability calendar for a vehicle
 * @param {number} agentId
 * @param {number} vehicleId
 * @param {string} month - YYYY-MM format
 * @returns {Object} - calendar data
 */
const getCalendar = async (agentId, vehicleId, month) => {
    // Verify vehicle ownership
    const vehicle = await prisma.agentVehicle.findFirst({
        where: { id: vehicleId, agentId },
        select: { id: true, vehicleNo: true, vehicleType: true },
    });

    if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    // Parse month to get date range
    const [year, monthNum] = month.split('-').map(n => parseInt(n));
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0); // Last day of month

    const availability = await prisma.agentAvailability.findMany({
        where: {
            vehicleId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { date: 'asc' },
    });

    // Create a map for easy lookup
    const availabilityMap = {};
    availability.forEach(a => {
        const dateKey = a.date.toISOString().split('T')[0];
        availabilityMap[dateKey] = {
            id: a.id,
            isAvailable: a.isAvailable,
            startTime: a.startTime,
            endTime: a.endTime,
            preferredRoutes: a.preferredRoutes,
            notes: a.notes,
        };
    });

    return {
        vehicle,
        month,
        availability: availabilityMap,
    };
};

/**
 * Set availability for a vehicle on a date
 * @param {number} agentId
 * @param {Object} data
 * @returns {Object} - created/updated availability
 */
const setAvailability = async (agentId, data) => {
    const { vehicleId, date, isAvailable, startTime, endTime, preferredRoutes, notes } = data;

    // Verify vehicle ownership
    const vehicle = await prisma.agentVehicle.findFirst({
        where: { id: parseInt(vehicleId), agentId },
    });

    if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    // Upsert availability (create or update for this vehicle+date)
    const availability = await prisma.agentAvailability.upsert({
        where: {
            vehicleId_date: {
                vehicleId: parseInt(vehicleId),
                date: new Date(date),
            },
        },
        update: {
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            startTime,
            endTime,
            preferredRoutes,
            notes,
        },
        create: {
            agentId,
            vehicleId: parseInt(vehicleId),
            date: new Date(date),
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            startTime,
            endTime,
            preferredRoutes,
            notes,
        },
        include: {
            vehicle: {
                select: { id: true, vehicleNo: true },
            },
        },
    });

    logger.info(`Availability set for vehicle ${vehicle.vehicleNo} on ${date}`);

    return availability;
};

/**
 * Set availability for multiple dates (bulk)
 * @param {number} agentId
 * @param {Object} data
 * @returns {Object} - result summary
 */
const setBulkAvailability = async (agentId, data) => {
    const { vehicleId, dates, isAvailable, startTime, endTime, preferredRoutes, notes } = data;

    // Verify vehicle ownership
    const vehicle = await prisma.agentVehicle.findFirst({
        where: { id: parseInt(vehicleId), agentId },
    });

    if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    // Use transaction for bulk operation
    const results = await prisma.$transaction(
        dates.map(date =>
            prisma.agentAvailability.upsert({
                where: {
                    vehicleId_date: {
                        vehicleId: parseInt(vehicleId),
                        date: new Date(date),
                    },
                },
                update: {
                    isAvailable: isAvailable !== undefined ? isAvailable : true,
                    startTime,
                    endTime,
                    preferredRoutes,
                    notes,
                },
                create: {
                    agentId,
                    vehicleId: parseInt(vehicleId),
                    date: new Date(date),
                    isAvailable: isAvailable !== undefined ? isAvailable : true,
                    startTime,
                    endTime,
                    preferredRoutes,
                    notes,
                },
            })
        )
    );

    logger.info(`Bulk availability set for vehicle ${vehicle.vehicleNo}: ${dates.length} dates`);

    return {
        vehicleNo: vehicle.vehicleNo,
        datesUpdated: dates.length,
    };
};

/**
 * Update availability
 * @param {number} agentId
 * @param {number} availabilityId
 * @param {Object} updateData
 * @returns {Object} - updated availability
 */
const updateAvailability = async (agentId, availabilityId, updateData) => {
    // Verify ownership
    const existing = await prisma.agentAvailability.findFirst({
        where: { id: availabilityId, agentId },
    });

    if (!existing) {
        throw new ApiError(404, 'Availability record not found');
    }

    const { isAvailable, startTime, endTime, preferredRoutes, notes } = updateData;

    const availability = await prisma.agentAvailability.update({
        where: { id: availabilityId },
        data: {
            ...(isAvailable !== undefined && { isAvailable }),
            ...(startTime !== undefined && { startTime }),
            ...(endTime !== undefined && { endTime }),
            ...(preferredRoutes !== undefined && { preferredRoutes }),
            ...(notes !== undefined && { notes }),
        },
        include: {
            vehicle: {
                select: { id: true, vehicleNo: true },
            },
        },
    });

    return availability;
};

/**
 * Delete availability
 * @param {number} agentId
 * @param {number} availabilityId
 */
const deleteAvailability = async (agentId, availabilityId) => {
    // Verify ownership
    const existing = await prisma.agentAvailability.findFirst({
        where: { id: availabilityId, agentId },
    });

    if (!existing) {
        throw new ApiError(404, 'Availability record not found');
    }

    await prisma.agentAvailability.delete({
        where: { id: availabilityId },
    });

    logger.info(`Availability deleted: ${availabilityId}`);
};

/**
 * Toggle availability status
 * @param {number} agentId
 * @param {number} vehicleId
 * @param {string} date
 * @returns {Object} - updated/created availability
 */
const toggleAvailability = async (agentId, vehicleId, date) => {
    // Verify vehicle ownership
    const vehicle = await prisma.agentVehicle.findFirst({
        where: { id: parseInt(vehicleId), agentId },
    });

    if (!vehicle) {
        throw new ApiError(404, 'Vehicle not found');
    }

    // Check existing
    const existing = await prisma.agentAvailability.findUnique({
        where: {
            vehicleId_date: {
                vehicleId: parseInt(vehicleId),
                date: new Date(date),
            },
        },
    });

    let availability;

    if (existing) {
        // Toggle existing
        availability = await prisma.agentAvailability.update({
            where: { id: existing.id },
            data: { isAvailable: !existing.isAvailable },
        });
    } else {
        // Create as available
        availability = await prisma.agentAvailability.create({
            data: {
                agentId,
                vehicleId: parseInt(vehicleId),
                date: new Date(date),
                isAvailable: true,
            },
        });
    }

    return {
        vehicleNo: vehicle.vehicleNo,
        date,
        isAvailable: availability.isAvailable,
    };
};

module.exports = {
    getAvailability,
    getCalendar,
    setAvailability,
    setBulkAvailability,
    updateAvailability,
    deleteAvailability,
    toggleAvailability,
};
