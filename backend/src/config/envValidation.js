const Joi = require('joi');

const envSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(2026),
  API_VERSION: Joi.string().default('v1'),

  // Database — only truly required var
  DATABASE_URL: Joi.string().required().description('PostgreSQL connection string'),

  // JWT Configuration — defaults provided so server starts without manual setup
  JWT_SECRET: Joi.string()
    .min(32)
    .default('8cad5e92b0d5c52699d51b145a3ff5308a600421b2868d87bf12c5d58d7957bf'),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .default('6a0b9106c734c82f7011408d085eb5349143896c55d37fa7f47d530502838583'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // File Storage
  STORAGE_PATH: Joi.string().default('./storage'),
  MAX_FILE_SIZE: Joi.number().default(10485760),

  // Company Details — defaults so server starts; override via env vars in production
  COMPANY_NAME: Joi.string().default('RAGHHAV ROADWAYS'),
  COMPANY_GSTIN: Joi.string().default('24BQCPP3322B1ZH'),
  COMPANY_ADDRESS: Joi.string().default('PLOT NO. D-407, UMANG RESIDENCY, SACHIN, SURAT - 394230'),
  COMPANY_PHONE: Joi.string().default('+91 9727-466-477'),
  COMPANY_EMAIL: Joi.string().email().default('raghhavroadways@gmail.com'),
  COMPANY_BANK_NAME: Joi.string().default('AXIS BANK'),
  COMPANY_BANK_ACCOUNT: Joi.string().default('924020013795444'),
  COMPANY_BANK_IFSC: Joi.string().default('UTIB0005605'),
  COMPANY_BANK_BRANCH: Joi.string().default('STATION ROAD SACHIN'),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
}).unknown();

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env);

  if (error) {
    throw new Error(`Environment validation error: ${error.message}`);
  }

  return value;
};

module.exports = { validateEnv };
