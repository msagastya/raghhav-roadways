const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const permissionRoutes = require('./permission.routes');
const partyRoutes = require('./party.routes');
const vehicleRoutes = require('./vehicle.routes');
const consignmentRoutes = require('./consignment.routes');
const invoiceRoutes = require('./invoice.routes');
const paymentRoutes = require('./payment.routes');
const reportRoutes = require('./report.routes');
const mastersRoutes = require('./masters.routes');
const seedRoutes = require('./seed.routes');
const backupRoutes = require('./backup.routes');

// Agent Portal Routes
const agentAuthRoutes = require('./agent.auth.routes');
const agentVehicleRoutes = require('./agent.vehicle.routes');
const agentAvailabilityRoutes = require('./agent.availability.routes');

// Admin Authentication Routes (for dual authentication system)
const adminAuthRoutes = require('./admin.auth.routes');


// Health check route with DB connectivity
router.get('/health', async (req, res) => {
  const prisma = require('../config/database');
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const status = dbStatus === 'connected' ? 200 : 503;
  res.status(status).json({
    success: dbStatus === 'connected',
    message: 'Raghhav Roadways API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: dbStatus,
  });
});

// Mount admin routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/permissions', permissionRoutes);
router.use('/parties', partyRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/consignments', consignmentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);
router.use('/masters', mastersRoutes);
router.use('/seed', seedRoutes);
router.use('/backup', backupRoutes);

// Mount agent portal routes (isolated from admin)
router.use('/agent/auth', agentAuthRoutes);
router.use('/agent/vehicles', agentVehicleRoutes);
router.use('/agent/availability', agentAvailabilityRoutes);

// Mount admin authentication routes (separate from user auth)
router.use('/admin/auth', adminAuthRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Raghhav Roadways API',
    version: '1.0.0',
    endpoints: {
      // Admin endpoints
      auth: '/api/v1/auth',
      adminAuth: '/api/v1/admin/auth',
      parties: '/api/v1/parties',
      vehicles: '/api/v1/vehicles',
      consignments: '/api/v1/consignments',
      invoices: '/api/v1/invoices',
      payments: '/api/v1/payments',
      reports: '/api/v1/reports',
      masters: '/api/v1/masters',
      // Agent Portal endpoints
      agentAuth: '/api/v1/agent/auth',
      agentVehicles: '/api/v1/agent/vehicles',
      agentAvailability: '/api/v1/agent/availability',
    },
  });
});

module.exports = router;

