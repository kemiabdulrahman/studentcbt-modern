const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudentCBT API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for StudentCBT - Computer Based Testing Platform',
      contact: {
        name: 'API Support',
        email: 'support@studentcbt.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development Server'
      },
      {
        url: 'https://api.studentcbt.com',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token. Use the token obtained from the login endpoint.'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'auth',
          description: 'Authentication cookie'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, './schemas/index.js'),
    path.join(__dirname, './paths/*.js'),
    path.join(__dirname, './swagger.js')
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
