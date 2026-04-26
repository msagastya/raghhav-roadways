const { verifyAccessToken } = require('../config/jwt');
const { ApiError } = require('./errorHandler');
const prisma = require('../config/database');

/**
 * Authenticate Agent JWT token
 * This middleware is SEPARATE from admin auth - agents cannot access admin routes
 */
const authenticateAgent = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            throw new ApiError(401, 'Access token is required');
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Ensure this is an agent token, not an admin token
        if (decoded.type !== 'agent') {
            throw new ApiError(401, 'Invalid token type. Please use agent credentials.');
        }

        // Get agent details
        const agent = await prisma.agent.findUnique({
            where: { id: decoded.agentId },
            select: {
                id: true,
                agentCode: true,
                email: true,
                fullName: true,
                mobile: true,
                isActive: true,
                approvalStatus: true,
            }
        });

        if (!agent) {
            throw new ApiError(401, 'Agent not found');
        }

        if (!agent.isActive) {
            throw new ApiError(401, 'Your account has been deactivated');
        }

        if (agent.approvalStatus !== 'approved') {
            throw new ApiError(401, 'Your account is not approved');
        }

        // Attach agent info to request
        req.agent = {
            id: agent.id,
            agentCode: agent.agentCode,
            email: agent.email,
            fullName: agent.fullName,
            mobile: agent.mobile,
        };

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, 'Invalid or expired token'));
        }
    }
};

/**
 * Optional agent authentication (doesn't fail if no token)
 */
const optionalAgentAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyAccessToken(token);

            if (decoded.type === 'agent') {
                const agent = await prisma.agent.findUnique({
                    where: { id: decoded.agentId },
                    select: {
                        id: true,
                        agentCode: true,
                        email: true,
                        fullName: true,
                        isActive: true,
                    }
                });

                if (agent && agent.isActive) {
                    req.agent = {
                        id: agent.id,
                        agentCode: agent.agentCode,
                        email: agent.email,
                        fullName: agent.fullName,
                    };
                }
            }
        }

        next();
    } catch (error) {
        // Ignore authentication errors for optional auth
        next();
    }
};

/**
 * Ensure agent owns the resource they're trying to access
 * Used to enforce data isolation
 */
const ensureAgentOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = parseInt(req.params.id || req.params.vehicleId);

            if (!resourceId) {
                return next();
            }

            let isOwner = false;

            switch (resourceType) {
                case 'vehicle':
                    const vehicle = await prisma.agentVehicle.findUnique({
                        where: { id: resourceId },
                        select: { agentId: true }
                    });
                    isOwner = vehicle && vehicle.agentId === req.agent.id;
                    break;

                case 'availability':
                    const availability = await prisma.agentAvailability.findUnique({
                        where: { id: resourceId },
                        select: { agentId: true }
                    });
                    isOwner = availability && availability.agentId === req.agent.id;
                    break;

                default:
                    isOwner = true;
            }

            if (!isOwner) {
                throw new ApiError(403, 'You do not have permission to access this resource');
            }

            next();
        } catch (error) {
            if (error instanceof ApiError) {
                next(error);
            } else {
                next(new ApiError(500, 'Error verifying resource ownership'));
            }
        }
    };
};

module.exports = {
    authenticateAgent,
    optionalAgentAuth,
    ensureAgentOwnership,
};
