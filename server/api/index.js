import app from '../app.js';
import { connectdb } from '../config/database.js';

export default async function handler(req, res) {
  // Ensure database connection is ready before handling request
  try {
    await connectdb();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]', err.message);
  }

  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
