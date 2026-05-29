require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startScheduler } = require('./services/reminderScheduler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const logRoutes = require('./routes/logRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cronRoutes = require('./routes/cronRoutes');

const path = require('path');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth routes get stricter limit
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
app.use('/api/auth', authLimiter);

// Health check
app.get('/health', (req, res) =>
  res.json({ success: true, status: 'MediCare API running', timestamp: new Date() })
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cron', cronRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`MediCare API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  startScheduler();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
