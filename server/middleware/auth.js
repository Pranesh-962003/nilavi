import rateLimiter from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.js';
import { verifyFirebaseIdToken } from '../config/firebase.js';

const ALLOWED_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

// Rate limiter to prevent brute force or DDoS on authentication routes
export const LoginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Extracts Bearer token from request Authorization header or nilavee_token cookie
 */
export function readBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  if (req.cookies && req.cookies.nilavee_token) {
    return req.cookies.nilavee_token;
  }
  return '';
}

/**
 * Core security verifier:
 * 1. Checks Firebase ID Token (or legacy signed JWT).
 * 2. Validates user existence & active status.
 * 3. Enforces that only SUPER_ADMIN or ADMIN can pass.
 */
async function authenticateUser(req) {
  const token = readBearerToken(req);
  if (!token) {
    return { ok: false, status: 401, message: 'Authorization token missing. Please sign in.' };
  }

  let email = '';
  let firebaseUid = '';

  // 1. Try Firebase Token verification first (strongest security)
  try {
    const decodedFirebase = await verifyFirebaseIdToken(token);
    email = (decodedFirebase.email || '').toLowerCase().trim();
    firebaseUid = decodedFirebase.uid;
    req.firebaseUser = decodedFirebase;
  } catch (firebaseErr) {
    // 2. Fallback check for legacy HMAC JWT if token wasn't Firebase format
    try {
      if (process.env.JWT_SECRETE) {
        const decodedJwt = jwt.verify(token, process.env.JWT_SECRETE);
        if (decodedJwt.id) {
          const user = await UserModel.findById(decodedJwt.id);
          if (user && user.isActive && ALLOWED_ADMIN_ROLES.includes(user.role)) {
            req.user = user;
            req.admin = {
              id: user._id,
              email: user.email,
              name: user.name || 'Admin',
              role: user.role
            };
            return { ok: true, user };
          }
        }
      }
    } catch {
      // Both verifications failed
    }

    return {
      ok: false,
      status: 401,
      message: 'Invalid or expired session token. Please sign in again.'
    };
  }

  // 3. User & Role Authorization Guard (Anti-Breach)
  const adminEmails = (process.env.ADMIN_EMAIL || 'nilavee@gmail.com,liftabit.co@gmail.com')
    .toLowerCase()
    .split(',')
    .map(e => e.trim());
  const isConfiguredAdmin = email && adminEmails.includes(email);
  let user = null;

  try {
    user = await UserModel.findOne({
      $or: [
        { firebaseUid: firebaseUid },
        { email: email }
      ]
    });
  } catch (err) {
    console.error('[Auth Middleware] Database query error:', err.message);
  }

  // If user is not yet in MongoDB but is in designated Admin emails list, bootstrap them
  if (!user && isConfiguredAdmin) {
    try {
      user = new UserModel({
        firebaseUid: firebaseUid,
        email: email,
        name: 'Nilavi Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        lastLogin: new Date()
      });
      await user.save();
      console.log(`🛡️ Bootstrapped primary admin account in database for ${email}`);
    } catch (saveErr) {
      console.error('[Auth Middleware] Failed to bootstrap admin:', saveErr.message);
    }
  }

  // If no user found in DB, check if email matches admin email directly
  if (!user) {
    if (isConfiguredAdmin) {
      req.admin = { id: firebaseUid, email: email, name: 'Admin', role: 'SUPER_ADMIN' };
      return { ok: true, user: req.admin };
    }
    return {
      ok: false,
      status: 403,
      message: 'Access denied: Your account does not have administrator privileges.'
    };
  }

  // Enforce account active status
  if (!user.isActive) {
    return {
      ok: false,
      status: 403,
      message: 'Your administrator account has been deactivated.'
    };
  }

  // Enforce Role-Based Access Control (RBAC)
  if (!ALLOWED_ADMIN_ROLES.includes(user.role)) {
    return {
      ok: false,
      status: 403,
      message: 'Access denied: Administrator privileges required.'
    };
  }

  // Update firebaseUid if not synced yet
  if (!user.firebaseUid && firebaseUid) {
    user.firebaseUid = firebaseUid;
    user.save().catch(() => {});
  }

  req.user = user;
  req.admin = {
    id: user._id || firebaseUid,
    email: user.email,
    name: user.name || 'Admin',
    role: user.role
  };

  return { ok: true, user };
}

/**
 * Strict middleware: Rejects request if not a verified Admin
 */
export async function requireAdmin(req, res, next) {
  const result = await authenticateUser(req);
  if (!result.ok) {
    return res.status(result.status).json({
      success: false,
      message: result.message
    });
  }
  next();
}

/**
 * Protect admin middleware alias
 */
export const protectAdmin = requireAdmin;

/**
 * Optional middleware: attaches user if authenticated, but does not block request
 */
export async function attachAdmin(req, res, next) {
  try {
    const result = await authenticateUser(req);
    if (result.ok) {
      req.admin = result.user;
    }
  } catch {
    // Non-blocking
  }
  next();
}

/**
 * Compatibility session finder for optional review checks
 */
export function findSession(token) {
  if (!token || typeof token !== 'string') return null;
  return { token: token.trim() };
}

export function createSession(username) {
  return 'fb-session-' + Date.now();
}

export function destroySession(token) {
  // Stateless tokens revoked via Firebase client
}

export default {
  requireAdmin,
  protectAdmin,
  attachAdmin,
  LoginLimiter,
  readBearerToken,
  findSession,
  createSession,
  destroySession
};
