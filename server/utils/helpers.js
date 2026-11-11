// Shared helpers for the Nilavi API

export const BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];
export const LEAD_STATUSES = ['new', 'contacted', 'in_progress', 'converted', 'closed'];

// Keep only digits and use the last 10 as the canonical Indian mobile number,
// so "+91 98401 23456", "09840123456" and "9840123456" all match one client.
export function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function isValidPhone(value) {
  return normalizePhone(value).length === 10;
}

// YYYY-MM-DD in the server's local timezone (toISOString() would give the UTC date,
// which is "yesterday" in India until 5:30 AM).
export function localDateStr(date = new Date()) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateStr(d);
}

export function isDateStr(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

// Copy only the allowed keys from a request body
export function pick(source, keys) {
  const out = {};
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      out[key] = source[key];
    }
  }
  return out;
}

export function cleanText(value, max = 2000) {
  return String(value ?? '').trim().slice(0, max);
}
