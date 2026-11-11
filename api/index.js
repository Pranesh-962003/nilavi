import app from '../server/app.js';

export default function handler(req, res) {
  // Normalize req.url if Vercel rewrite strips the '/api' prefix
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}

