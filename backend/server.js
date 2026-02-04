const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { sequelize } = require('./models');
const logger = require('./utils/logger');
const { startBackupSchedule } = require('./services/backup');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const expenseRoutes = require('./routes/expenses');
const creditRoutes = require('./routes/credit');
const reportRoutes = require('./routes/reports');
const mpesaRoutes = require('./routes/mpesa');
const configRoutes = require('./routes/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: logger.stream }));
} else {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Serve static files (frontend)
app.use(express.static('public'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/credit', creditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/config', configRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (in production, use migrations instead)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Start backup schedule if enabled
    if (process.env.BACKUP_ENABLED === 'true') {
      startBackupSchedule();
      logger.info('Backup schedule started');
    }

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing server gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;
