const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Generate unique agent code
 */
const generateAgentCode = async () => {
  const lastAgent = await prisma.agent.findFirst({
    orderBy: { id: 'desc' },
    select: { agentCode: true }
  });

  let nextNumber = 1;
  if (lastAgent && lastAgent.agentCode) {
    const match = lastAgent.agentCode.match(/AGT(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }

  return `AGT${String(nextNumber).padStart(5, '0')}`;
};

/**
 * Register new agent
 * @param {Object} agentData
 * @returns {Object} - created agent info
 */
const register = async (agentData) => {
  const { email, password, fullName, mobile, address, cityId, stateId, pincode } = agentData;

  // Check if agent already exists
  const existingAgent = await prisma.agent.findFirst({
    where: {
      OR: [{ email }, { mobile }],
    },
  });

  if (existingAgent) {
    if (existingAgent.email === email) {
      throw new ApiError(400, 'Email already registered');
    }
    if (existingAgent.mobile === mobile) {
      throw new ApiError(400, 'Mobile number already registered');
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate unique agent code
  const agentCode = await generateAgentCode();

  // Create agent
  const agent = await prisma.agent.create({
    data: {
      agentCode,
      email,
      passwordHash: hashedPassword,
      fullName,
      mobile,
      address,
      cityId: cityId ? parseInt(cityId) : null,
      stateId: stateId ? parseInt(stateId) : null,
      pincode,
      isActive: false, // Inactive until approved
      approvalStatus: 'pending',
    },
    select: {
      id: true,
      agentCode: true,
      email: true,
      fullName: true,
      mobile: true,
      approvalStatus: true,
      createdAt: true,
    },
  });

  logger.info(`New agent registered: ${agentCode}`);

  return agent;
};

/**
 * Agent login
 * @param {string} email
 * @param {string} password
 * @returns {Object} - tokens and agent info
 */
const login = async (email, password) => {
  // Find agent
  const agent = await prisma.agent.findUnique({
    where: { email },
    include: {
      vehicles: {
        where: { isActive: true },
        select: { id: true, vehicleNo: true, vehicleType: true }
      }
    }
  });

  if (!agent) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (agent.approvalStatus === 'pending') {
    throw new ApiError(401, 'Your account is pending approval. Please wait for admin verification.');
  }

  if (agent.approvalStatus === 'rejected') {
    throw new ApiError(401, 'Your account registration was rejected. Please contact support.');
  }

  if (!agent.isActive) {
    throw new ApiError(401, 'Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, agent.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Create token payload - using 'agent' type to differentiate from admin users
  const tokenPayload = {
    agentId: agent.id,
    agentCode: agent.agentCode,
    email: agent.email,
    type: 'agent',
  };

  // Generate tokens
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Update last login
  await prisma.agent.update({
    where: { id: agent.id },
    data: { lastLogin: new Date() },
  });

  logger.info(`Agent ${agent.agentCode} logged in`);

  return {
    accessToken,
    refreshToken,
    agent: {
      id: agent.id,
      agentCode: agent.agentCode,
      email: agent.email,
      fullName: agent.fullName,
      mobile: agent.mobile,
      profilePhoto: agent.profilePhoto,
      vehicleCount: agent.vehicles.length,
    },
  };
};

/**
 * Refresh access token
 * @param {string} refreshToken
 * @returns {Object} - new tokens
 */
const refreshAccessToken = async (token) => {
  try {
    const decoded = verifyRefreshToken(token);

    // Only allow agent tokens
    if (decoded.type !== 'agent') {
      throw new ApiError(401, 'Invalid token type');
    }

    // Get agent to verify still active
    const agent = await prisma.agent.findUnique({
      where: { id: decoded.agentId },
    });

    if (!agent || !agent.isActive) {
      throw new ApiError(401, 'Agent not found or inactive');
    }

    // Create new token payload
    const tokenPayload = {
      agentId: agent.id,
      agentCode: agent.agentCode,
      email: agent.email,
      type: 'agent',
    };

    // Generate new tokens
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};

/**
 * Get agent by ID
 * @param {number} agentId
 * @returns {Object} - agent details
 */
const getAgentById = async (agentId) => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      agentCode: true,
      email: true,
      fullName: true,
      mobile: true,
      address: true,
      cityId: true,
      stateId: true,
      pincode: true,
      profilePhoto: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      vehicles: {
        where: { isActive: true },
        select: {
          id: true,
          vehicleNo: true,
          vehicleType: true,
          vehicleCapacity: true,
          isVerified: true,
        }
      },
    },
  });

  if (!agent) {
    throw new ApiError(404, 'Agent not found');
  }

  return agent;
};

/**
 * Update agent profile
 * @param {number} agentId
 * @param {Object} updateData
 * @returns {Object} - updated agent
 */
const updateProfile = async (agentId, updateData) => {
  const { fullName, mobile, address, cityId, stateId, pincode } = updateData;

  // Check if mobile is being changed and already exists
  if (mobile) {
    const existingAgent = await prisma.agent.findFirst({
      where: {
        mobile,
        id: { not: agentId }
      }
    });

    if (existingAgent) {
      throw new ApiError(400, 'Mobile number already registered with another account');
    }
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: {
      ...(fullName && { fullName }),
      ...(mobile && { mobile }),
      ...(address !== undefined && { address }),
      ...(cityId !== undefined && { cityId: cityId ? parseInt(cityId) : null }),
      ...(stateId !== undefined && { stateId: stateId ? parseInt(stateId) : null }),
      ...(pincode !== undefined && { pincode }),
    },
    select: {
      id: true,
      agentCode: true,
      email: true,
      fullName: true,
      mobile: true,
      address: true,
      cityId: true,
      stateId: true,
      pincode: true,
      profilePhoto: true,
    },
  });

  logger.info(`Agent ${agent.agentCode} updated profile`);

  return agent;
};

/**
 * Update agent profile photo
 * @param {number} agentId
 * @param {string} photoPath
 * @returns {Object} - updated agent
 */
const updateProfilePhoto = async (agentId, photoPath) => {
  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { profilePhoto: photoPath },
    select: {
      id: true,
      profilePhoto: true,
    },
  });

  return agent;
};

/**
 * Change agent password
 * @param {number} agentId
 * @param {string} oldPassword
 * @param {string} newPassword
 */
const changePassword = async (agentId, oldPassword, newPassword) => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
  });

  if (!agent) {
    throw new ApiError(404, 'Agent not found');
  }

  // Verify old password
  const isPasswordValid = await bcrypt.compare(oldPassword, agent.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.agent.update({
    where: { id: agentId },
    data: { passwordHash: hashedPassword },
  });

  logger.info(`Agent ${agent.agentCode} changed password`);
};

/**
 * Get agent dashboard stats
 * @param {number} agentId
 * @returns {Object} - dashboard statistics
 */
const getDashboardStats = async (agentId) => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      vehicles: {
        where: { isActive: true },
      },
      availability: {
        where: {
          date: { gte: new Date() }
        }
      }
    }
  });

  if (!agent) {
    throw new ApiError(404, 'Agent not found');
  }

  // Get vehicle stats
  const totalVehicles = agent.vehicles.length;
  const verifiedVehicles = agent.vehicles.filter(v => v.isVerified).length;
  
  // Get availability stats for next 7 days
  const upcomingAvailability = agent.availability.filter(a => a.isAvailable).length;

  // Get vehicles with expiring documents (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringDocuments = agent.vehicles.filter(v => {
    const checkExpiry = (date) => date && new Date(date) <= thirtyDaysFromNow;
    return checkExpiry(v.rcExpiry) || checkExpiry(v.insuranceExpiry) || 
           checkExpiry(v.fitnessExpiry) || checkExpiry(v.pollutionExpiry);
  }).length;

  return {
    totalVehicles,
    verifiedVehicles,
    pendingVerification: totalVehicles - verifiedVehicles,
    upcomingAvailability,
    expiringDocuments,
    memberSince: agent.createdAt,
    lastLogin: agent.lastLogin,
  };
};

module.exports = {
  register,
  login,
  refreshAccessToken,
  getAgentById,
  updateProfile,
  updateProfilePhoto,
  changePassword,
  getDashboardStats,
};
