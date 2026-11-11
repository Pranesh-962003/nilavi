import app from './app.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✨ Nilavi Studio API & CRM running on http://localhost:${PORT}`);
  console.log(`📡 Health Check available at http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[SERVER] Port ${PORT} is occupied. Trying alternative port ${Number(PORT) + 1}...`);
    server.listen(Number(PORT) + 1, () => {
      console.log(`✨ Nilavi Studio API & CRM running on http://localhost:${Number(PORT) + 1}`);
    });
  } else {
    console.error('[SERVER ERROR]', err);
  }
});

export default server;
