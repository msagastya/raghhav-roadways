const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const routes = require('./routes');
const {
  errorConverter,
  errorHandler,
  notFound,
} = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/v1', routes);

// Serve static files (for PDF downloads)
app.use('/storage', express.static('storage'));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Raghhav Roadways API Server',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

// 404 handler
app.use(notFound);

// Error converter
app.use(errorConverter);

// Error handler
app.use(errorHandler);

module.exports = app;
