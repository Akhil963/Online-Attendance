// Load environment variables before all other imports
require('dotenv').config();

// Validate required environment variables at startup
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`✗ Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

require("./instrument.js");

const express = require('express');
const Sentry = require("@sentry/node");
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// Import routes
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const employeeRoutes = require('./routes/employee');
const departmentRoutes = require('./routes/department');
const leaveRoutes = require('./routes/leave');
const noticeRoutes = require('./routes/notice');
const dashboardRoutes = require('./routes/dashboard');
const holidayRoutes = require('./routes/holiday');

// Import email service and seed database
const { scheduleEmailReport } = require('./utils/emailService');
const seedDatabase = require('./utils/seedDatabase');
const { initializeSocketHandlers } = require('./utils/socketHandlers');

const app = express();
const server = http.createServer(app);

// Parse CLIENT_URL for multiple origins (comma-separated)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(url => url.trim());

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
  maxHttpBufferSize: 1e6
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('No authentication token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.handshake.auth.userId = decoded.id;
    socket.handshake.auth.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error('Invalid token'));
  }
});

// Rate Limiting Configuration (disabled in development)
const isDevelopment = process.env.NODE_ENV === 'development';
const limiter = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Auth routes rate limiting (disabled in development)
const authLimiter = isDevelopment ? (req, res, next) => next() : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 login attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful requests
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", ...allowedOrigins, "ws:"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [''] : []
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  noSniff: true,
  xssFilter: true
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  console.log('✓ MongoDB connected');
  // Seed default departments if database is empty
  await seedDatabase();
}).catch(err => {
  console.error('✗ MongoDB connection failed:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/notice', noticeRoutes);
app.use('/api/holiday', holidayRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Socket.io for real-time updates
initializeSocketHandlers(io);
console.log('✓ Real-time socket handlers initialized');

// Store io instance for use in routes
app.set('io', io);

// Schedule email reports
scheduleEmailReport();
console.log('✓ Email scheduling service started');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// The error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  console.error('Error:', err);
  res.statusCode = 500;
  res.end(res.sentry + '\n');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

module.exports = { app, io };
