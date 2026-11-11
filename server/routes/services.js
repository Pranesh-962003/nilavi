import express from 'express';
import { dbStore } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { pick } from '../utils/helpers.js';

const router = express.Router();

// GET all services
router.get('/', (req, res) => {
  try {
    const list = dbStore.find('services');
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add service
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, category, dur, price, description, svgSymbol } = req.body;
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' });
    }

    // Readable id from the name; add a suffix if that id is already used
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'service';
    let id = base;
    for (let n = 2; dbStore.findById('services', id); n += 1) id = base + '-' + n;
    const newSvc = dbStore.insert('services', {
      id,
      name,
      category: category || 'general',
      dur: dur || '45 min',
      price: Number(price) || 0,
      description: description || '',
      active: true,
      svgSymbol: svgSymbol || 's-skin'
    });

    res.status(201).json({ success: true, data: newSvc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update service
router.patch('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = pick(req.body, ['name', 'category', 'dur', 'price', 'description', 'active', 'svgSymbol']);
    if (updates.price !== undefined) updates.price = Number(updates.price) || 0;
    const updated = dbStore.update('services', id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE service
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.delete('services', id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

