import express from 'express';
import { findSession, readBearerToken, requireAdmin } from '../middleware/auth.js';
import Review from '../models/review.js';
import { pick } from '../utils/helpers.js';

const router = express.Router();

// GET all reviews from MongoDB (or only approved)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let query = {};
    // Unapproved reviews are only visible to signed-in staff
    if (!all || !findSession(readBearerToken(req))) {
      query = { approved: { $ne: false } };
    }
    const list = await Review.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    console.warn('[Reviews GET] Falling back to empty array:', err.message);
    res.json({ success: true, count: 0, data: [] });
  }
});

// POST new review to MongoDB
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, service, stars, quote, avatarInitial } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ success: false, message: 'Name and quote are required' });
    }

    const id = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRev = await Review.create({
      id,
      name,
      clientName: name,
      service: service || 'General Service',
      stars: Number(stars) || 5,
      rating: Number(stars) || 5,
      quote,
      comment: quote,
      avatarInitial: avatarInitial || name[0]?.toUpperCase() || 'N',
      featured: Boolean(req.body.featured),
      approved: true
    });

    res.status(201).json({ success: true, data: newRev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH review in MongoDB
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = pick(req.body, ['name', 'service', 'stars', 'quote', 'avatarInitial', 'featured', 'approved']);
    if (updates.name) updates.clientName = updates.name;
    if (updates.stars) updates.rating = updates.stars;
    if (updates.quote) updates.comment = updates.quote;

    const updated = await Review.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updates },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE review from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
