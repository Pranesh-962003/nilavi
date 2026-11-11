import React, { useState } from 'react';
import { setAdminToken } from '../lib/api';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function AdminLogin({ onLoginSuccess, onBackToSite }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('nilavi2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        setAdminToken(data.token);
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch {
      setError('Cannot reach the studio server. Please check that it is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setUsername('admin');
    setPassword('nilavi2026');
    setError('');
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
              <div className="crm-brand-crest">
                <Sparkles size={20} className="crest-icon" />
              </div>
              <div className="crm-brand-titles">
                <h3>Nilavi Aesthetics</h3>
                <span>Management Workstation</span>
              </div>
            </div>

            <div className="crm-login-hero-copy">
              <h2>Studio Control &amp; CRM</h2>
              <p>
                Oversee customer bookings, track multi-channel WhatsApp and web leads, manage client histories, and update studio media in real time.
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
              <span>Restricted Staff Access · 256-Bit Encrypted Session</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="crm-login-form-panel">
          <div className="crm-login-form-inner">
            <div className="crm-login-form-header">
              <h3>Admin Sign In</h3>
              <p>Enter your credentials to access the studio control panel</p>
            </div>

            {error && (
              <div className="crm-alert crm-alert-danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="crm-field">
                <label htmlFor="adm-user">Username</label>
                <div className="crm-input-icon-wrap">
                  <User size={18} className="input-icon" />
                  <input
                    id="adm-user"
                    type="text"
                    required
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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

              <div className="crm-login-row">
                <label className="crm-checkbox-label">
                  <input type="checkbox" defaultChecked />
                  <span>Keep session active</span>
                </label>
                <button type="button" className="crm-demo-fill-btn" onClick={fillDemo}>
                  Fill demo credentials
                </button>
              </div>

              <button type="submit" className="crm-login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <div className="crm-btn-spinner" />
                    <span>Authenticating session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={17} className="crm-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="crm-login-footer">
              <button type="button" className="crm-link-back" onClick={onBackToSite}>
                <ArrowLeft size={16} />
                <span>Return to Customer Site</span>
              </button>
              <div className="crm-creds-hint">
                Default: <code>admin</code> / <code>nilavi2026</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
