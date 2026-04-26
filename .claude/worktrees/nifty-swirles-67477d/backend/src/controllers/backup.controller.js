const prisma = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { ApiError } = require('../middleware/errorHandler');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Export all data as JSON
 */
exports.exportAllData = asyncHandler(async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  // Create backups directory if it doesn't exist
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
  }

  // Export all tables
  const exportData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    data: {
      users: await prisma.user.findMany({
        include: { role: true },
      }),
      roles: await prisma.role.findMany({
        include: { rolePermissions: { include: { permission: true } } },
      }),
      permissions: await prisma.permission.findMany(),
      parties: await prisma.party.findMany(),
      vehicles: await prisma.vehicle.findMany(),
      consignments: await prisma.consignment.findMany({
        include: {
          consignor: true,
          consignee: true,
          vehicle: true,
          statusHistory: true,
        },
      }),
      invoices: await prisma.invoice.findMany({
        include: {
          party: true,
          items: { include: { consignment: true } },
        },
      }),
      payments: await prisma.payment.findMany({
        include: {
          transactions: true,
        },
      }),
      states: await prisma.state.findMany({
        include: { cities: true },
      }),
      consignorConsignees: await prisma.consignorConsignee.findMany(),
      invoiceParties: await prisma.invoiceParty.findMany(),
      vehicleOwnerBrokers: await prisma.vehicleOwnerBroker.findMany({
        include: { vehicles: true },
      }),
      auditLogs: await prisma.auditLog.findMany({
        orderBy: { changedAt: 'desc' },
        take: 1000, // Last 1000 audit logs
      }),
    },
  };

  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);

  // Write to file
  await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf8');

  res.status(200).json({
    success: true,
    message: 'Data exported successfully',
    data: {
      filename,
      filepath,
      size: (await fs.stat(filepath)).size,
      timestamp: exportData.timestamp,
      recordCounts: {
        users: exportData.data.users.length,
        consignments: exportData.data.consignments.length,
        invoices: exportData.data.invoices.length,
        payments: exportData.data.payments.length,
        parties: exportData.data.parties.length,
        vehicles: exportData.data.vehicles.length,
      },
    },
  });
});

/**
 * Download backup file
 */
exports.downloadBackup = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(process.cwd(), 'backups', filename);

  // Check if file exists
  try {
    await fs.access(filepath);
  } catch {
    throw new ApiError(404, 'Backup file not found');
  }

  res.download(filepath, filename, (err) => {
    if (err) {
      throw new ApiError(500, 'Error downloading backup file');
    }
  });
});

/**
 * List all backups
 */
exports.listBackups = asyncHandler(async (req, res) => {
  const backupDir = path.join(process.cwd(), 'backups');

  try {
    await fs.access(backupDir);
  } catch {
    return res.status(200).json({
      success: true,
      data: {
        backups: [],
        total: 0,
      },
    });
  }

  const files = await fs.readdir(backupDir);
  const backupFiles = files.filter((file) => file.endsWith('.json'));

  const backups = await Promise.all(
    backupFiles.map(async (file) => {
      const filepath = path.join(backupDir, file);
      const stats = await fs.stat(filepath);
      return {
        filename: file,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    })
  );

  // Sort by creation date (newest first)
  backups.sort((a, b) => b.createdAt - a.createdAt);

  res.status(200).json({
    success: true,
    data: {
      backups,
      total: backups.length,
    },
  });
});

/**
 * Delete backup file
 */
exports.deleteBackup = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(process.cwd(), 'backups', filename);

  // Check if file exists
  try {
    await fs.access(filepath);
  } catch {
    throw new ApiError(404, 'Backup file not found');
  }

  // Delete file
  await fs.unlink(filepath);

  res.status(200).json({
    success: true,
    message: 'Backup deleted successfully',
  });
});

/**
 * Get database statistics
 */
exports.getDatabaseStats = asyncHandler(async (req, res) => {
  const stats = {
    users: await prisma.user.count(),
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    parties: await prisma.party.count({ where: { isDeleted: false } }),
    vehicles: await prisma.vehicle.count({ where: { isDeleted: false } }),
    consignments: await prisma.consignment.count({ where: { isDeleted: false } }),
    invoices: await prisma.invoice.count({ where: { isDeleted: false } }),
    payments: await prisma.payment.count({ where: { isDeleted: false } }),
    paymentTransactions: await prisma.paymentTransaction.count(),
    auditLogs: await prisma.auditLog.count(),
    states: await prisma.state.count(),
    cities: await prisma.city.count(),
  };

  // Calculate total revenue
  const totalRevenue = await prisma.invoice.aggregate({
    where: { isDeleted: false },
    _sum: { totalAmount: true },
  });

  const totalPayments = await prisma.paymentTransaction.aggregate({
    _sum: { amount: true },
  });

  res.status(200).json({
    success: true,
    data: {
      recordCounts: stats,
      financials: {
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        totalPaymentsReceived: totalPayments._sum.amount || 0,
        outstandingAmount:
          (totalRevenue._sum.totalAmount || 0) - (totalPayments._sum.amount || 0),
      },
      databaseInfo: {
        provider: 'PostgreSQL',
        connectionStatus: 'Connected',
      },
    },
  });
});

/**
 * Clean old backups (keep last N backups)
 */
exports.cleanOldBackups = asyncHandler(async (req, res) => {
  const { keep = 10 } = req.query; // Keep last 10 backups by default
  const keepCount = parseInt(keep);

  const backupDir = path.join(process.cwd(), 'backups');

  try {
    await fs.access(backupDir);
  } catch {
    return res.status(200).json({
      success: true,
      message: 'No backups directory found',
      data: { deletedCount: 0 },
    });
  }

  const files = await fs.readdir(backupDir);
  const backupFiles = files.filter((file) => file.endsWith('.json'));

  if (backupFiles.length <= keepCount) {
    return res.status(200).json({
      success: true,
      message: `Total backups (${backupFiles.length}) is less than or equal to keep count (${keepCount})`,
      data: { deletedCount: 0 },
    });
  }

  // Get file stats and sort by creation date
  const filesWithStats = await Promise.all(
    backupFiles.map(async (file) => {
      const filepath = path.join(backupDir, file);
      const stats = await fs.stat(filepath);
      return {
        filename: file,
        filepath,
        createdAt: stats.birthtime,
      };
    })
  );

  // Sort by creation date (newest first)
  filesWithStats.sort((a, b) => b.createdAt - a.createdAt);

  // Delete old backups
  const filesToDelete = filesWithStats.slice(keepCount);
  let deletedCount = 0;

  for (const file of filesToDelete) {
    await fs.unlink(file.filepath);
    deletedCount++;
  }

  res.status(200).json({
    success: true,
    message: `Cleaned old backups, kept last ${keepCount} backups`,
    data: {
      deletedCount,
      remainingCount: backupFiles.length - deletedCount,
    },
  });
});
