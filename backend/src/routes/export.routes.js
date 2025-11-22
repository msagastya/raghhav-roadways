const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');
const {
  exportToExcel,
  exportToCSV,
  CONSIGNMENT_COLUMNS,
  INVOICE_COLUMNS,
  PAYMENT_COLUMNS,
  PARTY_COLUMNS,
  VEHICLE_COLUMNS,
  DAILY_REPORT_COLUMNS
} = require('../services/export.service');
const {
  parseExcel,
  parseCSV,
  importParties,
  importConsignorConsignees,
  importVehicles,
  generateImportTemplate
} = require('../services/import.service');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel and CSV files are allowed.'));
    }
  }
});

/**
 * @swagger
 * /api/v1/export/consignments:
 *   get:
 *     summary: Export consignments to Excel/CSV
 *     tags: [Export]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *         default: xlsx
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/consignments', authenticate, authorize('consignment.view'), async (req, res) => {
  try {
    const { format = 'xlsx', status, fromDate, toDate, consignorId, vehicleId } = req.query;

    const where = { isDeleted: false };
    if (status) where.status = status;
    if (consignorId) where.consignorId = parseInt(consignorId);
    if (vehicleId) where.vehicleId = parseInt(vehicleId);
    if (fromDate || toDate) {
      where.grDate = {};
      if (fromDate) where.grDate.gte = new Date(fromDate);
      if (toDate) where.grDate.lte = new Date(toDate);
    }

    const consignments = await prisma.consignment.findMany({
      where,
      include: {
        consignor: { select: { partyName: true } },
        consignee: { select: { partyName: true } },
        vehicle: { select: { vehicleNo: true } }
      },
      orderBy: { grDate: 'desc' }
    });

    const fileName = `consignments_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(consignments, { columns: CONSIGNMENT_COLUMNS, fileName });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.send(csv);
    }

    const buffer = exportToExcel(consignments, {
      sheetName: 'Consignments',
      columns: CONSIGNMENT_COLUMNS,
      fileName
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/invoices:
 *   get:
 *     summary: Export invoices to Excel/CSV
 *     tags: [Export]
 */
router.get('/invoices', authenticate, authorize('invoice.view'), async (req, res) => {
  try {
    const { format = 'xlsx', paymentStatus, fromDate, toDate, partyId } = req.query;

    const where = { isDeleted: false };
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (partyId) where.partyId = parseInt(partyId);
    if (fromDate || toDate) {
      where.invoiceDate = {};
      if (fromDate) where.invoiceDate.gte = new Date(fromDate);
      if (toDate) where.invoiceDate.lte = new Date(toDate);
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        party: { select: { partyName: true } }
      },
      orderBy: { invoiceDate: 'desc' }
    });

    const fileName = `invoices_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(invoices, { columns: INVOICE_COLUMNS, fileName });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.send(csv);
    }

    const buffer = exportToExcel(invoices, {
      sheetName: 'Invoices',
      columns: INVOICE_COLUMNS,
      fileName
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/payments:
 *   get:
 *     summary: Export payments to Excel/CSV
 *     tags: [Export]
 */
router.get('/payments', authenticate, authorize('payment.view'), async (req, res) => {
  try {
    const { format = 'xlsx', paymentStatus, fromDate, toDate } = req.query;

    const where = { isDeleted: false };
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) where.paymentDate.lte = new Date(toDate);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        invoice: { select: { invoiceNumber: true } },
        party: { select: { partyName: true } }
      },
      orderBy: { paymentDate: 'desc' }
    });

    const fileName = `payments_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(payments, { columns: PAYMENT_COLUMNS, fileName });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.send(csv);
    }

    const buffer = exportToExcel(payments, {
      sheetName: 'Payments',
      columns: PAYMENT_COLUMNS,
      fileName
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/parties:
 *   get:
 *     summary: Export parties to Excel/CSV
 *     tags: [Export]
 */
router.get('/parties', authenticate, authorize('master.party.view'), async (req, res) => {
  try {
    const { format = 'xlsx', partyType } = req.query;

    const where = { isDeleted: false, isActive: true };
    if (partyType) where.partyType = partyType;

    const parties = await prisma.party.findMany({
      where,
      orderBy: { partyName: 'asc' }
    });

    const fileName = `parties_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(parties, { columns: PARTY_COLUMNS, fileName });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.send(csv);
    }

    const buffer = exportToExcel(parties, {
      sheetName: 'Parties',
      columns: PARTY_COLUMNS,
      fileName
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/vehicles:
 *   get:
 *     summary: Export vehicles to Excel/CSV
 *     tags: [Export]
 */
router.get('/vehicles', authenticate, authorize('master.vehicle.view'), async (req, res) => {
  try {
    const { format = 'xlsx' } = req.query;

    const vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false, isActive: true },
      orderBy: { vehicleNo: 'asc' }
    });

    const fileName = `vehicles_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(vehicles, { columns: VEHICLE_COLUMNS, fileName });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
      return res.send(csv);
    }

    const buffer = exportToExcel(vehicles, {
      sheetName: 'Vehicles',
      columns: VEHICLE_COLUMNS,
      fileName
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===== IMPORT ROUTES =====

/**
 * @swagger
 * /api/v1/export/import/template/{type}:
 *   get:
 *     summary: Download import template
 *     tags: [Import]
 */
router.get('/import/template/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    const buffer = generateImportTemplate(type);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_import_template.xlsx"`);
    res.send(buffer);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/import/parties:
 *   post:
 *     summary: Import parties from Excel/CSV
 *     tags: [Import]
 */
router.post('/import/parties', authenticate, authorize('master.party.create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isCSV = req.file.mimetype === 'text/csv';
    const data = isCSV ? await parseCSV(req.file.buffer) : parseExcel(req.file.buffer);

    const result = await importParties(data, req.user.id);

    res.json({
      success: true,
      message: `Imported ${result.imported} parties`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/import/consignor-consignees:
 *   post:
 *     summary: Import consignor/consignees from Excel/CSV
 *     tags: [Import]
 */
router.post('/import/consignor-consignees', authenticate, authorize('master.consignor.create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isCSV = req.file.mimetype === 'text/csv';
    const data = isCSV ? await parseCSV(req.file.buffer) : parseExcel(req.file.buffer);

    const result = await importConsignorConsignees(data, req.user.id);

    res.json({
      success: true,
      message: `Imported ${result.imported} consignor/consignees`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/v1/export/import/vehicles:
 *   post:
 *     summary: Import vehicles from Excel/CSV
 *     tags: [Import]
 */
router.post('/import/vehicles', authenticate, authorize('master.vehicle.create'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const isCSV = req.file.mimetype === 'text/csv';
    const data = isCSV ? await parseCSV(req.file.buffer) : parseExcel(req.file.buffer);

    const result = await importVehicles(data, req.user.id);

    res.json({
      success: true,
      message: `Imported ${result.imported} vehicles`,
      data: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
