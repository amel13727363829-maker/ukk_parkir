require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sequelize = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { loggerMiddleware } = require('./middleware/loggerMiddleware');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost (any port) and production domain
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      process.env.CORS_ORIGIN || 'http://localhost:3000',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger Middleware
app.use(loggerMiddleware);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error Handler Middleware (MUST BE LAST)
app.use(errorHandler);

// Database Connection & Server Start
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // Test Database Connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync Database (for development - use migrations in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('⏳ Syncing database models...');
      // Skip alter table to avoid "too many keys" error, use force: false instead
      await sequelize.sync({ force: false, alter: false, logging: false });
      console.log('✅ Database models synced');
    }

    // Start Server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
