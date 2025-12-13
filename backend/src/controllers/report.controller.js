const consignmentService = require('../services/consignment.service');
const invoiceService = require('../services/invoice.service');
const paymentService = require('../services/payment.service');
const vehicleService = require('../services/vehicle.service');
const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { formatDate } = require('../utils/helpers');

/**
 * Get dashboard summary
 * GET /api/v1/reports/dashboard
 */
const getDashboardSummary = asyncHandler(async (req, res) => {
  // Get today's data
  const todaysBookings = await consignmentService.getTodaysBookings();
  const todaysPayments = await paymentService.getTodaysPayments();
  const pendingDeliveries = await consignmentService.getPendingDeliveries();
  
  // Get alerts
  const overdueInvoices = await invoiceService.getOverdueInvoices();
  const expiringDocuments = await vehicleService.getExpiringDocuments(30);
  const pendingAmendments = await paymentService.getPendingAmendments();
  
  // Get status summary
  const statusSummary = await consignmentService.getStatusSummary();
  const paymentSummary = await invoiceService.getPaymentSummary();

  // Get recent activity (last 10 actions from audit logs)
  const recentActivity = await prisma.auditLog.findMany({
    take: 10,
    orderBy: {
      changedAt: 'desc',
    },
    include: {
      user: {
        select: {
          username: true,
          fullName: true,
        },
      },
    },
  });

  // Format recent activity
  const formattedActivity = recentActivity.map((log) => ({
    timestamp: log.changedAt,
    type: log.action.toLowerCase(),
    description: generateActivityDescription(log),
    user: log.user.fullName || log.user.username,
  }));

  // Calculate revenue trend (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueTrend = await prisma.$queryRaw`
    SELECT 
      DATE(gr_date) as date,
      SUM(total_amount) as amount
    FROM consignments
    WHERE gr_date >= ${thirtyDaysAgo}
      AND is_deleted = false
    GROUP BY DATE(gr_date)
    ORDER BY DATE(gr_date) ASC
  `;

  // Get top routes (last 30 days)
  const topRoutes = await prisma.$queryRaw`
    SELECT 
      CONCAT(from_location, ' → ', to_location) as route,
      COUNT(*) as count,
      SUM(total_amount) as amount
    FROM consignments
    WHERE gr_date >= ${thirtyDaysAgo}
      AND is_deleted = false
    GROUP BY from_location, to_location
    ORDER BY count DESC
    LIMIT 5
  `;

  // Calculate On-Time Delivery Percentage (last 30 days)
  // Note: This assumes you have an expected_delivery_date field or calculates based on standard delivery time
  const deliveryStats = await prisma.$queryRaw`
    SELECT 
      COUNT(*) as total_delivered,
      COUNT(CASE WHEN delivered_at IS NOT NULL THEN 1 END) as on_time_count
    FROM consignments
    WHERE status = 'Delivered'
      AND gr_date >= ${thirtyDaysAgo}
      AND is_deleted = false
  `;

  const onTimeDeliveryPercentage = deliveryStats[0]?.total_delivered > 0
    ? (Number(deliveryStats[0].on_time_count) / Number(deliveryStats[0].total_delivered)) * 100
    : 0;

  // Calculate Average Delivery Time (last 30 days)
  const avgDeliveryResult = await prisma.$queryRaw`
    SELECT 
      AVG(EXTRACT(EPOCH FROM (delivered_at - gr_date)) / 86400) as avg_days
    FROM consignments
    WHERE status = 'Delivered'
      AND delivered_at IS NOT NULL
      AND gr_date >= ${thirtyDaysAgo}
      AND is_deleted = false
  `;

  const avgDeliveryTime = avgDeliveryResult[0]?.avg_days 
    ? Number(avgDeliveryResult[0].avg_days).toFixed(1)
    : null;

  // Get total counts
  const totalConsignments = await prisma.consignment.count({
    where: { isDeleted: false }
  });

  const totalParties = await prisma.party.count({
    where: { isDeleted: false }
  });

  const activeVehicles = await prisma.vehicle.count({
    where: { isActive: true, isDeleted: false }
  });

  const pendingInvoices = await prisma.invoice.count({
    where: { 
      paymentStatus: { in: ['Pending', 'Partial'] },
      isDeleted: false 
    }
  });

  // Calculate total revenue (all time)
  const totalRevenueResult = await prisma.consignment.aggregate({
    where: { isDeleted: false },
    _sum: { totalAmount: true }
  });

  const totalRevenue = Number(totalRevenueResult._sum.totalAmount || 0);

  // Calculate total alerts count
  const totalAlerts = overdueInvoices.length + expiringDocuments.length + pendingAmendments.length;

  res.status(200).json({
    success: true,
    data: {
      // KPIs for dashboard cards
      kpis: {
        onTimeDelivery: onTimeDeliveryPercentage,
        totalRevenue: totalRevenue,
        activeVehicles: activeVehicles,
        pendingDeliveries: pendingDeliveries.length,
        completedOrders: totalConsignments,
        totalParties: totalParties,
        pendingInvoices: pendingInvoices,
        totalAlerts: totalAlerts,
        avgDeliveryTime: avgDeliveryTime,
      },
      today: {
        bookings: todaysBookings.count,
        bookingsAmount: todaysBookings.totalAmount,
        paymentsReceived: todaysPayments.totalAmount,
        pendingDeliveries: pendingDeliveries.length,
      },
      alerts: {
        overdueInvoices: overdueInvoices.slice(0, 5).map((inv) => ({
          invoiceNumber: inv.invoiceNumber,
          party: inv.party.partyName,
          dueDate: inv.dueDate,
          balanceAmount: inv.balanceAmount,
          overdueDays: Math.ceil(
            (new Date() - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24)
          ),
        })),
        expiringDocuments: expiringDocuments.slice(0, 5),
        pendingAmendments: pendingAmendments.slice(0, 5).map((amend) => ({
          id: amend.id,
          invoiceNumber: amend.invoice?.invoiceNumber,
          amount: amend.amount,
          reason: amend.reason,
        })),
      },
      recentActivity: formattedActivity,
      charts: {
        revenueTrend: revenueTrend.map((item) => ({
          date: formatDate(item.date),
          amount: Number(item.amount),
        })),
        topRoutes: topRoutes.map((route) => ({
          route: route.route,
          count: Number(route.count),
          amount: Number(route.amount),
        })),
        paymentStatusDistribution: paymentSummary,
        consignmentStatusDistribution: statusSummary,
      },
    },
  });
});

/**
 * Get daily report
 * GET /api/v1/reports/daily
 */
const getDailyReport = asyncHandler(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Get bookings
  const bookings = await prisma.consignment.findMany({
    where: {
      grDate: {
        gte: date,
        lt: nextDay,
      },
      isDeleted: false,
    },
    include: {
      consignor: {
        select: {
          partyName: true,
        },
      },
      consignee: {
        select: {
          partyName: true,
        },
      },
    },
    orderBy: {
      grNumber: 'asc',
    },
  });

  // Get deliveries
  const deliveries = await prisma.consignment.findMany({
    where: {
      deliveredAt: {
        gte: date,
        lt: nextDay,
      },
      isDeleted: false,
    },
    include: {
      consignor: {
        select: {
          partyName: true,
        },
      },
      consignee: {
        select: {
          partyName: true,
        },
      },
    },
  });

  // Get payments
  const payments = await prisma.payment.findMany({
    where: {
      paymentDate: {
        gte: date,
        lt: nextDay,
      },
      isDeleted: false,
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
        },
      },
      party: {
        select: {
          partyName: true,
        },
      },
    },
  });

  // Calculate totals
  const totalBookingsAmount = bookings.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const totalPaymentsAmount = payments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  res.status(200).json({
    success: true,
    data: {
      date: formatDate(date),
      summary: {
        totalBookings: bookings.length,
        totalBookingsAmount,
        totalDeliveries: deliveries.length,
        totalPaymentsReceived: totalPaymentsAmount,
      },
      bookings: bookings.map((b) => ({
        grNumber: b.grNumber,
        consignor: b.consignor.partyName,
        consignee: b.consignee.partyName,
        from: b.fromLocation,
        to: b.toLocation,
        amount: b.totalAmount,
      })),
      deliveries: deliveries.map((d) => ({
        grNumber: d.grNumber,
        consignor: d.consignor.partyName,
        consignee: d.consignee.partyName,
        deliveredAt: d.deliveredAt,
      })),
      payments: payments.map((p) => ({
        paymentNumber: p.paymentNumber,
        party: p.party?.partyName,
        invoiceNumber: p.invoice?.invoiceNumber,
        amount: p.amount,
      })),
    },
  });
});

/**
 * Get monthly statement (party-wise)
 * GET /api/v1/reports/monthly-statement
 */
const getMonthlyStatement = asyncHandler(async (req, res) => {
  const { partyId, month } = req.query; // month format: YYYY-MM

  if (!partyId || !month) {
    throw new ApiError(400, 'Party ID and month are required');
  }

  // Parse month
  const [year, monthNum] = month.split('-');
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0, 23, 59, 59);

  // Get party details
  const party = await prisma.party.findUnique({
    where: { id: parseInt(partyId) },
  });

  if (!party) {
    throw new ApiError(404, 'Party not found');
  }

  // Get opening balance (sum of unpaid invoices before this month)
  const openingBalance = await prisma.invoice.aggregate({
    where: {
      partyId: parseInt(partyId),
      invoiceDate: {
        lt: startDate,
      },
      isDeleted: false,
    },
    _sum: {
      balanceAmount: true,
    },
  });

  // Get consignments for this month
  const consignments = await prisma.consignment.findMany({
    where: {
      OR: [
        { consignorId: parseInt(partyId) },
        { consigneeId: parseInt(partyId) },
      ],
      grDate: {
        gte: startDate,
        lte: endDate,
      },
      isDeleted: false,
    },
    orderBy: {
      grDate: 'asc',
    },
  });

  // Get invoices for this month
  const invoices = await prisma.invoice.findMany({
    where: {
      partyId: parseInt(partyId),
      invoiceDate: {
        gte: startDate,
        lte: endDate,
      },
      isDeleted: false,
    },
    include: {
      payments: true,
    },
    orderBy: {
      invoiceDate: 'asc',
    },
  });

  // Get payments for this month
  const payments = await prisma.payment.findMany({
    where: {
      partyId: parseInt(partyId),
      paymentDate: {
        gte: startDate,
        lte: endDate,
      },
      isDeleted: false,
    },
    orderBy: {
      paymentDate: 'asc',
    },
  });

  // Calculate totals
  const totalInvoiceAmount = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );
  const totalPayments = payments.reduce(
    (sum, pay) => sum + Number(pay.amount),
    0
  );
  const closingBalance = Number(openingBalance._sum.balanceAmount || 0) +
    totalInvoiceAmount -
    totalPayments;

  // Aging analysis
  const today = new Date();
  const aging = {
    current: 0, // 0-30 days
    thirtyToSixty: 0, // 31-60 days
    sixtyToNinety: 0, // 61-90 days
    overNinety: 0, // >90 days
  };

  invoices.forEach((inv) => {
    if (inv.balanceAmount > 0 && inv.dueDate) {
      const daysDiff = Math.ceil(
        (today - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24)
      );
      const balance = Number(inv.balanceAmount);

      if (daysDiff <= 30) {
        aging.current += balance;
      } else if (daysDiff <= 60) {
        aging.thirtyToSixty += balance;
      } else if (daysDiff <= 90) {
        aging.sixtyToNinety += balance;
      } else {
        aging.overNinety += balance;
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      party: {
        name: party.partyName,
        gstin: party.gstin,
        address: [party.addressLine1, party.city, party.state].filter(Boolean).join(', '),
      },
      period: {
        month,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
      summary: {
        openingBalance: openingBalance._sum.balanceAmount || 0,
        totalInvoices: totalInvoiceAmount,
        totalPayments,
        closingBalance,
      },
      consignments: consignments.map((c) => ({
        grNumber: c.grNumber,
        grDate: formatDate(c.grDate),
        from: c.fromLocation,
        to: c.toLocation,
        amount: c.totalAmount,
      })),
      invoices: invoices.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: formatDate(inv.invoiceDate),
        totalAmount: inv.totalAmount,
        paidAmount: inv.paidAmount,
        balanceAmount: inv.balanceAmount,
        paymentStatus: inv.paymentStatus,
      })),
      payments: payments.map((pay) => ({
        paymentNumber: pay.paymentNumber,
        paymentDate: formatDate(pay.paymentDate),
        amount: pay.amount,
        paymentMode: pay.paymentMode,
      })),
      aging,
    },
  });
});

/**
 * Get vehicle owner settlement sheet
 * GET /api/v1/reports/vehicle-settlement
 */
const getVehicleSettlement = asyncHandler(async (req, res) => {
  const { ownerId, fromDate, toDate } = req.query;

  if (!ownerId || !fromDate || !toDate) {
    throw new ApiError(400, 'Owner ID, from date, and to date are required');
  }

  // Get vehicle owner/broker details
  const owner = await prisma.party.findUnique({
    where: { id: parseInt(ownerId) },
  });

  if (!owner) {
    throw new ApiError(404, 'Owner not found');
  }

  // Get vehicles belonging to this owner
  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { ownerName: owner.partyName },
        { brokerId: parseInt(ownerId) },
      ],
      isDeleted: false,
    },
  });

  const vehicleIds = vehicles.map((v) => v.id);

  // Get consignments for these vehicles in the date range
  const consignments = await prisma.consignment.findMany({
    where: {
      vehicleId: {
        in: vehicleIds,
      },
      grDate: {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      },
      isDeleted: false,
      status: {
        in: ['Delivered', 'Settled'],
      },
    },
    include: {
      vehicle: {
        select: {
          vehicleNo: true,
        },
      },
    },
    orderBy: {
      grDate: 'asc',
    },
  });

  // Calculate totals
  const totalFreight = consignments.reduce(
    (sum, c) => sum + Number(c.freightAmount),
    0
  );

  // Deductions (this would come from a separate deductions table in a real system)
  const deductions = [
    // Example structure - you can add actual deductions logic
    // { type: 'Fuel Advance', amount: 5000 },
    // { type: 'Damages', amount: 2000 },
  ];

  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netPayable = totalFreight - totalDeductions;

  res.status(200).json({
    success: true,
    data: {
      owner: {
        name: owner.partyName,
        mobile: owner.mobile,
        address: [owner.addressLine1, owner.city].filter(Boolean).join(', '),
      },
      period: {
        fromDate,
        toDate,
      },
      summary: {
        totalTrips: consignments.length,
        totalFreight,
        totalDeductions,
        netPayable,
      },
      trips: consignments.map((c) => ({
        grNumber: c.grNumber,
        grDate: formatDate(c.grDate),
        vehicleNumber: c.vehicle.vehicleNo,
        route: `${c.fromLocation} → ${c.toLocation}`,
        freight: c.freightAmount,
      })),
      deductions,
    },
  });
});

/**
 * Helper function to generate activity description
 */
const generateActivityDescription = (log) => {
  const table = log.tableName;
  const action = log.action;

  switch (table) {
    case 'consignments':
      if (action === 'CREATE') {
        return `Consignment ${log.newValues?.grNumber} created`;
      } else if (action === 'STATUS_CHANGE') {
        return `Consignment ${log.newValues?.grNumber} status changed to ${log.newValues?.status}`;
      }
      break;
    case 'invoices':
      if (action === 'CREATE') {
        return `Invoice ${log.newValues?.invoiceNumber} generated for ₹${log.newValues?.totalAmount}`;
      }
      break;
    case 'payments':
      if (action === 'CREATE') {
        return `Payment ${log.newValues?.paymentNumber} received: ₹${log.newValues?.amount}`;
      }
      break;
    default:
      return `${action} on ${table}`;
  }

  return `${action} on ${table}`;
};

module.exports = {
  getDashboardSummary,
  getDailyReport,
  getMonthlyStatement,
  getVehicleSettlement,
};
