const agentAuthService = require('../services/agent.auth.service');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Register new agent
 * POST /api/v1/agent/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, fullName, mobile, address, cityId, stateId, pincode } = req.body;

    const agent = await agentAuthService.register({
        email,
        password,
        fullName,
        mobile,
        address,
        cityId,
        stateId,
        pincode,
    });

    logger.info(`New agent registered: ${agent.agentCode}`);

    res.status(201).json({
        success: true,
        message: 'Registration successful! Your account is pending approval. We will notify you once approved.',
        data: agent,
    });
});

/**
 * Agent login
 * POST /api/v1/agent/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await agentAuthService.login(email, password);

    logger.info(`Agent ${result.agent.agentCode} logged in`);

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: 'strict' };

    res.cookie('agentAccessToken', result.accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.cookie('agentRefreshToken', result.refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { agent: result.agent }, // Tokens moved to httpOnly cookies
    });
});

/**
 * Agent logout
 * POST /api/v1/agent/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
    logger.info(`Agent ${req.agent.agentCode} logged out`);

    res.clearCookie('agentAccessToken');
    res.clearCookie('agentRefreshToken');

    res.status(200).json({
        success: true,
        message: 'Logout successful',
    });
});

/**
 * Refresh access token
 * POST /api/v1/agent/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies.agentRefreshToken;

    if (!token) {
        throw new ApiError(401, 'Refresh token required');
    }

    const result = await agentAuthService.refreshAccessToken(token);

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('agentAccessToken', result.accessToken, {
        httpOnly: true, secure: isProd, sameSite: 'strict', maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
    });
});

/**
 * Get agent profile
 * GET /api/v1/agent/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
    const agent = await agentAuthService.getAgentById(req.agent.id);

    res.status(200).json({
        success: true,
        data: agent,
    });
});

/**
 * Update agent profile
 * PATCH /api/v1/agent/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, mobile, address, cityId, stateId, pincode } = req.body;

    const agent = await agentAuthService.updateProfile(req.agent.id, {
        fullName,
        mobile,
        address,
        cityId,
        stateId,
        pincode,
    });

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: agent,
    });
});

/**
 * Update profile photo
 * POST /api/v1/agent/auth/profile-photo
 */
const updateProfilePhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded',
        });
    }

    const photoPath = `/uploads/agent-photos/${req.file.filename}`;
    const agent = await agentAuthService.updateProfilePhoto(req.agent.id, photoPath);

    res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: agent,
    });
});

/**
 * Change password
 * POST /api/v1/agent/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    await agentAuthService.changePassword(req.agent.id, oldPassword, newPassword);

    logger.info(`Agent ${req.agent.agentCode} changed password`);

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});

/**
 * Get dashboard stats
 * GET /api/v1/agent/auth/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await agentAuthService.getDashboardStats(req.agent.id);

    res.status(200).json({
        success: true,
        data: stats,
    });
});

module.exports = {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    updateProfilePhoto,
    changePassword,
    getDashboardStats,
};
