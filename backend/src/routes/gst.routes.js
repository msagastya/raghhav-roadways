const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  generateGSTR1,
  generateGSTR3B,
  generateHSNSummary,
  exportGSTR1ToExcel
} = require('../services/gst.service');

/**
 * @swagger
 * /api/v1/gst/gstr1:
 *   get:
 *     summary: Generate GSTR-1 report
 *     tags: [GST Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 */
router.get('/gstr1', authenticate, authorize('report.gst'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const data = await generateGSTR1(startDate, endDate);

    res.json({
      success: true,
      message: 'GSTR-1 report generated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/gst/gstr1/export:
 *   get:
 *     summary: Export GSTR-1 to Excel
 *     tags: [GST Reports]
 */
router.get('/gstr1/export', authenticate, authorize('report.gst'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const buffer = await exportGSTR1ToExcel(startDate, endDate);
    const fileName = `GSTR1_${startDate}_to_${endDate}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/gst/gstr3b:
 *   get:
 *     summary: Generate GSTR-3B summary
 *     tags: [GST Reports]
 */
router.get('/gstr3b', authenticate, authorize('report.gst'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const data = await generateGSTR3B(startDate, endDate);

    res.json({
      success: true,
      message: 'GSTR-3B summary generated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/gst/hsn-summary:
 *   get:
 *     summary: Generate HSN/SAC Summary
 *     tags: [GST Reports]
 */
router.get('/hsn-summary', authenticate, authorize('report.gst'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const data = await generateHSNSummary(startDate, endDate);

    res.json({
      success: true,
      message: 'HSN Summary generated successfully',
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
