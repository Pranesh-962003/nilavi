import express from 'express';
import { dbStore } from '../config/db.js';
import { attachAdmin, requireAdmin } from '../middleware/auth.js';
import { upsertCustomer } from '../services/customers.js';
import {
  BOOKING_STATUSES,
  cleanText,
  isDateStr,
  isValidPhone,
  localDateStr,
  normalizePhone,
  pick
} from '../utils/helpers.js';

const router = express.Router();

const activeOn = (date) =>
  dbStore.find('bookings', b => b.date === date && b.status !== 'cancelled');

function resolveService({ serviceId, serviceName, servicePrice }) {
  const services = dbStore.find('services');
  const match =
    (serviceId && services.find(s => s.id === serviceId)) ||
    (serviceName && services.find(s => s.name.toLowerCase() === String(serviceName).toLowerCase()));

  if (match) {
    return {
      serviceId: match.id,
      serviceName: serviceName || match.name,
      servicePrice: Number(servicePrice) > 0 ? Number(servicePrice) : Number(match.price) || 0,
      serviceDuration: match.dur || ''
    };
  }
  return {
    serviceId: serviceId || 'custom',
    serviceName: serviceName || 'General Beauty Treatment',
    servicePrice: Number(servicePrice) > 0 ? Number(servicePrice) : 0,
    serviceDuration: ''
  };
}

// PUBLIC: time slots already taken on a date, so the booking page can disable them
router.get('/availability', (req, res) => {
  const { date } = req.query;
  if (!isDateStr(date)) {
    return res.status(400).json({ success: false, message: 'A date in YYYY-MM-DD format is required.' });
  }
  res.json({ success: true, date, taken: activeOn(date).map(b => b.timeSlot) });
});

// ADMIN: all bookings with optional filters: status, date, search
router.get('/', requireAdmin, (req, res) => {
  try {
    const { status, date, search } = req.query;
    let list = dbStore.find('bookings');

    if (status && status !== 'all') list = list.filter(b => b.status === status);
    if (date) list = list.filter(b => b.date === date);
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(b =>
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.includes(q)) ||
        (b.serviceName && b.serviceName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUBLIC (website) or ADMIN (walk-in / phone): create a booking
router.post('/', attachAdmin, (req, res) => {
  try {
    const isAdmin = Boolean(req.admin);
    const customerName = cleanText(req.body.customerName, 120);
    const customerPhone = normalizePhone(req.body.customerPhone);
    const customerEmail = cleanText(req.body.customerEmail, 160);
    const { date, timeSlot } = req.body;
    const notes = cleanText(req.body.notes, 1000);

    if (!customerName || !customerPhone || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: 'Name, phone, date, and time slot are required.' });
    }
    if (!isValidPhone(customerPhone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!isDateStr(date)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid appointment date.' });
    }
    if (!isAdmin && date < localDateStr()) {
      return res.status(400).json({ success: false, message: 'That date has already passed. Please choose another day.' });
    }
    if (activeOn(date).some(b => b.timeSlot === timeSlot)) {
      return res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot on ${date} has just been taken. Please choose another time.`
      });
    }

    const service = resolveService(req.body);

    // Website bookings always start as pending; staff can set the status directly
    const status = isAdmin && BOOKING_STATUSES.includes(req.body.status) ? req.body.status : 'pending';

    const newBooking = dbStore.insert('bookings', {
      customerName,
      customerPhone,
      customerEmail,
      ...service,
      date,
      timeSlot: cleanText(timeSlot, 20),
      notes,
      status,
      source: isAdmin ? 'admin' : 'website',
      whatsappSent: false
    });

    upsertCustomer({ name: customerName, phone: customerPhone, email: customerEmail });

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: update status, schedule, notes or details
router.patch('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const existing = dbStore.findById('bookings', id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updates = pick(req.body, [
      'customerName', 'customerPhone', 'customerEmail', 'serviceId', 'serviceName',
      'servicePrice', 'date', 'timeSlot', 'notes', 'status', 'whatsappSent'
    ]);

    if (updates.status && !BOOKING_STATUSES.includes(updates.status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${BOOKING_STATUSES.join(', ')}.` });
    }
    if (updates.date && !isDateStr(updates.date)) {
      return res.status(400).json({ success: false, message: 'Please choose a valid appointment date.' });
    }
    if (updates.customerPhone !== undefined) {
      updates.customerPhone = normalizePhone(updates.customerPhone);
      if (!isValidPhone(updates.customerPhone)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
      }
    }
    if (updates.servicePrice !== undefined) updates.servicePrice = Number(updates.servicePrice) || 0;

    // Rescheduling must not collide with another active booking
    const nextDate = updates.date || existing.date;
    const nextSlot = updates.timeSlot || existing.timeSlot;
    const nextStatus = updates.status || existing.status;
    const moved = nextDate !== existing.date || nextSlot !== existing.timeSlot;
    if (moved && nextStatus !== 'cancelled' && activeOn(nextDate).some(b => b.id !== id && b.timeSlot === nextSlot)) {
      return res.status(409).json({ success: false, message: `Another appointment already holds ${nextSlot} on ${nextDate}.` });
    }

    if (updates.status === 'completed' && existing.status !== 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    const updated = dbStore.update('bookings', id, updates);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: delete booking
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const deleted = dbStore.delete('bookings', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
