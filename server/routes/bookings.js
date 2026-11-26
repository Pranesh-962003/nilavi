import express from 'express';
import { attachAdmin, requireAdmin } from '../middleware/auth.js';
import { upsertCustomer } from '../services/customers.js';
import Booking from '../models/booking.js';
import Service from '../models/service.js';
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

const activeOn = async (date) => {
  try {
    const list = await Booking.find({ date, status: { $ne: 'cancelled' } }).lean();
    return list || [];
  } catch {
    return [];
  }
};

async function resolveService({ serviceId, serviceName, servicePrice }) {
  let match = null;
  try {
    if (serviceId && serviceId !== 'custom') {
      match = await Service.findOne({ id: serviceId }).lean();
    }
    if (!match && serviceName) {
      match = await Service.findOne({ name: new RegExp(`^${serviceName}$`, 'i') }).lean();
    }
  } catch {
    // fallback
  }

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

// PUBLIC: time slots already taken on a date
router.get('/availability', async (req, res) => {
  const { date } = req.query;
  if (!isDateStr(date)) {
    return res.status(400).json({ success: false, message: 'A date in YYYY-MM-DD format is required.' });
  }
  const activeBookings = await activeOn(date);
  res.json({ success: true, date, taken: activeBookings.map(b => b.timeSlot) });
});

// ADMIN: all bookings with optional filters: status, date, search
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, date, search } = req.query;
    const query = {};

    if (status && status !== 'all') query.status = status;
    if (date) query.date = date;
    if (search) {
      const q = String(search).trim();
      query.$or = [
        { customerName: { $regex: q, $options: 'i' } },
        { customerPhone: { $regex: q, $options: 'i' } },
        { serviceName: { $regex: q, $options: 'i' } }
      ];
    }

    let list = await Booking.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: (list || []).length, data: list || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUBLIC (website) or ADMIN (walk-in / phone): create a booking in MongoDB
router.post('/', attachAdmin, async (req, res) => {
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

    const currentActive = await activeOn(date);
    if (currentActive.some(b => b.timeSlot === timeSlot)) {
      return res.status(409).json({
        success: false,
        message: `The ${timeSlot} slot on ${date} has just been taken. Please choose another time.`
      });
    }

    const service = await resolveService(req.body);
    const status = isAdmin && BOOKING_STATUSES.includes(req.body.status) ? req.body.status : 'pending';
    const id = `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newBookingData = {
      id,
      customerName,
      customerPhone,
      customerEmail,
      ...service,
      date,
      timeSlot: cleanText(timeSlot, 20),
      notes,
      status
    };

    const newBooking = await Booking.create(newBookingData);
    await upsertCustomer({ name: customerName, phone: customerPhone, email: customerEmail });

    res.status(201).json({ success: true, data: newBooking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: update status, schedule, notes or details in MongoDB
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let existing = await Booking.findOne({ id }).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const updates = pick(req.body, [
      'customerName', 'customerPhone', 'customerEmail', 'serviceId', 'serviceName',
      'servicePrice', 'date', 'timeSlot', 'notes', 'status'
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

    const nextDate = updates.date || existing.date;
    const nextSlot = updates.timeSlot || existing.timeSlot;
    const nextStatus = updates.status || existing.status;
    const moved = nextDate !== existing.date || nextSlot !== existing.timeSlot;

    if (moved && nextStatus !== 'cancelled') {
      const activeBookings = await activeOn(nextDate);
      if (activeBookings.some(b => b.id !== id && b.timeSlot === nextSlot)) {
        return res.status(409).json({ success: false, message: `Another appointment already holds ${nextSlot} on ${nextDate}.` });
      }
    }

    const updated = await Booking.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ADMIN: delete booking from MongoDB
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Booking.findOneAndDelete({ id });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, message: 'Booking removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
