import express from 'express';
import { dbStore } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { customerProfile, findCustomerByPhone, withStats } from '../services/customers.js';
import { addDays, cleanText, isValidPhone, localDateStr, normalizePhone, pick } from '../utils/helpers.js';

const router = express.Router();

// Everything under /api/crm is staff-only
router.use(requireAdmin);

const priceOf = (b) => Number(b.servicePrice) || 0;
const sum = (rows) => rows.reduce((total, b) => total + priceOf(b), 0);
const createdDay = (row) => (row.createdAt ? localDateStr(row.createdAt) : row.date || '');

function shortLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function countBy(rows, keyFn) {
  const map = new Map();
  rows.forEach(row => {
    const key = keyFn(row);
    if (!key) return;
    const entry = map.get(key) || { label: key, count: 0, value: 0 };
    entry.count += 1;
    entry.value += priceOf(row);
    map.set(key, entry);
  });
  return [...map.values()].sort((a, b) => b.count - a.count || b.value - a.value);
}

// Headline numbers (kept for compatibility; the dashboard uses /analytics)
router.get('/stats', (req, res) => {
  try {
    const bookings = dbStore.find('bookings');
    const inquiries = dbStore.find('inquiries');
    const customers = dbStore.find('crmCustomers');
    const today = localDateStr();

    const byStatus = (status) => bookings.filter(b => b.status === status);
    const todayAppointments = bookings.filter(b => b.date === today && b.status !== 'cancelled');
    const upcomingBookings = bookings
      .filter(b => b.date >= today && (b.status === 'pending' || b.status === 'confirmed'))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: byStatus('pending').length,
      confirmedBookings: byStatus('confirmed').length,
      completedBookings: byStatus('completed').length,
      cancelledBookings: byStatus('cancelled').length,
      totalRevenue: sum(byStatus('completed')),
      bookedValue: sum(bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')),
      totalInquiries: inquiries.length,
      newInquiries: inquiries.filter(i => i.status === 'new').length,
      totalCustomers: customers.length,
      todayCount: todayAppointments.length
    };

    res.json({ success: true, stats, data: stats, todayAppointments, upcomingBookings: upcomingBookings.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Dashboard analytics. ?range=7 | 30 | 90 | all
// The range applies to when a booking or lead was RECEIVED; earned revenue uses the
// appointment date of completed visits. Schedule widgets (today, next 14 days) ignore it.
router.get('/analytics', (req, res) => {
  try {
    const bookings = dbStore.find('bookings');
    const inquiries = dbStore.find('inquiries');
    const customers = dbStore.find('crmCustomers');
    const today = localDateStr();

    const days = { 7: 7, 30: 30, 90: 90 }[req.query.range] || null;
    const start = days ? addDays(today, -(days - 1)) : null;
    const prevStart = days ? addDays(start, -days) : null;
    const inRange = (d) => !start || (d >= start && d <= today);
    const inPrev = (d) => Boolean(prevStart) && d >= prevStart && d < start;

    const received = bookings.filter(b => inRange(createdDay(b)));
    const receivedPrev = bookings.filter(b => inPrev(createdDay(b)));
    const active = received.filter(b => b.status !== 'cancelled');
    const completed = bookings.filter(b => b.status === 'completed' && inRange(b.date));
    const completedPrev = bookings.filter(b => b.status === 'completed' && inPrev(b.date));
    const leads = inquiries.filter(i => inRange(createdDay(i)));
    const leadsPrev = inquiries.filter(i => inPrev(createdDay(i)));
    const newClients = customers.filter(c => c.createdAt && inRange(localDateStr(c.createdAt)));

    const decided = received.filter(b => b.status !== 'pending');
    const cancelled = received.filter(b => b.status === 'cancelled');
    const convertedLeads = leads.filter(i => i.status === 'converted');

    // Trend series: daily up to 31 days, otherwise weekly buckets
    let seriesStart = start;
    if (!seriesStart) {
      const earliest = bookings.map(createdDay).filter(Boolean).sort()[0] || today;
      const cap = addDays(today, -179);
      seriesStart = earliest < cap ? cap : earliest;
      if (addDays(seriesStart, 6) > today) seriesStart = addDays(today, -6);
    }
    const spanDays = Math.round((new Date(`${today}T00:00:00`) - new Date(`${seriesStart}T00:00:00`)) / 86400000) + 1;
    const step = spanDays > 31 ? 7 : 1;
    const trend = [];
    for (let cursor = seriesStart; cursor <= today; cursor = addDays(cursor, step)) {
      const end = step === 1 ? cursor : (addDays(cursor, step - 1) > today ? today : addDays(cursor, step - 1));
      const rows = bookings.filter(b => {
        const d = createdDay(b);
        return d >= cursor && d <= end && b.status !== 'cancelled';
      });
      trend.push({
        key: cursor,
        label: shortLabel(cursor),
        detail: step === 1 ? shortLabel(cursor) : `${shortLabel(cursor)} – ${shortLabel(end)}`,
        bookings: rows.length,
        value: sum(rows)
      });
    }

    // Schedule load for the next 14 days (by appointment date)
    const schedule = [];
    for (let i = 0; i < 14; i += 1) {
      const date = addDays(today, i);
      const rows = bookings.filter(b => b.date === date && b.status !== 'cancelled');
      schedule.push({
        key: date,
        label: i === 0 ? 'Today' : shortLabel(date),
        detail: new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }),
        bookings: rows.length,
        confirmed: rows.filter(b => b.status === 'confirmed').length,
        pending: rows.filter(b => b.status === 'pending').length,
        value: sum(rows)
      });
    }

    const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled'];
    const statusBreakdown = statusOrder.map(status => {
      const rows = received.filter(b => (b.status || 'pending') === status);
      return { label: status, count: rows.length, value: sum(rows) };
    });

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdays = [1, 2, 3, 4, 5, 6, 0].map(index => {
      const rows = active.filter(b => b.date && new Date(`${b.date}T00:00:00`).getDay() === index);
      return { label: weekdayNames[index].slice(0, 3), detail: weekdayNames[index], count: rows.length, value: sum(rows) };
    });

    const today7 = addDays(today, 6);
    const upcoming = bookings
      .filter(b => b.date >= today && (b.status === 'pending' || b.status === 'confirmed'))
      .sort((a, b) => `${a.date}`.localeCompare(`${b.date}`));

    res.json({
      success: true,
      data: {
        range: days ? String(days) : 'all',
        generatedAt: new Date().toISOString(),
        today,
        kpis: {
          bookingsReceived: received.length,
          bookingsReceivedPrev: days ? receivedPrev.length : null,
          bookedValue: sum(active),
          revenueEarned: sum(completed),
          revenueEarnedPrev: days ? sum(completedPrev) : null,
          completedVisits: completed.length,
          averageTicket: active.length ? Math.round(sum(active) / active.length) : 0,
          leadsReceived: leads.length,
          leadsReceivedPrev: days ? leadsPrev.length : null,
          leadConversionRate: leads.length ? Math.round((convertedLeads.length / leads.length) * 100) : null,
          cancellationRate: decided.length ? Math.round((cancelled.length / decided.length) * 100) : null,
          newClients: newClients.length,
          totalClients: customers.length,
          // Schedule-based, independent of the range
          todayAppointments: bookings.filter(b => b.date === today && b.status !== 'cancelled').length,
          pendingConfirmation: bookings.filter(b => b.status === 'pending' && b.date >= today).length,
          overdue: bookings.filter(b => (b.status === 'pending' || b.status === 'confirmed') && b.date < today).length,
          next7Days: upcoming.filter(b => b.date <= today7).length,
          pipelineValue: sum(upcoming),
          newLeadsOpen: inquiries.filter(i => (i.status || 'new') === 'new').length
        },
        trend,
        trendBucket: step === 1 ? 'day' : 'week',
        schedule,
        serviceMix: countBy(active, b => b.serviceName || 'Treatment').slice(0, 8),
        statusBreakdown,
        leadSources: countBy(leads, i => (i.source || 'website').toLowerCase()),
        leadPipeline: ['new', 'contacted', 'in_progress', 'converted', 'closed'].map(status => ({
          label: status,
          count: leads.filter(i => (i.status || 'new') === status).length
        })),
        timeSlots: countBy(active, b => b.timeSlot).slice(0, 8),
        weekdays,
        upcoming: upcoming.slice(0, 8)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Client directory, with visit and spend figures calculated from bookings
router.get('/customers', (req, res) => {
  try {
    const { search } = req.query;
    const bookings = dbStore.find('bookings');
    const today = localDateStr();
    let list = dbStore.find('crmCustomers').map(c => withStats(c, bookings, today));

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => (b.totalSpent - a.totalSpent) || (b.totalBookings - a.totalBookings));
    res.json({ success: true, count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// One client's full profile: details, stats, bookings and enquiries
router.get('/customers/:id', (req, res) => {
  try {
    const customer = dbStore.findById('crmCustomers', req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customerProfile(customer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function readCustomerFields(body) {
  const fields = pick(body, ['name', 'phone', 'email', 'tags', 'notes', 'birthday', 'address', 'skinType', 'allergies', 'preferences']);
  ['name', 'email', 'birthday', 'address', 'skinType', 'allergies', 'preferences'].forEach(key => {
    if (fields[key] !== undefined) fields[key] = cleanText(fields[key], 300);
  });
  if (fields.notes !== undefined) fields.notes = cleanText(fields.notes, 2000);
  if (fields.phone !== undefined) fields.phone = normalizePhone(fields.phone);
  if (fields.tags !== undefined) {
    const raw = Array.isArray(fields.tags) ? fields.tags : String(fields.tags).split(',');
    fields.tags = [...new Set(raw.map(t => cleanText(t, 40)).filter(Boolean))].slice(0, 12);
  }
  return fields;
}

// Create client
router.post('/customers', (req, res) => {
  try {
    const fields = readCustomerFields(req.body);
    if (!fields.name || !fields.phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone required' });
    }
    if (!isValidPhone(fields.phone)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (findCustomerByPhone(fields.phone)) {
      return res.status(409).json({ success: false, message: 'A client with this phone number already exists.' });
    }

    const newCust = dbStore.insert('crmCustomers', {
      email: '',
      notes: '',
      ...fields,
      tags: fields.tags && fields.tags.length ? fields.tags : ['Regular']
    });

    res.status(201).json({ success: true, data: withStats(newCust, dbStore.find('bookings')) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update client
router.patch('/customers/:id', (req, res) => {
  try {
    const { id } = req.params;
    const fields = readCustomerFields(req.body);

    if (fields.name !== undefined && !fields.name) {
      return res.status(400).json({ success: false, message: 'Customer name cannot be empty.' });
    }
    if (fields.phone !== undefined) {
      if (!isValidPhone(fields.phone)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
      }
      const clash = findCustomerByPhone(fields.phone);
      if (clash && clash.id !== id) {
        return res.status(409).json({ success: false, message: 'Another client already uses this phone number.' });
      }
    }

    const updated = dbStore.update('crmCustomers', id, fields);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customerProfile(updated) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete client (their bookings are kept)
router.delete('/customers/:id', (req, res) => {
  try {
    const deleted = dbStore.delete('crmCustomers', req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
