import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { dbStore } from './config/db.js';

import bookingsRouter from './routes/bookings.js';
import inquiriesRouter from './routes/inquiries.js';
import servicesRouter from './routes/services.js';
import reviewsRouter from './routes/reviews.js';
import crmRouter from './routes/crm.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// API Routes
app.use('/api/bookings', bookingsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);

// Health check endpoint
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    studio: 'Nilavi Aesthetics & Beauty Studio',
    timestamp: new Date().toISOString(),
    dbEngine: dbStore.useMongo ? 'MongoDB Atlas' : 'JSON file store (server/data/nilavi_db.json)'
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Initialize DB connection (MongoDB if MONGODB_URI provided, otherwise JSON file store)
dbStore.connect(process.env.MONGODB_URI);

// Unknown API routes always answer in JSON
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found: ' + req.method + ' ' + req.originalUrl });
});

// Serve static frontend build if present and running standalone (not in serverless)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (!process.env.VERCEL && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err.message);
  const status = err.type === 'entity.too.large' ? 413 : err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 413 ? 'That upload is too large.' : 'Something went wrong on the server.'
  });
});

export default app;
export { app };

