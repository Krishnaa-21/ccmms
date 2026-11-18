import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './config/env.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { initSlaCron } from './cron/slaCron.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers with safe CSP and resource sharing
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Allows inline styles in Swagger/docs view
  })
);

// Cross-origin resource sharing
app.use(
  cors({
    origin: [ENV.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Cookie Parser for httpOnly refresh tokens
app.use(cookieParser());

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (Morgan)
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Serve static uploads safely
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  next();
}, express.static(path.resolve(__dirname, '../uploads')));

// General API rate limiter
app.use('/api', apiLimiter);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Campus Complaint & Maintenance Management System (CCMMS)',
    version: '2.0.0',
    phase: 'Phase 2 - Complete Working Backend',
    documentation: '/api/docs',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      complaints: '/api/complaints',
      notifications: '/api/notifications',
      notificationsStream: '/api/notifications/stream',
      feedback: '/api/feedback',
      analytics: '/api/analytics',
      exportComplaintsCsv: '/api/export/complaints.csv',
      exportAnalyticsPdf: '/api/export/analytics.pdf',
      settings: '/api/settings',
      auditLog: '/api/audit-log'
    }
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 & Centralized Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start SLA Cron in non-test mode
initSlaCron();

const PORT = ENV.PORT;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🏛️  CCMMS Backend Server running on http://localhost:${PORT}`);
    console.log(`   Mode: ${ENV.NODE_ENV}`);
    console.log(`   Campus: ${ENV.CAMPUS_ID}`);
    console.log(`   Interactive Docs: http://localhost:${PORT}/api/docs`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

export default app;
