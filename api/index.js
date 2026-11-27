import app from '../server/app.js';
import { connectdb } from '../server/config/database.js';

export default async function handler(req, res) {
  // Ensure database connection is ready before handling request
  try {
    await connectdb();
  } catch (err) {
    console.error('[Vercel Serverless DB Error]', err.message);
  }

  // Normalize req.url if Vercel rewrite strips the '/api' prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
