import crypto from 'crypto';
import { dbStore } from '../config/db.js';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 32).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored) return false;
  if (stored.startsWith('scrypt$')) {
    const [, salt, hash] = stored.split('$');
    const candidate = crypto.scryptSync(String(password), salt, 32).toString('hex');
    return safeEqual(candidate, hash);
  }
  // Legacy plain-text value from the first seed; upgraded to a hash on next login
  return safeEqual(password, stored);
}

function getSessions() {
  if (!Array.isArray(dbStore.memoryData.sessions)) dbStore.memoryData.sessions = [];
  return dbStore.memoryData.sessions;
}

function pruneSessions() {
  const now = Date.now();
  const sessions = getSessions();
  const live = sessions.filter(s => new Date(s.expiresAt).getTime() > now);
  if (live.length !== sessions.length) {
    dbStore.memoryData.sessions = live;
    dbStore.saveData();
  }
  return live;
}

// Create a session and return the raw token (only its hash is stored)
export function createSession(username) {
  pruneSessions();
  const token = crypto.randomBytes(32).toString('hex');
  getSessions().push({
    tokenHash: sha256(token),
    username,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
  });
  dbStore.saveData();
  return token;
}

export function findSession(token) {
  if (!token) return null;
  const tokenHash = sha256(token);
  return pruneSessions().find(s => s.tokenHash === tokenHash) || null;
}

export function destroySession(token) {
  if (!token) return;
  const tokenHash = sha256(token);
  dbStore.memoryData.sessions = getSessions().filter(s => s.tokenHash !== tokenHash);
  dbStore.saveData();
}

export function readBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

// Attaches req.admin when a valid session token is sent; never rejects
export function attachAdmin(req, res, next) {
  const session = findSession(readBearerToken(req));
  if (session) req.admin = { username: session.username };
  next();
}

// Rejects the request unless a valid admin session token is sent
export function requireAdmin(req, res, next) {
  const session = findSession(readBearerToken(req));
  if (!session) {
    return res.status(401).json({ success: false, message: 'Please sign in to the admin dashboard.' });
  }
  req.admin = { username: session.username };
  next();
}
