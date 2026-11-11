import express from 'express';
import { dbStore } from '../config/db.js';
import {
  createSession,
  destroySession,
  findSession,
  hashPassword,
  readBearerToken,
  verifyPassword
} from '../middleware/auth.js';

const router = express.Router();

// Very small brute-force guard: 8 failed attempts per IP per 10 minutes
const failedAttempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function tooManyAttempts(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
}

function getAdminRecord() {
  const stored = dbStore.memoryData.admin;
  return stored && !Array.isArray(stored) ? stored : null;
}

// Admin login
router.post('/login', (req, res) => {
  try {
    const ip = req.ip || 'unknown';
    if (tooManyAttempts(ip)) {
      return res.status(429).json({ success: false, message: 'Too many sign-in attempts. Please wait a few minutes and try again.' });
    }

    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    const admin = getAdminRecord();

    // Credentials from server/.env take priority over the stored record
    const envUser = process.env.ADMIN_USER;
    const envPass = process.env.ADMIN_PASS;

    let valid = false;
    let displayName = admin?.name || 'Nilavi Studio Manager';

    if (envUser && envPass) {
      valid = username === envUser && verifyPassword(password, envPass);
    } else {
      const validUser = admin?.username || 'admin';
      const storedPass = admin?.passwordHash || 'nilavi2026';
      valid = username === validUser && verifyPassword(password, storedPass);

      // Upgrade a legacy plain-text password to a salted hash
      if (valid && admin && !String(storedPass).startsWith('scrypt$')) {
        admin.passwordHash = hashPassword(password);
        dbStore.saveData();
      }
    }

    if (!valid) {
      recordFailure(ip);
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    failedAttempts.delete(ip);
    const token = createSession(username);
    return res.json({
      success: true,
      token,
      user: { username, name: displayName, role: 'admin' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify session
router.get('/verify', (req, res) => {
  const session = findSession(readBearerToken(req));
  if (!session) {
    return res.status(401).json({ success: false, valid: false });
  }
  const admin = getAdminRecord();
  return res.json({
    success: true,
    valid: true,
    user: { username: session.username, name: admin?.name || 'Nilavi Studio Manager', role: 'admin' }
  });
});

// Sign out
router.post('/logout', (req, res) => {
  destroySession(readBearerToken(req));
  res.json({ success: true });
});

export default router;
