const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../config/swagger');

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
const exportRoutes = require('./export.routes');
const gstRoutes = require('./gst.routes');
const trackingRoutes = require('./tracking.routes');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Swagger API Documentation
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Raghhav Roadways API Docs'
}));

// Swagger JSON endpoint
router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Mount routes
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
router.use('/export', exportRoutes);
router.use('/gst', gstRoutes);
router.use('/track', trackingRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Raghhav Roadways API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    endpoints: {
      auth: '/api/v1/auth',
      parties: '/api/v1/parties',
      vehicles: '/api/v1/vehicles',
      consignments: '/api/v1/consignments',
      invoices: '/api/v1/invoices',
      payments: '/api/v1/payments',
      reports: '/api/v1/reports',
      masters: '/api/v1/masters',
      export: '/api/v1/export',
      gst: '/api/v1/gst',
      tracking: '/api/v1/track',
    },
  });
});

module.exports = router;
