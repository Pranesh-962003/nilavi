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

// Root landing message
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nilavi Studio API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1B0830; color: #E9D296; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #2A0E47; padding: 40px; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.5); border: 1px solid rgba(233, 210, 150, 0.2); max-width: 500px; text-align: center; }
          .badge { display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #10B981; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
          h1 { margin: 0 0 12px; color: #FAF7F2; font-size: 24px; font-weight: 600; }
          p { color: rgba(250, 247, 242, 0.75); line-height: 1.6; margin: 0 0 20px; font-size: 15px; }
          .links { display: flex; justify-content: center; gap: 12px; }
          a { color: #E9D296; text-decoration: none; padding: 8px 16px; border: 1px solid rgba(233, 210, 150, 0.3); border-radius: 8px; font-size: 13px; font-weight: 500; transition: all 0.2s; }
          a:hover { background: rgba(233, 210, 150, 0.1); border-color: #E9D296; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend API & CRM Online</div>
          <h1>Nilavi Aesthetics & Beauty Studio</h1>
          <p>The backend server is running successfully on Vercel. Frontend requests to <code>/api/*</code> are active.</p>
          <div class="links">
            <a href="/api/health" target="_blank">Health Check</a>
            <a href="/api/services" target="_blank">View Services</a>
            <a href="/api/reviews" target="_blank">View Reviews</a>
          </div>
        </div>
      </body>
    </html>
  `);
});

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

