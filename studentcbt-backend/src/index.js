const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const redoc = require('redoc-express');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./utils/seed');
const swaggerSpec = require('../docs/swagger');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/public', express.static(path.join(__dirname, '../public')));

// Swagger/OpenAPI Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

// ReDoc Documentation
app.get('/redoc', redoc({
  title: 'StudentCBT API Documentation - ReDoc',
  specUrl: '/api/swagger.json'
}));

// Online ReDoc (using CDN)
app.get('/redoc-online', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>ReDoc - StudentCBT API</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <redoc spec-url='http://localhost:${PORT}/api/swagger.json'></redoc>
        <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"> </script>
      </body>
    </html>
  `);
});

// Swagger JSON endpoint
app.get('/api/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export app for testing
module.exports = app;

// Start server (only in non-test environments)
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`📚 API Documentation available at:`);
    console.log(`   - Swagger UI: http://localhost:${PORT}/api-docs`);
    console.log(`   - ReDoc (local): http://localhost:${PORT}/redoc`);
    console.log(`   - ReDoc (online CDN): http://localhost:${PORT}/redoc-online`);
    
    // Create default admin on startup
    try {
      await createDefaultAdmin();
    } catch (error) {
      console.error('Error creating default admin:', error.message);
    }
  });
}