const { processError } = require('../agents/errorFixAgent');
const logger = require('../utils/logger');

// Intercepts all errors, runs Claude analysis in parallel with a hard 3s timeout
// so it never delays the error response to the user
const aiErrorAnalyzer = async (err, req, res, next) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return next(err);
  }

  try {
    const result = await Promise.race([
      processError(err, req),
      new Promise((resolve) => setTimeout(() => resolve({ aiEnhanced: false }), 3000)),
    ]);

    if (result.aiEnhanced && result.analysis) {
      req._aiAnalysis = result.analysis;
      logger.info('Claude error analysis attached', {
        requestId: req.id,
        errorType: result.errorType,
      });
    }
  } catch (aiErr) {
    // Never let the AI layer break normal error handling
    logger.warn('Claude error analysis skipped', { reason: aiErr.message });
  }

  next(err);
};

// Final error responder — replaces the original errorHandler
// Includes Claude's ai field if analysis ran
const aiErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  logger.error(message, {
    requestId: req.id,
    statusCode,
    stack: err.stack,
    isOperational: err.isOperational,
    http: { method: req.method, url: req.originalUrl },
  });

  const response = {
    success: false,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Attach Claude's human-readable message and suggestion when available
  if (req._aiAnalysis) {
    response.ai = {
      userMessage: req._aiAnalysis.userMessage,
      suggestion: req._aiAnalysis.suggestion,
    };
  }

  res.status(statusCode).json(response);
};

module.exports = { aiErrorAnalyzer, aiErrorHandler };
