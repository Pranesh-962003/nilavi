import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import Settings from '../models/settings.js';
import Service from '../models/service.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

const defaultSettings = {
  logoText: 'Nilavi',
  logoImageUrl: '',
  heroTagline: 'Aesthetics and beauty studio, Chennai',
  heroTitle: 'Soft light for skin, hair and nails.',
  heroSubtitle: 'Gentle, personalized and unhurried treatments planned around your skin, hair care, makeup, and wellness goals.',
  heroImageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=80',
  serviceCategories: [],
  servicesImages: {},
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

// GET current site settings from MongoDB
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = await Settings.create(defaultSettings);
    }
    if (!settings.serviceCategories) {
      settings.serviceCategories = [];
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Save handler with Cloudinary upload & MongoDB persistence
const handleSaveSettings = async (req, res) => {
  try {
    const updates = { ...req.body };

    // 1. Brand Logo
    if (updates.logoImageUrl && typeof updates.logoImageUrl === 'string' && updates.logoImageUrl.startsWith('data:image/')) {
      updates.logoImageUrl = await uploadToCloudinary(updates.logoImageUrl, 'nilavi/brand');
    }

    // 2. Hero Image
    if (updates.heroImageUrl && typeof updates.heroImageUrl === 'string' && updates.heroImageUrl.startsWith('data:image/')) {
      updates.heroImageUrl = await uploadToCloudinary(updates.heroImageUrl, 'nilavi/hero');
    }

    // 3. Dynamic Categories (upload images if base64 & cascade delete removed categories)
    if (Array.isArray(updates.serviceCategories)) {
      const prevSettings = await Settings.findOne().lean();
      if (prevSettings && Array.isArray(prevSettings.serviceCategories)) {
        const newCatKeys = new Set(updates.serviceCategories.map(c => (c.id || '').toLowerCase().trim()));
        const removedCats = prevSettings.serviceCategories.filter(c => c.id && !newCatKeys.has(c.id.toLowerCase().trim()));

        for (const rem of removedCats) {
          const remId = rem.id;
          const remName = rem.name;
          const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          await Service.deleteMany({
            $or: [
              { category: remId },
              { category: remName },
              { category: { $regex: new RegExp(`^${escapeRegex(remId)}$`, 'i') } },
              { category: { $regex: new RegExp(`^${escapeRegex(remName)}$`, 'i') } }
            ]
          });
        }
      }

      for (const cat of updates.serviceCategories) {
        if (cat.image && typeof cat.image === 'string' && cat.image.startsWith('data:image/')) {
          cat.image = await uploadToCloudinary(cat.image, 'nilavi/categories');
        }
      }
      // Also sync servicesImages map for backwards compatibility
      if (!updates.servicesImages || typeof updates.servicesImages !== 'object') updates.servicesImages = {};
      for (const cat of updates.serviceCategories) {
        if (cat.id && cat.image) {
          updates.servicesImages[cat.id] = cat.image;
        }
      }
    }

    // Clean servicesImages from any internal mongoose keys
    if (updates.servicesImages && typeof updates.servicesImages === 'object') {
      const cleanImgMap = {};
      const entries = updates.servicesImages instanceof Map
        ? Array.from(updates.servicesImages.entries())
        : Object.entries(updates.servicesImages);
      for (const [k, v] of entries) {
        if (k && !k.startsWith('$')) cleanImgMap[k] = v;
      }
      updates.servicesImages = cleanImgMap;
    }

    // 4. Gallery Images (upload images if base64)
    if (Array.isArray(updates.galleryImages)) {
      for (const item of updates.galleryImages) {
        if (item.image && typeof item.image === 'string' && item.image.startsWith('data:image/')) {
          item.image = await uploadToCloudinary(item.image, 'nilavi/gallery');
        }
      }
    }

    // Save directly to MongoDB
    const saved = await Settings.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    res.json({
      success: true,
      data: saved,
      message: 'Site settings, dynamic categories, and media saved to MongoDB successfully.'
    });
  } catch (err) {
    console.error('[Settings Save Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/', requireAdmin, handleSaveSettings);
router.put('/', requireAdmin, handleSaveSettings);

// DELETE Category & Cascade Delete all Treatments under that category
router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const rawId = req.params.id;
    const catId = decodeURIComponent(rawId).trim();

    // 1. Fetch current settings as lean POJO
    const settings = await Settings.findOne().lean() || {};
    const categories = Array.isArray(settings.serviceCategories) ? settings.serviceCategories : [];

    // Find the category to be deleted
    const targetCat = categories.find(
      c => c.id === catId ||
           (c.id && c.id.toLowerCase() === catId.toLowerCase()) ||
           (c.name && c.name.toLowerCase() === catId.toLowerCase())
    );

    const actualId = targetCat ? targetCat.id : catId;
    const actualName = targetCat ? targetCat.name : catId;

    // 2. Filter out category from serviceCategories
    const updatedCategories = categories.filter(c => {
      const cId = (c.id || '').toLowerCase().trim();
      const cName = (c.name || '').toLowerCase().trim();
      const targetId = (actualId || '').toLowerCase().trim();
      const targetName = (actualName || '').toLowerCase().trim();
      const reqId = (catId || '').toLowerCase().trim();
      if (cId === targetId || cId === targetName || cId === reqId) return false;
      if (cName === targetId || cName === targetName || cName === reqId) return false;
      return true;
    });

    // 3. Remove from servicesImages cleanly (filtering out any internal '$' keys)
    const updatedServicesImages = {};
    if (settings.servicesImages) {
      const entries = settings.servicesImages instanceof Map
        ? Array.from(settings.servicesImages.entries())
        : Object.entries(settings.servicesImages);

      for (const [key, val] of entries) {
        if (!key || key.startsWith('$')) continue;
        const kLower = key.toLowerCase().trim();
        if (
          kLower !== actualId.toLowerCase().trim() &&
          kLower !== actualName.toLowerCase().trim() &&
          kLower !== catId.toLowerCase().trim()
        ) {
          updatedServicesImages[key] = val;
        }
      }
    }

    // 4. Update Settings in MongoDB
    const saved = await Settings.findOneAndUpdate(
      {},
      { $set: { serviceCategories: updatedCategories, servicesImages: updatedServicesImages } },
      { new: true, upsert: true }
    ).lean();

    // 5. Cascade delete all Services belonging to this category
    const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const deleteQuery = {
      $or: [
        { category: actualId },
        { category: actualName },
        { category: catId },
        { category: { $regex: new RegExp(`^${escapeRegex(actualId)}$`, 'i') } },
        { category: { $regex: new RegExp(`^${escapeRegex(actualName)}$`, 'i') } },
        { category: { $regex: new RegExp(`^${escapeRegex(catId)}$`, 'i') } }
      ]
    };

    const deleteResult = await Service.deleteMany(deleteQuery);

    res.json({
      success: true,
      data: saved,
      deletedServicesCount: deleteResult.deletedCount || 0,
      deletedCategory: { id: actualId, name: actualName },
      message: `Category "${actualName}" and ${deleteResult.deletedCount || 0} treatment(s) deleted permanently.`
    });
  } catch (err) {
    console.error('[Category Delete Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
