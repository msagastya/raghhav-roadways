const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const routes = require('./routes');
const {
  errorConverter,
  errorHandler,
  notFound,
} = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { setCsrfToken, doubleCsrfProtection, csrfErrorHandler } = require('./middleware/csrf');
const logger = require('./utils/logger');

const app = express();

// Trust proxy for rate limiting behind reverse proxies (Render, Vercel, etc.)
app.set('trust proxy', 1);

// Compression middleware - compress all responses
app.use(compression({
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security middleware with enhanced configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for PDF viewers
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://raghhav-roadways.vercel.app',
      'https://frontend-kr7820r9o-suyashs-projects-3acd31bf.vercel.app',
      'https://frontend-gbsek5go5-suyashs-projects-3acd31bf.vercel.app',
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if origin is allowed or matches ngrok/vercel pattern
    if (allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes('.ngrok') ||
        origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Cookie parser middleware
app.use(cookieParser());

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

// Apply rate limiting to all API routes
app.use('/api/v1', apiLimiter);

// CSRF Protection - set token on GET requests, validate on mutations
app.use('/api/v1', setCsrfToken);
app.use('/api/v1', doubleCsrfProtection);
app.use(csrfErrorHandler);

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
