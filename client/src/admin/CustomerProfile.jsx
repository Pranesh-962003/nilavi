import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Edit3,
  History,
  Inbox,
  Mail,
  MessageSquare,
  PhoneCall,
  Plus,
  Save,
  Star,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { adminFetch } from '../lib/api';
import { clientGreetingMessage, formatDate, openWhatsApp } from '../lib/whatsapp';

const rupees = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

const EDITABLE = [
  { key: 'name', label: 'Full name', required: true },
  { key: 'phone', label: 'Mobile number', required: true, inputMode: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'birthday', label: 'Birthday', type: 'date' },
  { key: 'address', label: 'Area / address' },
  { key: 'skinType', label: 'Skin / hair type' },
  { key: 'allergies', label: 'Allergies & sensitivities' },
  { key: 'preferences', label: 'Preferences' }
];

function toForm(profile) {
  const form = { tags: (profile.tags || []).join(', '), notes: profile.notes || '' };
  EDITABLE.forEach(f => { form[f.key] = profile[f.key] || ''; });
  return form;
}

export default function CustomerProfile({ customer, onBack, onBook, onMessageBooking, onChanged, onDelete, notify }) {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(customer));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setLoadError('');
    adminFetch(`/api/crm/customers/${customer.id}`)
      .then(r => r.json())
      .then(res => {
        if (cancelled) return;
        if (res.success) {
          setProfile(res.data);
          setForm(toForm(res.data));
        } else {
          setLoadError(res.message || 'Could not load this client.');
        }
      })
      .catch(() => { if (!cancelled) setLoadError('Could not reach the server.'); });
    return () => { cancelled = true; };
  }, [customer.id, customer.updatedAt]);

  // Show what we already have from the directory while the full profile loads
  const data = profile || { ...customer, bookings: [], inquiries: [] };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const res = await adminFetch(`/api/crm/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const out = await res.json();
      if (out.success) {
        setProfile(out.data);
        setForm(toForm(out.data));
        setEditing(false);
        if (notify) notify('Client profile saved.');
        if (onChanged) onChanged();
      } else {
        setFormError(out.message || 'Could not save the profile.');
      }
    } catch {
      setFormError('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  };

  const stat = (label, value, hint) => (
    <div className="profile-stat">
      <span>{label}</span>
      <b>{value}</b>
      {hint && <small>{hint}</small>}
    </div>
  );

  const detail = (label, value) => (
    <div className="record-keyvalue-item">
      <span className="record-keyvalue-label">{label}</span>
      <span className="record-keyvalue-val">{value || '—'}</span>
    </div>
  );

  return (
    <div className="record-detail-view">
      <div className="record-detail-header-card">
        <div>
          <button className="record-detail-back-btn" onClick={onBack}>
            <ArrowLeft size={14} />
            <span>Back to Client Directory</span>
          </button>
          <div className="record-detail-title-block">
            <h2>
              <span>{data.name}</span>
              {(data.tags || []).map((t, idx) => (
                <span key={idx} className="pro-status-badge in_progress" style={{ fontSize: '.72rem' }}>{t}</span>
              ))}
            </h2>
            <div className="record-detail-meta">
              <span>{data.phone ? `+91 ${data.phone}` : 'No phone on file'}</span>
              {data.email && (<><span>·</span><span>{data.email}</span></>)}
              {data.firstSeen && (<><span>·</span><span>Client since {formatDate(data.firstSeen)}</span></>)}
            </div>
          </div>
        </div>

        <div className="record-detail-actions">
          <button className="pro-btn pro-btn-gold pro-btn-sm" onClick={() => onBook(data)}>
            <Plus size={14} />
            <span>Book Appointment</span>
          </button>
          {data.phone && (
            <button
              className="pro-btn-action wa"
              style={{ height: 34, padding: '0 12px' }}
              onClick={() => openWhatsApp(data.phone, clientGreetingMessage(data))}
            >
              <MessageSquare size={14} />
              <span>WhatsApp</span>
            </button>
          )}
          {data.phone && (
            <a className="pro-btn pro-btn-secondary pro-btn-sm" href={`tel:+91${data.phone}`} style={{ textDecoration: 'none' }}>
              <PhoneCall size={13} />
              <span>Call</span>
            </a>
          )}
          <button className="pro-btn pro-btn-secondary pro-btn-sm" onClick={() => { setEditing(v => !v); setFormError(''); setForm(toForm(data)); }}>
            {editing ? <X size={13} /> : <Edit3 size={13} />}
            <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
          </button>
          <button className="pro-btn-action delete" style={{ height: 34, padding: '0 12px' }} onClick={() => onDelete(data)}>
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {loadError && <div className="crm-alert" role="alert" style={{ marginBottom: 16 }}>{loadError}</div>}

      {/* Figures calculated from this client's bookings */}
      <div className="profile-stat-row">
        {stat('Lifetime spend', rupees(data.totalSpent), 'Completed visits only')}
        {stat('Completed visits', data.totalVisits ?? 0, data.lastVisit ? `Last on ${formatDate(data.lastVisit)}` : 'No completed visit yet')}
        {stat('Upcoming', data.upcomingCount ?? 0, data.nextAppointment ? `Next: ${formatDate(data.nextAppointment.date)}, ${data.nextAppointment.timeSlot}` : 'Nothing scheduled')}
        {stat('Upcoming value', rupees(data.upcomingValue), 'Pending and confirmed')}
        {stat('Favourite treatment', data.favouriteService || '—', `${data.totalBookings ?? 0} bookings in total`)}
        {stat('Cancellations', data.cancelledCount ?? 0)}
      </div>

      <div className="record-detail-layout">
        <div>
          {/* Profile details (view or edit) */}
          <div className="record-field-card">
            <div className="record-field-card-title">
              <Users size={16} style={{ color: 'var(--adm-primary)' }} />
              <span>Client Profile</span>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="profile-form-grid">
                  {EDITABLE.map(f => (
                    <label key={f.key} className="pro-form-group" style={{ margin: 0 }}>
                      <span className="pro-form-label">{f.label}{f.required ? ' *' : ''}</span>
                      <input
                        className="pro-input"
                        type={f.type || 'text'}
                        inputMode={f.inputMode}
                        required={f.required}
                        value={form[f.key]}
                        onChange={(e) => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      />
                    </label>
                  ))}
                  <label className="pro-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <span className="pro-form-label">Tags (comma separated)</span>
                    <input
                      className="pro-input"
                      value={form.tags}
                      onChange={(e) => setForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="VIP, Bridal Prospect"
                    />
                  </label>
                  <label className="pro-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                    <span className="pro-form-label">Treatment notes</span>
                    <textarea
                      className="pro-textarea"
                      rows={4}
                      value={form.notes}
                      onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    />
                  </label>
                </div>
                {formError && <div className="crm-alert" role="alert" style={{ marginTop: 14 }}>{formError}</div>}
                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button type="submit" className="pro-btn pro-btn-primary pro-btn-sm" disabled={saving}>
                    <Save size={14} />
                    <span>{saving ? 'Saving…' : 'Save Profile'}</span>
                  </button>
                  <button type="button" className="pro-btn pro-btn-secondary pro-btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <div className="record-keyvalue-grid">
                  {detail('Mobile', data.phone ? `+91 ${data.phone}` : '')}
                  {detail('Email', data.email)}
                  {detail('Birthday', data.birthday ? formatDate(data.birthday) : '')}
                  {detail('Area / address', data.address)}
                  {detail('Skin / hair type', data.skinType)}
                  {detail('Allergies & sensitivities', data.allergies)}
                  {detail('Preferences', data.preferences)}
                  {detail('Tags', (data.tags || []).join(', '))}
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--adm-border-subtle)' }}>
                  <span className="record-keyvalue-label" style={{ display: 'block', marginBottom: 6 }}>Treatment notes</span>
                  <div className="profile-notes">{data.notes || 'No notes recorded yet. Use Edit Profile to add preferences or contraindications.'}</div>
                </div>
              </>
            )}
          </div>

          {/* Appointment history */}
          <div className="record-field-card">
            <div className="record-field-card-title">
              <Calendar size={16} style={{ color: 'var(--adm-primary)' }} />
              <span>Appointments ({data.bookings.length})</span>
            </div>
            {data.bookings.length > 0 ? (
              <div className="profile-list">
                {data.bookings.map(bk => (
                  <div key={bk.id} className="profile-list-row">
                    <div>
                      <b>{bk.serviceName}</b>
                      <span>{formatDate(bk.date)} · {bk.timeSlot} · {rupees(bk.servicePrice)}</span>
                      {bk.notes && <small>“{bk.notes}”</small>}
                    </div>
                    <div className="profile-list-actions">
                      <span className={`pro-status-badge ${bk.status}`}>{bk.status}</span>
                      <button className="pro-btn-action wa" onClick={() => onMessageBooking(bk)} title="Send a WhatsApp message about this appointment">
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty">{profile ? 'No appointments recorded for this phone number yet.' : 'Loading appointments…'}</div>
            )}
          </div>
        </div>

        <div>
          {/* Enquiries from the same phone or email */}
          <div className="record-field-card">
            <div className="record-field-card-title">
              <Inbox size={16} style={{ color: 'var(--adm-primary)' }} />
              <span>Enquiries ({data.inquiries.length})</span>
            </div>
            {data.inquiries.length > 0 ? (
              <div className="profile-list">
                {data.inquiries.map(inq => (
                  <div key={inq.id} className="profile-list-row" style={{ alignItems: 'flex-start' }}>
                    <div>
                      <b>{inq.topic || 'General enquiry'}</b>
                      <span>{formatDate(inq.createdAt)} · via {inq.source || 'website'}</span>
                      {inq.message && <small>“{inq.message}”</small>}
                    </div>
                    <span className={`pro-status-badge ${inq.status || 'new'}`}>{(inq.status || 'new').replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="profile-empty">No website or WhatsApp enquiries matched this client.</div>
            )}
          </div>

          <div className="record-field-card">
            <div className="record-field-card-title">
              <History size={16} style={{ color: 'var(--adm-primary)' }} />
              <span>Record</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '.82rem', color: 'var(--adm-text-secondary)' }}>
              <span><Star size={12} style={{ verticalAlign: '-1px' }} /> Client ID: {data.id}</span>
              {data.createdAt && <span><Calendar size={12} style={{ verticalAlign: '-1px' }} /> Added {formatDate(data.createdAt)}</span>}
              {data.updatedAt && <span><Edit3 size={12} style={{ verticalAlign: '-1px' }} /> Last edited {formatDate(data.updatedAt)}</span>}
              {data.email && <a href={`mailto:${data.email}`} style={{ color: 'var(--adm-primary)' }}><Mail size={12} style={{ verticalAlign: '-1px' }} /> Send an email</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
