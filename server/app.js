// Express Application Configuration (shared across local dev and Vercel serverless)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/.env is loaded whether run from repo root or inside server/
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import mongoose from 'mongoose';
import { connectdb } from './config/database.js';
import authRouter from './routes/auth.js';
import bookingsRouter from './routes/bookings.js';
import inquiriesRouter from './routes/inquiries.js';
import servicesRouter from './routes/services.js';
import reviewsRouter from './routes/reviews.js';
import crmRouter from './routes/crm.js';
import settingsRouter from './routes/settings.js';

const app = express();

// Standard permissive CORS for seamless Vercel preview & production deployments
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection middleware: ensures MongoDB Atlas is connected before handling any API route
let isDbConnecting = false;
app.use(async (req, res, next) => {
  try {
    await connectdb();
  } catch (err) {
    console.error('[Database Middleware Error]', err.message);
  }
  next();
});

// URL normalizer: ensure request paths match our /api route prefixes
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith('/api') && req.url !== '/') {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  next();
});

// Request logger for visibility
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// Root & Health Checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Nilavi Aesthetics & Beauty Studio API is operational',
    version: '2.0.0'
  });
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection ? mongoose.connection.readyState : 0;
  const dbStatus = dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';
  res.json({
    status: 'healthy',
    database: dbStatus,
    hasMongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
    studio: 'Nilavi Aesthetics & Beauty Studio',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/settings', settingsRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;
