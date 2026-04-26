const app = require('./app');
const logger = require('./utils/logger');
const prisma = require('./config/database');
const { validateEnv } = require('./config/envValidation');
const os = require('os');

// Validate environment variables on startup
try {
  validateEnv();
  logger.info('✅ Environment variables validated successfully');
} catch (error) {
  logger.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Get local IP address for network access
const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  await testDatabaseConnection();

  const localIp = getLocalIpAddress();
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Local API URL: http://localhost:${PORT}/api/v1`);
    logger.info(`🔗 Network API URL: http://${localIp}:${PORT}/api/v1`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

      await prisma.$disconnect();
      logger.info('Database connection closed');

      logger.info('✅ Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('⚠️ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  // Handle shutdown signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
};

// Start the server
startServer();
