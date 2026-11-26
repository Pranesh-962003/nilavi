import { UserModel } from '../models/user.js';
import bcrypt from 'bcryptjs';
import { generatetoken } from '../utils/generateToken.js';
import { verifyFirebaseIdToken } from '../config/firebase.js';
import { readBearerToken } from '../middleware/auth.js';

const ALLOWED_ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];

export const Login = async (req, res) => {
  try {
    const bearerToken = readBearerToken(req);
    const bodyToken = req.body?.idToken || req.body?.token;
    const tokenToVerify = bearerToken || bodyToken;

    let email = (req.body?.email || '').toLowerCase().trim();
    let firebaseUid = null;
    let authMethod = 'password';

    // 1. Firebase Token Verification Flow (Recommended & Primary)
    if (tokenToVerify) {
      try {
        const decoded = await verifyFirebaseIdToken(tokenToVerify);
        email = (decoded.email || email).toLowerCase().trim();
        firebaseUid = decoded.uid;
        authMethod = 'firebase';
      } catch (tokenErr) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired Firebase authentication token.'
        });
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Credentials missing: email or authentication token required.'
      });
    }

    const adminEmails = (process.env.ADMIN_EMAIL || 'nilavee@gmail.com,liftabit.co@gmail.com')
      .toLowerCase()
      .split(',')
      .map((e) => e.trim());
    const isConfiguredAdmin = email && adminEmails.includes(email);

    let user = await UserModel.findOne({
      $or: [
        ...(firebaseUid ? [{ firebaseUid }] : []),
        { email }
      ]
    }).select('+password +loginAttempts +lockUntil');

    // Bootstrap first admin account if matching configured admin emails
    if (!user && isConfiguredAdmin) {
      user = new UserModel({
        firebaseUid: firebaseUid || undefined,
        email: email,
        name: 'Nilavi Admin',
        role: 'SUPER_ADMIN',
        isActive: true,
        lastLogin: new Date()
      });
      await user.save();
      console.log(`🛡️ Bootstrapped primary admin user for ${email}`);
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or has been disabled.'
      });
    }

    // Role-based privilege gate
    if (!ALLOWED_ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Administrator privileges required.'
      });
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        success: false,
        message: 'Too many failed attempts. Account locked temporarily.'
      });
    }

    // If using traditional password directly without Firebase
    if (authMethod === 'password') {
      const { password } = req.body;
      if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
      }

      if (user.password) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await user.save();
          return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      }
    }

    // Reset login attempts & update last login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    if (firebaseUid && !user.firebaseUid) {
      user.firebaseUid = firebaseUid;
    }
    await user.save();

    // Generate local JWT fallback token
    let sessionToken = tokenToVerify;
    if (!sessionToken && process.env.JWT_SECRETE) {
      sessionToken = await generatetoken(user._id);
    }

    if (sessionToken) {
      res.cookie('nilavee_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE === 'production' || process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token: sessionToken,
      user: {
        id: user._id,
        name: user.name || 'Admin',
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Login Controller Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    // Security Defense: NEVER allow public self-registration with admin roles
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({
      name: name || '',
      email: cleanEmail,
      password: hashedPassword,
      role: 'CUSTOMER', // Strict: customers cannot self-grant admin
      isActive: true
    });

    await user.save();
    return res.status(201).json({ success: true, message: 'Account registered successfully.' });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ success: false, message: 'Failed to register account.' });
  }
};

export const GetUser = async (req, res) => {
  try {
    if (!req.admin && !req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = req.admin || {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('[GetUser Error]', error);
    return res.status(500).json({ success: false, message: 'Error retrieving user session' });
  }
};

export const logoutAdmin = (req, res) => {
  res.clearCookie('nilavee_token', {
    httpOnly: true,
    secure: process.env.NODE === 'production' || process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  return res.status(200).json({ success: true, message: 'Signed out successfully' });
};
