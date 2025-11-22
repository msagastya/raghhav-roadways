const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { rateLimit } = require('express-rate-limit');

// Rate limit for public tracking endpoint
const trackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many tracking requests. Please try again later.'
  }
});

/**
 * @swagger
 * /api/v1/track/{grNumber}:
 *   get:
 *     summary: Track shipment by GR number (Public endpoint)
 *     tags: [Public Tracking]
 *     parameters:
 *       - in: path
 *         name: grNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: GR Number to track
 *       - in: query
 *         name: mobile
 *         schema:
 *           type: string
 *         description: Mobile number for verification (last 4 digits)
 */
router.get('/:grNumber', trackingLimiter, async (req, res) => {
  try {
    const { grNumber } = req.params;
    const { mobile } = req.query;

    // Find consignment
    const consignment = await prisma.consignment.findFirst({
      where: {
        grNumber: grNumber.toUpperCase(),
        isDeleted: false
      },
      select: {
        id: true,
        grNumber: true,
        grDate: true,
        status: true,
        fromLocation: true,
        toLocation: true,
        vehicleNumber: true,
        noOfPackages: true,
        description: true,
        chargedWeight: true,
        weightUnit: true,
        paymentMode: true,
        bookedAt: true,
        loadedAt: true,
        inTransitAt: true,
        deliveredAt: true,
        podUploaded: true,
        consignor: {
          select: {
            partyName: true,
            city: true,
            state: true,
            mobile: true
          }
        },
        consignee: {
          select: {
            partyName: true,
            city: true,
            state: true,
            mobile: true
          }
        },
        vehicle: {
          select: {
            vehicleNo: true,
            vehicleType: true,
            driverName: true,
            driverMobile: true
          }
        },
        statusHistory: {
          select: {
            fromStatus: true,
            toStatus: true,
            remarks: true,
            changedAt: true
          },
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    if (!consignment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found. Please check the GR number.'
      });
    }

    // Optional: Verify with mobile number (last 4 digits)
    if (mobile) {
      const consignorMobile = consignment.consignor?.mobile?.slice(-4);
      const consigneeMobile = consignment.consignee?.mobile?.slice(-4);

      if (mobile !== consignorMobile && mobile !== consigneeMobile) {
        return res.status(403).json({
          success: false,
          message: 'Mobile number verification failed'
        });
      }
    }

    // Build timeline
    const timeline = [
      {
        status: 'Booked',
        timestamp: consignment.bookedAt,
        completed: true
      },
      {
        status: 'Loaded',
        timestamp: consignment.loadedAt,
        completed: !!consignment.loadedAt
      },
      {
        status: 'In Transit',
        timestamp: consignment.inTransitAt,
        completed: !!consignment.inTransitAt
      },
      {
        status: 'Delivered',
        timestamp: consignment.deliveredAt,
        completed: !!consignment.deliveredAt
      }
    ];

    // Mask sensitive information
    const trackingData = {
      grNumber: consignment.grNumber,
      grDate: consignment.grDate,
      status: consignment.status,
      origin: {
        location: consignment.fromLocation,
        party: consignment.consignor?.partyName,
        city: consignment.consignor?.city,
        state: consignment.consignor?.state
      },
      destination: {
        location: consignment.toLocation,
        party: consignment.consignee?.partyName,
        city: consignment.consignee?.city,
        state: consignment.consignee?.state
      },
      shipmentDetails: {
        packages: consignment.noOfPackages,
        description: consignment.description,
        weight: consignment.chargedWeight ? `${consignment.chargedWeight} ${consignment.weightUnit}` : null
      },
      vehicle: {
        number: consignment.vehicleNumber,
        type: consignment.vehicle?.vehicleType,
        driver: consignment.vehicle?.driverName,
        // Only show driver contact if in transit
        driverContact: consignment.status === 'In Transit' ? consignment.vehicle?.driverMobile : null
      },
      paymentMode: consignment.paymentMode,
      podUploaded: consignment.podUploaded,
      timeline: timeline,
      statusHistory: consignment.statusHistory.map(h => ({
        from: h.fromStatus,
        to: h.toStatus,
        remarks: h.remarks,
        timestamp: h.changedAt
      }))
    };

    res.json({
      success: true,
      message: 'Shipment found',
      data: trackingData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking shipment'
    });
  }
});

/**
 * @swagger
 * /api/v1/track/verify:
 *   post:
 *     summary: Verify and get full shipment details
 *     tags: [Public Tracking]
 */
router.post('/verify', trackingLimiter, async (req, res) => {
  try {
    const { grNumber, mobile } = req.body;

    if (!grNumber || !mobile) {
      return res.status(400).json({
        success: false,
        message: 'GR number and mobile number are required'
      });
    }

    const consignment = await prisma.consignment.findFirst({
      where: {
        grNumber: grNumber.toUpperCase(),
        isDeleted: false,
        OR: [
          { consignor: { mobile: { endsWith: mobile.slice(-4) } } },
          { consignee: { mobile: { endsWith: mobile.slice(-4) } } }
        ]
      },
      include: {
        consignor: {
          select: {
            partyName: true,
            city: true,
            state: true
          }
        },
        consignee: {
          select: {
            partyName: true,
            city: true,
            state: true
          }
        },
        vehicle: {
          select: {
            vehicleNo: true,
            vehicleType: true,
            driverName: true,
            driverMobile: true
          }
        },
        statusHistory: {
          orderBy: { changedAt: 'asc' }
        }
      }
    });

    if (!consignment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or mobile verification failed'
      });
    }

    res.json({
      success: true,
      message: 'Shipment verified',
      data: {
        grNumber: consignment.grNumber,
        grDate: consignment.grDate,
        status: consignment.status,
        from: consignment.fromLocation,
        to: consignment.toLocation,
        consignor: consignment.consignor?.partyName,
        consignee: consignment.consignee?.partyName,
        vehicle: consignment.vehicleNumber,
        driver: consignment.vehicle?.driverName,
        driverMobile: consignment.status === 'In Transit' ? consignment.vehicle?.driverMobile : null,
        packages: consignment.noOfPackages,
        weight: `${consignment.chargedWeight || 0} ${consignment.weightUnit}`,
        bookedAt: consignment.bookedAt,
        deliveredAt: consignment.deliveredAt,
        statusHistory: consignment.statusHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying shipment'
    });
  }
});

/**
 * @swagger
 * /api/v1/track/by-mobile/{mobile}:
 *   get:
 *     summary: Get all shipments by mobile number
 *     tags: [Public Tracking]
 */
router.get('/by-mobile/:mobile', trackingLimiter, async (req, res) => {
  try {
    const { mobile } = req.params;

    if (!mobile || mobile.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid mobile number is required'
      });
    }

    const consignments = await prisma.consignment.findMany({
      where: {
        isDeleted: false,
        OR: [
          { consignor: { mobile: { contains: mobile.slice(-10) } } },
          { consignee: { mobile: { contains: mobile.slice(-10) } } }
        ]
      },
      select: {
        grNumber: true,
        grDate: true,
        status: true,
        fromLocation: true,
        toLocation: true,
        vehicleNumber: true,
        bookedAt: true,
        deliveredAt: true,
        consignor: { select: { partyName: true } },
        consignee: { select: { partyName: true } }
      },
      orderBy: { grDate: 'desc' },
      take: 20 // Limit to last 20 shipments
    });

    res.json({
      success: true,
      message: `Found ${consignments.length} shipments`,
      data: consignments.map(c => ({
        grNumber: c.grNumber,
        grDate: c.grDate,
        status: c.status,
        from: c.fromLocation,
        to: c.toLocation,
        consignor: c.consignor?.partyName,
        consignee: c.consignee?.partyName,
        vehicle: c.vehicleNumber
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching shipments'
    });
  }
});

module.exports = router;
