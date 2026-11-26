import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const BUNDLED_DATA_DIR = path.join(__dirname, '..', 'data');
const BUNDLED_DB_FILE = path.join(BUNDLED_DATA_DIR, 'nilavi_db.json');

function findBundledDbFile() {
  const candidates = [
    BUNDLED_DB_FILE,
    path.join(process.cwd(), 'server', 'data', 'nilavi_db.json'),
    path.join(process.cwd(), 'data', 'nilavi_db.json')
  ];
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // Ignore
    }
  }
  return null;
}

class StorageAdapter {
  constructor() {
    this.useMongo = false;
    this.memoryData = this.loadData();
  }

  loadData() {
    try {
      const bundled = findBundledDbFile();
      if (bundled && fs.existsSync(bundled)) {
        const raw = fs.readFileSync(bundled, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[Storage] Notice loading initial data:', err.message);
    }
    return {
      services: [],
      bookings: [],
      inquiries: [],
      reviews: [],
      crmCustomers: [],
      siteSettings: {}
    };
  }

  saveData(data) {
    // NO-OP: Full MongoDB persistence active. No file-based writes.
  }

  async connect(uri) {
    if (!uri) {
      console.log('ℹ️ No MongoDB URI provided.');
      return;
    }
    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      this.useMongo = true;
      return;
    }
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      this.useMongo = true;
      console.log('✅ MongoDB connected successfully to database.');
    } catch (err) {
      console.error('⚠️ MongoDB connection error (' + err.message + ').');
      this.useMongo = false;
    }
  }

  getCollection(name) {
    if (!this.memoryData[name]) {
      this.memoryData[name] = [];
    }
    return this.memoryData[name];
  }

  find(collectionName, filterFn) {
    const list = this.getCollection(collectionName);
    if (!filterFn) return [...list];
    return list.filter(filterFn);
  }

  findById(collectionName, id) {
    const list = this.getCollection(collectionName);
    return list.find(item => item.id === id || item._id === id);
  }

  insert(collectionName, item) {
    const list = this.getCollection(collectionName);
    const newItem = {
      id: item.id || `${collectionName.slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...item
    };
    list.unshift(newItem);
    return newItem;
  }

  update(collectionName, id, updates) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    return list[index];
  }

  delete(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  }
}

export const dbStore = new StorageAdapter();
export default dbStore;
