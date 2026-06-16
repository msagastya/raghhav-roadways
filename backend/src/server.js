const app = require('./app');
const logger = require('./utils/logger');
const { validateEnv } = require('./config/envValidation');
const { initializeFirebase } = require('./config/firebase');

// Validate environment variables on startup
try {
  validateEnv();
  logger.info('✅ Environment variables validated successfully');
} catch (error) {
  logger.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  initializeFirebase();

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API URL: http://localhost:${PORT}/api/v1`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      logger.info('HTTP server closed');

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
