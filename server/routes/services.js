import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { pick } from '../utils/helpers.js';
import Service from '../models/service.js';
import Settings from '../models/settings.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

// GET all services from MongoDB (with auto-cleanup of services from deleted categories)
router.get('/', async (req, res) => {
  try {
    const list = await Service.find().sort({ createdAt: -1 }).lean();

    // Auto-clean orphaned services whose category was deleted from siteSettings
    const settings = await Settings.findOne().lean();
    if (settings && Array.isArray(settings.serviceCategories) && settings.serviceCategories.length > 0 && Array.isArray(list) && list.length > 0) {
      const validCategoryKeys = new Set();
      settings.serviceCategories.forEach(c => {
        if (c.id) validCategoryKeys.add(c.id.toLowerCase().trim());
        if (c.name) validCategoryKeys.add(c.name.toLowerCase().trim());
      });
      // Standard fallback aliases
      ['skin', 'hair', 'nails', 'bridal', 'wellness', 'wax', 'general'].forEach(k => validCategoryKeys.add(k));

      const orphanedIds = list
        .filter(s => s.category && !validCategoryKeys.has(s.category.toLowerCase().trim()))
        .map(s => s.id);

      if (orphanedIds.length > 0) {
        console.log(`[Auto-Cleanup] Deleting ${orphanedIds.length} orphaned service(s) from deleted categories:`, orphanedIds);
        await Service.deleteMany({ id: { $in: orphanedIds } });
        const cleanedList = list.filter(s => !orphanedIds.includes(s.id));
        return res.json({ success: true, count: cleanedList.length, data: cleanedList });
      }
    }

    return res.json({ success: true, count: (list || []).length, data: list || [] });
  } catch (err) {
    return res.json({ success: true, count: 0, data: [] });
  }
});

// POST add service to MongoDB
router.post('/', requireAdmin, async (req, res) => {
  try {
    let { name, category, dur, price, description, svgSymbol, image } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    if (image && typeof image === 'string' && image.startsWith('data:image/')) {
      image = await uploadToCloudinary(image, 'nilavi/services');
    }

    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'service';
    let id = base;
    let n = 2;
    while (await Service.findOne({ id })) {
      id = `${base}-${n++}`;
    }

    const newSvcData = {
      id,
      name,
      category: category || 'general',
      dur: dur || '45 min',
      price: Number(price) || 0,
      image: image || '',
      description: description || '',
      active: true,
      svgSymbol: svgSymbol || 's-skin'
    };

    const newSvc = await Service.create(newSvcData);
    res.status(201).json({ success: true, data: newSvc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update service in MongoDB
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = pick(req.body, ['name', 'category', 'dur', 'price', 'description', 'active', 'svgSymbol', 'image']);
    if (updates.price !== undefined) updates.price = Number(updates.price) || 0;

    if (updates.image && typeof updates.image === 'string' && updates.image.startsWith('data:image/')) {
      updates.image = await uploadToCloudinary(updates.image, 'nilavi/services');
    }

    const updated = await Service.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE service from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
