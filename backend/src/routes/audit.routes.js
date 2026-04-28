const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/audit.controller');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAuditLogs);

module.exports = router;
