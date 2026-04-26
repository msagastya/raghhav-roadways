const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Initialize Sentry for error tracking (if DSN is provided)
let Sentry = null;
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    const { nodeProfilingIntegration } = require('@sentry/profiling-node');

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',
    });
  } catch (error) {
    console.warn('Sentry initialization failed (this is okay if not using Sentry):', error.message);
  }
}

const routes = require('./routes');
const {
  errorConverter,
  errorHandler,
  notFound,
} = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestId = require('./middleware/requestId');
const csrfProtection = require('./middleware/csrf');
const inputSanitization = require('./middleware/inputSanitization');
const { checkAccountLockout } = require('./middleware/loginRateLimiter');
const requestTimeout = require('./middleware/requestTimeout');

const app = express();

// Sentry request handler - must be first middleware
if (Sentry) {
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Add Request ID to all requests
app.use(requestId);

// Add request timeout protection
app.use(requestTimeout);

// CORS configuration — MUST be before rate limiters so blocked responses still have CORS headers
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

    // Check if origin is in allowed list (exact match or wildcard pattern)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        const regex = new RegExp('^' + allowed.replace(/\./g, '\\.').replace('*', '[^.]+') + '$');
        return regex.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Security middleware — after CORS so error responses still have CORS headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));

// Compression middleware - compress all responses
app.use(compression());

// Rate limiting middleware - apply to all requests
app.use('/api/', apiLimiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser middleware (required for CSRF and httpOnly cookies)
app.use(cookieParser());

// Input sanitization middleware (prevents XSS attacks)
app.use(inputSanitization);

// Account lockout middleware (prevents brute force)
app.use(checkAccountLockout);

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

// CSRF protection middleware
app.use(csrfProtection);

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

// Sentry error handler - must be before custom error handlers
if (Sentry) {
  app.use(Sentry.Handlers.errorHandler());
}

// Error converter
app.use(errorConverter);

// Error handler
app.use(errorHandler);

module.exports = app;
