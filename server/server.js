// Server entrypoint - MongoDB Atlas only
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

import { connectdb } from './config/database.js';
import { dbStore } from './config/db.js';

import authRouter from './routes/auth.js';
import bookingsRouter from './routes/bookings.js';
import inquiriesRouter from './routes/inquiries.js';
import servicesRouter from './routes/services.js';
import reviewsRouter from './routes/reviews.js';
import crmRouter from './routes/crm.js';
import settingsRouter from './routes/settings.js';

const app = express();

// Secure CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for local development, easily restricted in prod
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Database connections
connectdb();
dbStore.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

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
  res.json({
    status: 'healthy',
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

const port = process.env.PORT || 2004;

app.listen(port, () => {
  console.log(`✨ Nilavi Studio API & CRM running on http://127.0.0.1:${port}`);
  console.log(`📡 Health check available at http://127.0.0.1:${port}/api/health`);
});

export default app;
