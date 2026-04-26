const express = require('express');
const router = express.Router();
const agentAuthController = require('../controllers/agent.auth.controller');
const { authenticateAgent } = require('../middleware/agent.auth');
const { validate } = require('../middleware/validator');
const {
    agentRegisterValidation,
    agentLoginValidation,
    agentRefreshTokenValidation,
    agentChangePasswordValidation,
    agentProfileUpdateValidation,
} = require('../validations/agent.auth.validation');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/v1/agent/auth/register
 * @desc    Register new agent
 * @access  Public
 */
router.post(
    '/register',
    authLimiter,
    agentRegisterValidation,
    validate,
    agentAuthController.register
);

/**
 * @route   POST /api/v1/agent/auth/login
 * @desc    Agent login
 * @access  Public
 */
router.post(
    '/login',
    authLimiter,
    agentLoginValidation,
    validate,
    agentAuthController.login
);

/**
 * @route   POST /api/v1/agent/auth/logout
 * @desc    Agent logout
 * @access  Private (Agent)
 */
router.post('/logout', authenticateAgent, agentAuthController.logout);

/**
 * @route   POST /api/v1/agent/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
    '/refresh',
    agentRefreshTokenValidation,
    validate,
    agentAuthController.refreshToken
);

/**
 * @route   GET /api/v1/agent/auth/me
 * @desc    Get agent profile
 * @access  Private (Agent)
 */
router.get('/me', authenticateAgent, agentAuthController.getProfile);

/**
 * @route   PATCH /api/v1/agent/auth/profile
 * @desc    Update agent profile
 * @access  Private (Agent)
 */
router.patch(
    '/profile',
    authenticateAgent,
    agentProfileUpdateValidation,
    validate,
    agentAuthController.updateProfile
);

/**
 * @route   POST /api/v1/agent/auth/change-password
 * @desc    Change password
 * @access  Private (Agent)
 */
router.post(
    '/change-password',
    authenticateAgent,
    agentChangePasswordValidation,
    validate,
    agentAuthController.changePassword
);

/**
 * @route   GET /api/v1/agent/auth/dashboard
 * @desc    Get dashboard statistics
 * @access  Private (Agent)
 */
router.get('/dashboard', authenticateAgent, agentAuthController.getDashboardStats);

module.exports = router;
