const winston = require('winston');

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Format for development logs
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf((info) => {
    const { level, message, timestamp, stack, ...meta } = info;
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';

    let log = `${timestamp} ${level}: ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    if (metaString) {
      log += `\n${metaString}`;
    }
    return log;
  })
);

// Format for production logs (JSON)
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'raghhav-roadways-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

module.exports = logger;
