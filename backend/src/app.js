const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const routes = require('./routes');
const {
  errorConverter,
  errorHandler,
  notFound,
} = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestId = require('./middleware/requestId');

const app = express();

// Add Request ID to all requests
app.use(requestId);

// Security middleware
app.use(helmet());

// Compression middleware - compress all responses
app.use(compression());

// Rate limiting middleware - apply to all requests
app.use('/api/', apiLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());

    // In production, also allow the main Vercel domain
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push('https://raghhav-roadways.vercel.app');
    }

    // In development, allow localhost and ngrok
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
      // Allow ngrok in development only
      if (origin && origin.includes('.ngrok')) {
        return callback(null, true);
      }
    }

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured HTTP Request Logger
app.use((req, res, next) => {
  // Log incoming request
  logger.info(`Incoming Request`, {
    requestId: req.id,
    http: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
    },
    user: req.user ? { id: req.user.id, username: req.user.username } : 'anonymous',
  });

  // Log outgoing response
  res.on('finish', () => {
    logger.info(`Request Completed`, {
      requestId: req.id,
      http: {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
      },
    });
  });

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
