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

const DATA_DIR = isVercel ? '/tmp' : BUNDLED_DATA_DIR;
const DB_FILE = isVercel ? path.join('/tmp', 'nilavi_db.json') : BUNDLED_DB_FILE;

// Ensure data folder exists if writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[Storage] Notice: data dir creation skipped:', err.message);
}

// Initial default seed dataset matching nilave.html
const initialData = {
  services: [
    {
      id: 'facial',
      name: 'Signature Facial',
      category: 'skin',
      dur: '60 min',
      price: 1800,
      description: 'Deep cleansing, hydration, brightening and acne-focused facials, chosen after a look at your skin.',
      active: true,
      svgSymbol: 's-skin'
    },
    {
      id: 'hydra',
      name: 'Hydra Glow Facial',
      category: 'skin',
      dur: '75 min',
      price: 2800,
      description: 'Intense hydration infusion, exfoliating oxygen cleanse, and collagen revival treatment.',
      active: true,
      svgSymbol: 's-glow'
    },
    {
      id: 'hair',
      name: 'Hair Spa and Style',
      category: 'hair',
      dur: '90 min',
      price: 1500,
      description: 'Cuts, colour, keratin and scalp treatments, finished with a blow-dry that lasts.',
      active: true,
      svgSymbol: 's-hair'
    },
    {
      id: 'nails',
      name: 'Gel Manicure',
      category: 'nails',
      dur: '60 min',
      price: 900,
      description: 'Classic and gel manicures, pedicures and hand-painted nail art, with a slow hand massage.',
      active: true,
      svgSymbol: 's-nails'
    },
    {
      id: 'bridal',
      name: 'Bridal Makeup Trial',
      category: 'bridal',
      dur: '120 min',
      price: 3500,
      description: 'A trial session, skin prep in the weeks before, then makeup and draping on the day.',
      active: true,
      svgSymbol: 's-bridal'
    },
    {
      id: 'wax',
      name: 'Threading and Waxing',
      category: 'wax',
      dur: '30 min',
      price: 300,
      description: 'Gentle hair removal and body care, done with fresh strips and a calm hand.',
      active: true,
      svgSymbol: 's-smooth'
    }
  ],
  bookings: [
    {
      id: 'bkg-101',
      customerName: 'Priya Ramanathan',
      customerPhone: '9840123456',
      serviceId: 'facial',
      serviceName: 'Signature Facial',
      servicePrice: 1800,
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '11:00 AM',
      notes: 'Sensitive skin, please use hypoallergenic cleanser.',
      status: 'confirmed',
      whatsappSent: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'bkg-102',
      customerName: 'Meera Sundaram',
      customerPhone: '9789012345',
      serviceId: 'hair',
      serviceName: 'Hair Spa and Style',
      servicePrice: 1500,
      date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      timeSlot: '2:30 PM',
      notes: 'Keratin consultation requested.',
      status: 'pending',
      whatsappSent: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'bkg-103',
      customerName: 'Anjali Krishnan',
      customerPhone: '9444198765',
      serviceId: 'bridal',
      serviceName: 'Bridal Makeup Trial',
      servicePrice: 3500,
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      timeSlot: '10:00 AM',
      notes: 'Wedding on December 14th.',
      status: 'confirmed',
      whatsappSent: true,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ],
  inquiries: [
    {
      id: 'inq-201',
      name: 'Kavitha S.',
      email: 'kavitha.s@gmail.com',
      phone: '9884055555',
      topic: 'Bridal packages',
      message: 'Looking for a comprehensive 3-day bridal makeup and saree draping package for muhurtham and reception.',
      status: 'new',
      notes: 'Send bridal PDF lookbook via WhatsApp.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'inq-202',
      name: 'Deepa Natarajan',
      email: 'deepa.n@outlook.com',
      phone: '9841234444',
      topic: 'Gift cards',
      message: 'Can I purchase a gift voucher of ₹5000 for my sister’s birthday?',
      status: 'contacted',
      notes: 'Offered digital voucher link.',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
    }
  ],
  reviews: [
    {
      id: 'rev-301',
      name: 'Priya R.',
      service: 'Signature facial',
      stars: 5,
      quote: 'I came in for a facial before my sister’s wedding and left with a skincare plan I still follow. It felt like being looked after, not sold to.',
      avatarInitial: 'P',
      featured: true,
      approved: true
    },
    {
      id: 'rev-302',
      name: 'Meera S.',
      service: 'Hair colour',
      stars: 5,
      quote: 'My hair colour turned out exactly like the photo I brought. Calm studio, spotless tools.',
      avatarInitial: 'M',
      featured: false,
      approved: true
    },
    {
      id: 'rev-303',
      name: 'Anjali K.',
      service: 'Bridal makeup',
      stars: 5,
      quote: 'The bridal trial took the stress away. On the day, I looked like myself, only lit from within.',
      avatarInitial: 'A',
      featured: false,
      approved: true
    }
  ],
  crmCustomers: [
    {
      id: 'cust-1',
      name: 'Priya Ramanathan',
      phone: '9840123456',
      email: 'priya.r@gmail.com',
      totalVisits: 4,
      totalSpent: 8200,
      tags: ['VIP', 'Facials Lover'],
      notes: 'Prefers organic botanical serums.',
      lastVisit: new Date().toISOString()
    },
    {
      id: 'cust-2',
      name: 'Meera Sundaram',
      phone: '9789012345',
      email: 'meera.s@yahoo.com',
      totalVisits: 2,
      totalSpent: 3000,
      tags: ['Regular'],
      notes: 'Allergic to amla oil.',
      lastVisit: new Date().toISOString()
    },
    {
      id: 'cust-3',
      name: 'Anjali Krishnan',
      phone: '9444198765',
      email: 'anjali.k@gmail.com',
      totalVisits: 1,
      totalSpent: 3500,
      tags: ['Bridal Prospect'],
      notes: 'Muhurtham Dec 2026',
      lastVisit: new Date().toISOString()
    }
  ],
  admin: {
    username: 'admin',
    passwordHash: 'nilavi2026', // simple credentials for quick onboarding
    name: 'Nilavi Manager'
  }
};

class StorageAdapter {
  constructor() {
    this.useMongo = false;
    this.memoryData = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      const bundled = findBundledDbFile();
      if (bundled) {
        const raw = fs.readFileSync(bundled, 'utf-8');
        const parsed = JSON.parse(raw);
        if (isVercel) {
          try {
            fs.writeFileSync(DB_FILE, raw, 'utf-8');
          } catch {
            // Write to /tmp is best-effort
          }
        }
        return parsed;
      }
    } catch (err) {
      console.warn('[Storage] Error reading DB file, reinitializing default data:', err.message);
    }
    this.saveData(initialData);
    return JSON.parse(JSON.stringify(initialData));
  }

  saveData(data) {
    try {
      const dataToSave = data || this.memoryData;
      // Write to a temp file first, then swap it in, so a crash mid-write can't corrupt the database
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      // In serverless / read-only contexts, gracefully retain state in memory without crashing
      console.warn('[Storage] File write skipped or failed:', err.message);
    }
  }

  async connect(uri) {
    if (!uri) {
      console.log('ℹ️  No MONGODB_URI provided. Running in file-persisted JSON database mode.');
      return;
    }
    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      this.useMongo = true;
      return;
    }
    try {
      mongoose.set('strictQuery', false);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      this.useMongo = true;
      console.log('ℹ️  MongoDB is reachable, but records are still stored in data/nilavi_db.json (no Mongo models are defined yet).');
    } catch (err) {
      console.log('⚠️  MongoDB connection unreachable (' + err.message + ').');
      console.log('ℹ️  Falling back seamlessly to persisted JSON database mode (data/nilavi_db.json).');
      this.useMongo = false;
    }
  }

  // Generic collection operations
  getCollection(name) {
    if (!this.memoryData[name]) {
      this.memoryData[name] = [];
      this.saveData();
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
    this.saveData();
    return newItem;
  }

  update(collectionName, id, updates) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveData();
    return list[index];
  }

  delete(collectionName, id) {
    const list = this.getCollection(collectionName);
    const index = list.findIndex(item => item.id === id || item._id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.saveData();
    return true;
  }
}

export const dbStore = new StorageAdapter();
export default dbStore;

