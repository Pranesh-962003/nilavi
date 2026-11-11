import express from 'express';
import { dbStore } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { LEAD_STATUSES, cleanText, normalizePhone, pick } from '../utils/helpers.js';

const router = express.Router();

// GET all contact inquiries / leads with filtering by source & status
router.get('/', requireAdmin, (req, res) => {
  try {
    const { status, source, search } = req.query;
    let list = dbStore.find('inquiries');

    // Ensure all items have default source and history
    list = list.map(i => ({
      ...i,
      source: i.source || (i.phone && !i.email ? 'whatsapp' : 'website'),
      history: i.history && i.history.length > 0 ? i.history : [
        {
          id: `h-init-${i.id}`,
          action: 'Inquiry Received',
          note: i.message ? `Client wrote: "${i.message.slice(0, 80)}..."` : 'Initial lead captured',
          timestamp: i.createdAt || new Date().toISOString(),
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

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST submit new lead (from website, whatsapp, or admin manual entry)
router.post('/', (req, res) => {
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

    const newInquiry = dbStore.insert('inquiries', {
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

// POST add interaction history entry to a lead
router.post('/:id/history', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { action, note, author } = req.body;
    const lead = dbStore.findById('inquiries', id);

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

    const currentHistory = Array.isArray(lead.history) ? lead.history : [];
    const updated = dbStore.update('inquiries', id, {
      history: [entry, ...currentHistory]
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update status, staff notes, or source of a lead
router.patch('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const updates = pick(req.body, ['name', 'email', 'phone', 'topic', 'message', 'status', 'source', 'notes', 'author']);
    if (updates.status && !LEAD_STATUSES.includes(updates.status)) {
      return res.status(400).json({ success: false, message: 'Unknown lead status.' });
    }
    if (updates.phone !== undefined) updates.phone = normalizePhone(updates.phone);
    const lead = dbStore.findById('inquiries', id);

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
      updates.history = currentHistory;
    } else if (updates.notes && updates.notes !== lead.notes) {
      currentHistory.unshift({
        id: `hist-${Date.now()}`,
        action: 'Note Added',
        note: updates.notes,
        timestamp: new Date().toISOString(),
        author: updates.author || 'Admin'
      });
      updates.history = currentHistory;
    }

    const updated = dbStore.update('inquiries', id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE inquiry
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.delete('inquiries', id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
