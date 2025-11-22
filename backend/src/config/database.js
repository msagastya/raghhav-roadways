const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Connection pool configuration
const poolConfig = {
  // Maximum number of connections in the pool
  connection_limit: parseInt(process.env.DATABASE_POOL_SIZE) || 10,
  // Maximum time to wait for a connection (ms)
  pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT) || 10000,
};

// Build connection URL with pool parameters
const getDatabaseUrl = () => {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) return baseUrl;

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}connection_limit=${poolConfig.connection_limit}&pool_timeout=${poolConfig.pool_timeout}`;
};

// Prisma Client Singleton with middleware
let prisma;

const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });

  // Soft delete middleware - automatically filter out deleted records
  client.$use(async (params, next) => {
    // Models with soft delete
    const softDeleteModels = [
      'Consignment',
      'Invoice',
      'Payment',
      'Party',
      'Vehicle',
      'ConsignorConsignee',
      'InvoiceParty',
      'VehicleOwnerBroker',
    ];

    if (softDeleteModels.includes(params.model)) {
      // Find operations - add isDeleted filter
      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        params.args.where = { ...params.args.where, isDeleted: false };
      }

      if (params.action === 'findMany') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.isDeleted === undefined) {
          params.args.where.isDeleted = false;
        }
      }

      // Count operations
      if (params.action === 'count') {
        if (!params.args) params.args = {};
        if (!params.args.where) params.args.where = {};
        if (params.args.where.isDeleted === undefined) {
          params.args.where.isDeleted = false;
        }
      }

      // Delete operations - convert to soft delete
      if (params.action === 'delete') {
        params.action = 'update';
        params.args.data = { isDeleted: true };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        if (!params.args.data) params.args.data = {};
        params.args.data.isDeleted = true;
      }
    }

    return next(params);
  });

  // Query logging middleware for performance monitoring
  client.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    if (duration > 1000) {
      logger.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
    }

    return result;
  });

  return client;
};

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // In development, use global to prevent multiple instances during hot reload
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

// Graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Closing database connections...');
  await prisma.$disconnect();
  logger.info('Database connections closed');
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = prisma;
