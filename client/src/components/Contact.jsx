import React, { useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { generalEnquiryMessage, contactFormMessage, waLink } from '../lib/whatsapp';

export default function Contact({ onInquiryCreated, whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '916383643060' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Facials and skin care',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    const field = id === 'cName' ? 'name' : id === 'cEmail' ? 'email' : id === 'cPhone' ? 'phone' : id === 'cTopic' ? 'topic' : 'message';
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Enter your name.';
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Write a short message.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          topic: 'Facials and skin care',
          message: ''
        });
        if (onInquiryCreated) onInquiryCreated(data.data);
        setTimeout(() => setSent(false), 6000);
      } else {
        setErrors({ form: data.message || 'Unable to send message. Please try again.' });
      }
    } catch (err) {
      setErrors({ form: 'Network error. Please reach us directly on WhatsApp or phone.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFormContent = Boolean(formData.name.trim() || formData.message.trim());
  const waHref = waLink(
    whatsappNumber,
    hasFormContent ? contactFormMessage(formData) : generalEnquiryMessage()
  );

  return (
    <section className="contact" id="contact">
      <div className="wrap contact-grid">
        <div>
          <h2 className="rv">Say hello</h2>
          <p className="lead rv d1">
            Questions about a treatment, a bridal package or a gift card? Write to us and we'll reply within a day.
          </p>

          <div className="info rv d2">
            <div>
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
              </span>
              <p>
                <b>Studio</b>
                <span>12, Lakeview Street, Tambaram, Chennai 600045</span>
              </p>
            </div>

            <div>
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
                </svg>
              </span>
              <p>
                <b>Call &amp; WhatsApp</b>
                <span>+91 63836 43060</span>
              </p>
            </div>

            <div>
              <span className="ic">
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </span>
              <p>
                <b>Email</b>
                <span>hello@nilavi.studio</span>
              </p>
            </div>
          </div>

          <div className="wa-card rv d3">
            <div>
              <h4>Prefer WhatsApp?</h4>
              <p>Send a photo of your skin or hair and get advice before you visit.</p>
            </div>
            <a
              className="btn btn-wa"
              target="_blank"
              rel="noopener noreferrer"
              href={waHref}
            >
              <WhatsAppIcon size={16} strokeWidth={1.8} />
              <span>Chat with us</span>
            </a>
          </div>
        </div>

        <div className="panel-b rv d1">
          <form id="cForm" noValidate onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 24, fontSize: '1.8rem' }}>Send us a message</h3>

            <div className={`fl ${errors.name ? 'bad' : ''}`}>
              <input
                id="cName"
                type="text"
                placeholder=" "
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
              />
              <label htmlFor="cName">Your name</label>
            </div>
            {errors.name && <div className="err">{errors.name}</div>}

            <div className="two">
              <div className={`fl ${errors.email ? 'bad' : ''}`}>
                <input
                  id="cEmail"
                  type="email"
                  placeholder=" "
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label htmlFor="cEmail">Email</label>
              </div>
              <div className="fl">
                <input
                  id="cPhone"
                  type="tel"
                  inputMode="tel"
                  placeholder=" "
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <label htmlFor="cPhone">Phone (optional)</label>
              </div>
            </div>
            {errors.email && <div className="err">{errors.email}</div>}

            <div className="fl">
              <select id="cTopic" value={formData.topic} onChange={handleChange}>
                <option>Facials and skin care</option>
                <option>Hair</option>
                <option>Nails</option>
                <option>Bridal packages</option>
                <option>Gift cards</option>
                <option>Something else</option>
              </select>
              <label htmlFor="cTopic">I'm asking about</label>
            </div>

            <div className={`fl ${errors.message ? 'bad' : ''}`}>
              <textarea
                id="cMsg"
                placeholder=" "
                value={formData.message}
                onChange={handleChange}
              ></textarea>
              <label htmlFor="cMsg">Your message</label>
            </div>
            {errors.message && <div className="err">{errors.message}</div>}
            {errors.form && <div className="err" style={{ textAlign: 'center', marginBottom: '12px' }}>{errors.form}</div>}

            <button className="btn btn-gold" type="submit" style={{ width: '100%' }} disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>

            {sent && (
              <div className="sent on" role="status">
                Message sent. We'll reply within a day.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

