import { dbStore } from '../config/db.js';
import { localDateStr, normalizePhone } from '../utils/helpers.js';

const samePerson = (customer, phone) => normalizePhone(customer.phone) === phone;

export function findCustomerByPhone(phone) {
  const key = normalizePhone(phone);
  if (!key) return null;
  return dbStore.getCollection('crmCustomers').find(c => samePerson(c, key)) || null;
}

// Create the client record the first time we see a phone number, otherwise fill in
// anything we learn later (email, a proper name). Visit and spend figures are never
// stored here: they are always calculated from the bookings themselves.
export function upsertCustomer({ name, phone, email, notes, tag }) {
  const key = normalizePhone(phone);
  if (!key) return null;

  const existing = findCustomerByPhone(key);
  if (existing) {
    const updates = {};
    if (email && !existing.email) updates.email = email;
    if (name && !existing.name) updates.name = name;
    if (Object.keys(updates).length > 0) {
      return dbStore.update('crmCustomers', existing.id, updates);
    }
    return existing;
  }

  return dbStore.insert('crmCustomers', {
    name: name || 'Unnamed client',
    phone: key,
    email: email || '',
    tags: [tag || 'New Client'],
    notes: notes || ''
  });
}

function bookingsFor(customer, bookings) {
  const key = normalizePhone(customer.phone);
  return bookings
    .filter(b => key && normalizePhone(b.customerPhone) === key)
    .sort((a, b) => `${b.date} ${b.createdAt}`.localeCompare(`${a.date} ${a.createdAt}`));
}

// Everything the admin sees about a client's history, derived from live bookings
export function customerStats(customer, bookings, today = localDateStr()) {
  const list = bookingsFor(customer, bookings);
  const completed = list.filter(b => b.status === 'completed');
  const upcoming = list
    .filter(b => (b.status === 'pending' || b.status === 'confirmed') && b.date >= today)
    .sort((a, b) => `${a.date}`.localeCompare(`${b.date}`));
  const cancelled = list.filter(b => b.status === 'cancelled');

  const sum = (rows) => rows.reduce((total, b) => total + (Number(b.servicePrice) || 0), 0);

  const serviceCounts = {};
  list.filter(b => b.status !== 'cancelled').forEach(b => {
    const name = b.serviceName || 'Treatment';
    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
  });
  const favourite = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];

  const lastCompleted = completed.map(b => b.date).sort().pop() || null;
  const firstSeen = list.length
    ? list.map(b => b.createdAt || b.date).sort()[0]
    : customer.createdAt || null;

  return {
    totalBookings: list.length,
    totalVisits: completed.length,
    totalSpent: sum(completed),
    upcomingCount: upcoming.length,
    upcomingValue: sum(upcoming),
    cancelledCount: cancelled.length,
    nextAppointment: upcoming[0] || null,
    lastVisit: lastCompleted,
    firstSeen,
    favouriteService: favourite ? favourite[0] : null
  };
}

export function withStats(customer, bookings, today) {
  return { ...customer, ...customerStats(customer, bookings, today) };
}

// Full profile: client record + stats + their bookings and enquiries
export function customerProfile(customer) {
  const bookings = dbStore.find('bookings');
  const key = normalizePhone(customer.phone);
  const email = (customer.email || '').toLowerCase();

  const inquiries = dbStore.find('inquiries')
    .filter(i => (key && normalizePhone(i.phone) === key) || (email && (i.email || '').toLowerCase() === email))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    ...withStats(customer, bookings),
    bookings: bookingsFor(customer, bookings),
    inquiries
  };
}
