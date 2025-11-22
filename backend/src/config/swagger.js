const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Raghhav Roadways API',
      version: '1.0.0',
      description: 'Transport Management System API Documentation',
      contact: {
        name: 'Raghhav Roadways',
        email: 'raghhavroadways@gmail.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        // Common response schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },

        // Auth schemas
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'password123' }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: { $ref: '#/components/schemas/User' },
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' }
              }
            }
          }
        },

        // User schema
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            username: { type: 'string' },
            email: { type: 'string' },
            fullName: { type: 'string' },
            mobile: { type: 'string' },
            roleId: { type: 'integer' },
            roleName: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },

        // Party schema
        Party: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            partyCode: { type: 'string' },
            partyName: { type: 'string' },
            partyType: { type: 'string', enum: ['receivable', 'payable'] },
            gstin: { type: 'string' },
            pan: { type: 'string' },
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            pincode: { type: 'string' },
            contactPerson: { type: 'string' },
            mobile: { type: 'string' },
            email: { type: 'string' },
            creditLimit: { type: 'number' },
            creditDays: { type: 'integer' },
            isActive: { type: 'boolean' }
          }
        },
        CreateParty: {
          type: 'object',
          required: ['partyName', 'partyType'],
          properties: {
            partyName: { type: 'string' },
            partyType: { type: 'string', enum: ['receivable', 'payable'] },
            gstin: { type: 'string' },
            pan: { type: 'string' },
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            pincode: { type: 'string' },
            contactPerson: { type: 'string' },
            mobile: { type: 'string' },
            email: { type: 'string' },
            creditLimit: { type: 'number' },
            creditDays: { type: 'integer' }
          }
        },

        // Vehicle schema
        Vehicle: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            vehicleNo: { type: 'string' },
            vehicleType: { type: 'string' },
            vehicleCapacity: { type: 'number' },
            ownerType: { type: 'string', enum: ['private', 'broker'] },
            ownerName: { type: 'string' },
            ownerMobile: { type: 'string' },
            driverName: { type: 'string' },
            driverMobile: { type: 'string' },
            rcExpiry: { type: 'string', format: 'date' },
            insuranceExpiry: { type: 'string', format: 'date' },
            fitnessExpiry: { type: 'string', format: 'date' },
            pollutionExpiry: { type: 'string', format: 'date' },
            isActive: { type: 'boolean' }
          }
        },

        // Consignment schema
        Consignment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            grNumber: { type: 'string' },
            grDate: { type: 'string', format: 'date' },
            consignorId: { type: 'integer' },
            consigneeId: { type: 'integer' },
            fromLocation: { type: 'string' },
            toLocation: { type: 'string' },
            vehicleId: { type: 'integer' },
            vehicleNumber: { type: 'string' },
            noOfPackages: { type: 'integer' },
            description: { type: 'string' },
            actualWeight: { type: 'number' },
            chargedWeight: { type: 'number' },
            freightAmount: { type: 'number' },
            totalAmount: { type: 'number' },
            paymentMode: { type: 'string', enum: ['To Pay', 'Paid', 'To Be Billed'] },
            status: { type: 'string', enum: ['Booked', 'Loaded', 'In Transit', 'Delivered', 'Settled'] }
          }
        },

        // Invoice schema
        Invoice: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            invoiceNumber: { type: 'string' },
            invoiceDate: { type: 'string', format: 'date' },
            partyId: { type: 'integer' },
            partyName: { type: 'string' },
            subtotal: { type: 'number' },
            totalAmount: { type: 'number' },
            paidAmount: { type: 'number' },
            balanceAmount: { type: 'number' },
            paymentStatus: { type: 'string', enum: ['Pending', 'Partial', 'Paid'] },
            dueDate: { type: 'string', format: 'date' }
          }
        },

        // Payment schema
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            paymentNumber: { type: 'string' },
            paymentDate: { type: 'string', format: 'date' },
            invoiceId: { type: 'integer' },
            partyId: { type: 'integer' },
            totalAmount: { type: 'number' },
            paidAmount: { type: 'number' },
            balanceAmount: { type: 'number' },
            paymentStatus: { type: 'string', enum: ['Pending', 'Partial', 'Paid'] }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
