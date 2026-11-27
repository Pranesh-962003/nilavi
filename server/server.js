// Local Server entrypoint - MongoDB Atlas
import app from './app.js';
import { connectdb } from './config/database.js';
import { dbStore } from './config/db.js';

// Connect to MongoDB Atlas
connectdb();
dbStore.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

const port = process.env.PORT || 2004;

app.listen(port, () => {
  console.log(`✨ Nilavi Studio API & CRM running on http://127.0.0.1:${port}`);
  console.log(`📡 Health check available at http://127.0.0.1:${port}/api/health`);
});

export default app;
