import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import Inquiry from '../models/inquiry.js';
import { LEAD_STATUSES, cleanText, normalizePhone, pick } from '../utils/helpers.js';

const router = express.Router();

// GET all contact inquiries / leads with filtering by source & status from MongoDB
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, source, search } = req.query;
    let list = await Inquiry.find().sort({ createdAt: -1 }).lean();

    // Ensure all items have default source and history
    list = list.map(i => ({
      ...i,
      id: i.id || i._id.toString(),
      source: i.source || (i.phone && !i.email ? 'whatsapp' : 'website'),
      history: i.history && i.history.length > 0 ? i.history : [
        {
          id: `h-init-${i.id || i._id}`,
          action: 'Inquiry Received',
          note: i.message ? `Client wrote: "${i.message.slice(0, 80)}..."` : 'Initial lead captured',
          timestamp: i.createdAt ? new Date(i.createdAt).toISOString() : new Date().toISOString(),
          author: i.source === 'whatsapp' ? 'WhatsApp Gateway' : 'Website Form'
        }
      ]
    }));

    if (status && status !== 'all') {
      list = list.filter(i => i.status === status);
    }
    if (source && source !== 'all') {
      list = list.filter(i => (i.source || 'website').toLowerCase() === source.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.email && i.email.toLowerCase().includes(q)) ||
        (i.phone && i.phone.includes(q)) ||
        (i.topic && i.topic.toLowerCase().includes(q)) ||
        (i.message && i.message.toLowerCase().includes(q)) ||
        (i.source && i.source.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit new lead to MongoDB (from website, whatsapp, or admin manual entry)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, topic, message, source } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: 'Name and either an email or phone number are required.'
      });
    }

    const leadSource = source || (email ? 'website' : 'whatsapp');
    const now = new Date().toISOString();
    const id = `inq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newInquiry = await Inquiry.create({
      id,
      name: cleanText(name, 120),
      email: cleanText(email, 160),
      phone: normalizePhone(phone),
      topic: cleanText(topic, 120) || 'General Inquiry',
      message: cleanText(message, 2000) || 'Inquiry initiated by client.',
      status: 'new',
      source: leadSource,
      notes: '',
      history: [
        {
          id: `hist-${Date.now()}`,
          action: 'Lead Captured',
          note: message ? `Initial message: "${message.trim()}"` : `Captured from ${leadSource}`,
          timestamp: now,
          author: leadSource === 'whatsapp' ? 'WhatsApp Gateway' : 'Website Form'
        }
      ]
    });

    res.status(201).json({ success: true, data: newInquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add interaction history entry to a lead in MongoDB
router.post('/:id/history', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note, author } = req.body;
    const lead = await Inquiry.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const entry = {
      id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action: action || 'Staff Note',
      note: note || '',
      timestamp: new Date().toISOString(),
      author: author || 'Admin'
    };

    lead.history.unshift(entry);
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update status, staff notes, or source of a lead in MongoDB
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = pick(req.body, ['name', 'email', 'phone', 'topic', 'message', 'status', 'source', 'notes', 'author']);
    if (updates.status && !LEAD_STATUSES.includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Unknown lead status.' });
    }
    if (updates.phone !== undefined) updates.phone = normalizePhone(updates.phone);
    
    const lead = await Inquiry.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const currentHistory = Array.isArray(lead.history) ? [...lead.history] : [];

    // Automatically audit log status changes
    if (updates.status && updates.status !== lead.status) {
      currentHistory.unshift({
        id: `hist-${Date.now()}`,
        action: 'Status Changed',
        note: `Status updated from "${lead.status}" to "${updates.status}"`,
        timestamp: new Date().toISOString(),
        author: updates.author || 'Admin'
      });
      lead.history = currentHistory;
    } else if (updates.notes && updates.notes !== lead.notes) {
      currentHistory.unshift({
        id: `hist-${Date.now()}`,
        action: 'Note Added',
        note: updates.notes,
        timestamp: new Date().toISOString(),
        author: updates.author || 'Admin'
      });
      lead.history = currentHistory;
    }

    Object.assign(lead, updates);
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE inquiry from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inquiry.findOneAndDelete({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
