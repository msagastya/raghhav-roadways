const Joi = require('joi');

const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  API_VERSION: Joi.string().default('v1'),

  // Database
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),

  // JWT Configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // File Storage
  STORAGE_PATH: Joi.string().default('./storage'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB

  // Company Details
  COMPANY_NAME: Joi.string().required(),
  COMPANY_GSTIN: Joi.string().required(),
  COMPANY_ADDRESS: Joi.string().required(),
  COMPANY_PHONE: Joi.string().required(),
  COMPANY_EMAIL: Joi.string().email().required(),
  COMPANY_BANK_NAME: Joi.string().required(),
  COMPANY_BANK_ACCOUNT: Joi.string().required(),
  COMPANY_BANK_IFSC: Joi.string().required(),
  COMPANY_BANK_BRANCH: Joi.string().required(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
}).unknown(); // Allow other env variables

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env);

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return value;
};

module.exports = { validateEnv };
