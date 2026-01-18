/**
 * =====================================================
 * Student Accommodation API – Server Entry Point
 * Express 5 Compatible
 * =====================================================
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const pool = require('./config/database');

// Routes
const authRoutes = require('./routes/authRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const imageRoutes = require('./routes/imageRoutes');
const universityRoutes = require('./routes/universityRoutes');
const campusRoutes = require('./routes/campusRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

/**
 * =====================================================
 * Security Middleware
 * =====================================================
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "http:", "https:"],
        "media-src": ["'self'", "data:", "blob:", "http:", "https:"],
        "script-src": ["'self'", "'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https:"],
        "connect-src": ["'self'", "http:", "https:", "ws:", "wss:"]
      }
    }
  })
);

/**
 * =====================================================
 * CORS (Express 5 – origin validation)
 * =====================================================
 */
const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, curl, server-to-server requests

    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

/**
 * =====================================================
 * Body Parsers
 * =====================================================
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * =====================================================
 * Static File Serving (Uploads)
 * Serves:
 *  - /uploads/<file>
 *  - /uploads/accommodation-<hash> (new format)
 *  - /uploads/images-<file> (legacy format)
 * =====================================================
 */
const uploadsPath = path.join(__dirname, 'uploads');

// Set headers for static files
const staticFileHeaders = (res, filePath) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };

  const ext = path.extname(filePath).toLowerCase();
  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }
};

// Serve files directly from uploads
app.use('/uploads', express.static(uploadsPath, { setHeaders: staticFileHeaders }));

// Serve files from accommodations subdirectory
app.use('/uploads/accommodations', express.static(path.join(uploadsPath, 'accommodations'), { 
  setHeaders: staticFileHeaders 
}));

// Legacy support for old image URLs (images- prefix)
app.get('/uploads/images-:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, filename);
  
  res.sendFile(filePath, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin'
    }
  }, (err) => {
    if (err) {
      console.error('Error serving legacy image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

// Support for new accommodation- prefixed URLs
app.get('/uploads/accommodation-:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, 'accommodations', `accommodation-${filename}`);
  
  res.sendFile(filePath, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    }
  }, (err) => {
    if (err) {
      console.error('Error serving accommodation image:', err);
      res.status(404).json({ error: 'Image not found' });
    }
  });
});

/**
 * =====================================================
 * Swagger Documentation
 * =====================================================
 */
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Student Accommodation API Docs'
  })
);

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * =====================================================
 * Development Logging
 * =====================================================
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

/**
 * =====================================================
 * Health Checks
 * =====================================================
 */
app.get('/', (_req, res) => {
  res.json({
    message: 'Student Accommodation API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

/**
 * =====================================================
 * API Routes
 * =====================================================
 */
app.use('/api/auth', authRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/campuses', campusRoutes);
app.use('/api/payments', paymentRoutes);

/**
 * =====================================================
 * 404 Handler
 * =====================================================
 */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * =====================================================
 * Global Error Handler
 * =====================================================
 */
app.use((err, _req, res, _next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * =====================================================
 * Server Startup
 * =====================================================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║  Student Accommodation API               ║
║  Server running on port ${PORT}           ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  Started: ${new Date().toLocaleString()}  ║
╚══════════════════════════════════════════╝
`);
});

/**
 * =====================================================
 * Unhandled Promise Rejections
 * =====================================================
 */
process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});