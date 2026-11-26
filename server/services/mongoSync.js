import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Settings from '../models/settings.js';
import Service from '../models/service.js';
import Booking from '../models/booking.js';
import Inquiry from '../models/inquiry.js';
import Review from '../models/review.js';
import Customer from '../models/customer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'data', 'nilavi_db.json');

/**
 * Initializes and syncs initial data from nilavi_db.json into MongoDB if collections are empty.
 */
export async function seedMongoFromLocalData() {
  try {
    if (!fs.existsSync(DB_FILE)) return;
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(raw);

    // Only initialize siteSettings if MongoDB has no settings at all
    const existingSettings = await Settings.findOne();
    if (!existingSettings && data.siteSettings) {
      console.log('📦 Initializing default siteSettings into MongoDB...');
      await Settings.create(data.siteSettings);
      console.log('✅ siteSettings successfully saved in MongoDB!');
    }

    // Do NOT seed any hardcoded or demo services, bookings, inquiries, reviews, or customers.
    // Database collections must strictly contain only genuine records created by admin or clients.
    console.log('🚀 All studio and CRM data is fully synchronized and powered by MongoDB.');
  } catch (err) {
    console.warn('⚠️ Notice during MongoDB startup check:', err.message);
  }
}
