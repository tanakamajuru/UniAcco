// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Accommodation API',
      version: '1.0.0',
      description: 'A comprehensive API for managing student accommodations, bookings, and reviews',
      contact: {
        name: 'API Support',
        email: 'ttmajuru@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://api.studentaccommodation.com',
        description: 'Production server'
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
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['student', 'landlord', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Accommodation: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            landlordId: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            latitude: { type: 'number', format: 'double' },
            longitude: { type: 'number', format: 'double' },
            pricePerMonth: { type: 'number' },
            depositAmount: { type: 'number' },
            availableFrom: { type: 'string', format: 'date' },
            availableTo: { type: 'string', format: 'date' },
            isAvailable: { type: 'boolean' },
            peoplePerRoom: { type: 'integer', minimum: 1 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            accommodationId: { type: 'string', format: 'uuid' },
            studentId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
            totalPrice: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            accommodationId: { type: 'string', format: 'uuid' },
            studentId: { type: 'string', format: 'uuid' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;