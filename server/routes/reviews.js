import express from 'express';
import { dbStore } from '../config/db.js';
import { findSession, readBearerToken, requireAdmin } from '../middleware/auth.js';
import { pick } from '../utils/helpers.js';

const router = express.Router();

// GET all reviews (or only approved)
router.get('/', (req, res) => {
  try {
    const { all } = req.query;
    let list = dbStore.find('reviews');
    // Unapproved reviews are only visible to signed-in staff
    if (!all || !findSession(readBearerToken(req))) {
      list = list.filter(r => r.approved !== false);
    }
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new review
router.post('/', requireAdmin, (req, res) => {
  try {
    const { name, service, stars, quote, avatarInitial } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ success: false, message: 'Name and quote are required' });
    }

    const newRev = dbStore.insert('reviews', {
      name,
      service: service || 'General Service',
      stars: Number(stars) || 5,
      quote,
      avatarInitial: avatarInitial || name[0]?.toUpperCase() || 'N',
      featured: Boolean(req.body.featured),
      approved: true
    });

    res.status(201).json({ success: true, data: newRev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH review
router.patch('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updated = dbStore.update('reviews', id, pick(req.body, ['name', 'service', 'stars', 'quote', 'avatarInitial', 'featured', 'approved']));
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE review
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.delete('reviews', id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;

