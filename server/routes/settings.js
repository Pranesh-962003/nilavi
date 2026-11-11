import express from 'express';
import { dbStore } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Default settings if not already in store
const defaultSettings = {
  logoText: 'நிலவி',
  logoImageUrl: '',
  heroTagline: 'Aesthetics and beauty studio, Chennai',
  heroTitle: 'Soft light for skin, hair and nails.',
  heroSubtitle: 'Gentle, personalized and unhurried treatments planned around your skin, hair care, makeup, and wellness goals.',
  heroImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  servicesImages: {
    facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
    hair: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=900&q=80',
    nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80',
    bridal: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    wax: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80'
  },
  galleryImages: [
    { id: 1, cat: 'bridal', title: 'Bridal glow', subtitle: 'Makeup and skin prep', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80', classes: 'tile arch-t tall' },
    { id: 2, cat: 'skin', title: 'Hydra glow facial', subtitle: 'Skin care', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
    { id: 3, cat: 'hair', title: 'Colour melt & styling', subtitle: 'Hair care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
    { id: 4, cat: 'nails', title: 'Gold fleck gel set', subtitle: 'Nail artistry', image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80', classes: 'tile arch-t tall' },
    { id: 5, cat: 'hair', title: 'Keratin smoothing & spa', subtitle: 'Hair care', image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80', classes: 'tile wide' },
    { id: 6, cat: 'skin', title: 'Brightening botanical facial', subtitle: 'Skin care', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
    { id: 7, cat: 'nails', title: 'Luxury french manicure', subtitle: 'Nail artistry', image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80', classes: 'tile' },
    { id: 8, cat: 'bridal', title: 'Reception makeup & draping', subtitle: 'Bridal artistry', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80', classes: 'tile wide' }
  ]
};

// GET current site settings and media
router.get('/', (req, res) => {
  try {
    let settings = dbStore.getCollection('siteSettings');
    if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
      dbStore.memoryData['siteSettings'] = { ...defaultSettings };
      dbStore.saveData();
      settings = dbStore.memoryData['siteSettings'];
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Save handler supporting both PUT and POST
const handleSaveSettings = (req, res) => {
  try {
    const updates = req.body;
    let current = dbStore.memoryData['siteSettings'] || { ...defaultSettings };
    dbStore.memoryData['siteSettings'] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    dbStore.saveData();
    res.json({ success: true, data: dbStore.memoryData['siteSettings'] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/', requireAdmin, handleSaveSettings);
router.put('/', requireAdmin, handleSaveSettings);

export default router;

