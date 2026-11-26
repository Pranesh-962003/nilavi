import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { setAdminToken, clearAdminToken } from '../lib/api';
import { Api } from '../api';

const googleProvider = new GoogleAuthProvider();

export default function AdminLogin({ onLoginSuccess, onBackToSite, logoImageUrl = '', logoText = 'Nilavi' }) {
  const [dbLogo, setDbLogo] = useState(logoImageUrl);
  const [dbText, setDbText] = useState(logoText);

  React.useEffect(() => {
    if (!logoImageUrl) {
      fetch('/api/settings')
        .then(r => r.json())
        .then(d => {
          if (d.data?.logoImageUrl) setDbLogo(d.data.logoImageUrl);
          if (d.data?.logoText) setDbText(d.data.logoText);
        })
        .catch(() => {});
    } else {
      setDbLogo(logoImageUrl);
      setDbText(logoText);
    }
  }, [logoImageUrl, logoText]);

  const [email, setEmail] = useState('nilavee@gmail.com');
  const [password, setPassword] = useState('Nilavee123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authenticate ID token with backend RBAC security layer
  const processAuthenticatedUser = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      setAdminToken(idToken);

      // Verify token & role with backend
      const res = await Api.post(
        '/auth/login',
        { idToken, email: firebaseUser.email },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (res.data?.success && res.data?.user) {
        onLoginSuccess(res.data.user);
      } else {
        throw new Error('Could not retrieve administrator profile.');
      }
    } catch (err) {
      console.error('[Admin Auth Error]', err);
      // Immediately revoke unauthorized session
      clearAdminToken();
      await signOut(auth).catch(() => {});

      const serverMsg = err.response?.data?.message;
      if (err.response?.status === 403) {
        setError('Access Denied: This account is not registered with administrator privileges.');
      } else if (serverMsg) {
        setError(serverMsg);
      } else {
        setError('Security verification failed. Please ensure the backend server is running.');
      }
    }
  };

  // 1. Email & Password Sign In
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await processAuthenticatedUser(credential.user);
    } catch (err) {
      console.error('[Firebase Sign-In Error]', err);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-email'
      ) {
        setError('Invalid credentials: Account not registered or password incorrect. Please add this user in Firebase Console (Authentication > Users > Add user) or click "Sign In with Google" below.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Security lockout: Too many failed login attempts. Please wait a few minutes.');
      } else if (err.code === 'auth/user-disabled') {
        setError('This administrator account has been disabled.');
      } else {
        setError(err.message || 'Authentication error. Please check your network and credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processAuthenticatedUser(result.user);
    } catch (err) {
      console.error('[Google Sign-In Error]', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crm-login-page">
      <div className="crm-login-ambient-glow glow-1"></div>
      <div className="crm-login-ambient-glow glow-2"></div>

      <div className="crm-login-container">
        {/* Left Branding Showcase */}
        <div className="crm-login-brand-panel">
          <div className="crm-login-brand-inner">
            <div className="crm-login-brand-logo">
              {dbLogo ? (
                <img
                  src={dbLogo}
                  alt={dbText || 'Nilavi'}
                  style={{ maxHeight: 38, maxWidth: 130, objectFit: 'contain' }}
                />
              ) : (
                <div className="crm-brand-crest">
                  <Sparkles size={20} className="crest-icon" />
                </div>
              )}
              <div className="crm-brand-titles">
                <h3>{dbText || 'Nilavi'} Aesthetics</h3>
                <span>Management Workstation</span>
              </div>
            </div>

            <div className="crm-login-hero-copy">
              <h2>Studio Control &amp; CRM</h2>
              <p>
                Oversee customer bookings, track WhatsApp and web leads, manage client histories, and update studio media in real time.
              </p>
            </div>

            <div className="crm-login-features">
              <div className="crm-login-feature-item">
                <div className="feature-icon-wrap">
                  <CheckCircle2 size={16} />
                </div>
                <span>Multi-channel Lead Tracking &amp; WhatsApp History</span>
              </div>
              <div className="crm-login-feature-item">
                <div className="feature-icon-wrap">
                  <CheckCircle2 size={16} />
                </div>
                <span>Live Client Webpage Branding &amp; Media Customizer</span>
              </div>
              <div className="crm-login-feature-item">
                <div className="feature-icon-wrap">
                  <CheckCircle2 size={16} />
                </div>
                <span>Appointment Scheduling &amp; Rescheduling Engine</span>
              </div>
            </div>

            <div className="crm-login-security-badge">
              <ShieldCheck size={16} />
              <span>Firebase Military-Grade Auth · Cryptographically Verified RBAC</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="crm-login-form-panel">
          <div className="crm-login-form-inner">
            <div className="crm-login-form-header">
              {dbLogo && (
                <img
                  src={dbLogo}
                  alt={dbText || 'Nilavi'}
                  style={{ maxHeight: 36, maxWidth: 120, objectFit: 'contain', marginBottom: 14, display: 'block' }}
                />
              )}
              <h3>Admin Sign In</h3>
              <p>Enter your verified credentials to access the studio control panel</p>
            </div>

            {error && (
              <div className="crm-alert crm-alert-danger" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="crm-field">
                <label htmlFor="adm-email">Admin Email</label>
                <div className="crm-input-icon-wrap">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="adm-email"
                    type="email"
                    required
                    placeholder="nilavee@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="crm-field">
                <label htmlFor="adm-pass">Password</label>
                <div className="crm-input-icon-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="adm-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="crm-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="crm-login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crm-btn-spinner" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} className="crm-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            <div style={{ margin: '18px 0', textAlign: 'center', position: 'relative' }}>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', position: 'absolute', top: '50%', left: 0, right: 0 }} />
              <span style={{ position: 'relative', background: '#210B3B', padding: '0 12px', color: '#BBA891', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                or secure provider
              </span>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="crm-login-submit-btn"
              style={{
                background: '#FFFFFF',
                color: '#212121',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                fontWeight: 600,
                marginTop: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>

            <div className="crm-login-footer">
              <button type="button" className="crm-link-back" onClick={onBackToSite}>
                <ArrowLeft size={16} />
                <span>Return to Customer Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
