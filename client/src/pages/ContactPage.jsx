import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { contactFormMessage, generalEnquiryMessage, waLink } from '../lib/whatsapp';

export default function ContactPage({ onNavigate, whatsappNumber = '919999999999' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    topic: 'Signature Facial',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    const cleanPhone = formData.phone.replace(/\D/g, '');

    if (!formData.name.trim()) errs.name = 'Please enter your full name.';
    if (!cleanPhone || cleanPhone.length < 10) errs.phone = 'Please enter a valid 10-digit phone number.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.message.trim()) errs.message = 'Please include a brief message or question.';

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'website'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          phone: '',
          email: '',
          topic: 'Signature Facial',
          message: ''
        });
      } else {
        setServerError(data.message || 'Unable to deliver message right now. Please message us on WhatsApp.');
      }
    } catch {
      // In case of network timeout, show helpful fallback
      setServerError('Network connection issue. You can reach us directly on WhatsApp or phone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const waHref = waLink(whatsappNumber, generalEnquiryMessage());

  // Send whatever the visitor has typed into the form as a WhatsApp message instead
  const hasFormContent = Boolean(formData.name.trim() || formData.message.trim());
  const waFormHref = waLink(
    whatsappNumber,
    hasFormContent ? contactFormMessage({ ...formData, phone: formData.phone.trim() }) : generalEnquiryMessage()
  );

  return (
    <div className="contact-page-wrap">
      {/* Editorial Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <button className="breadcrumb-link" onClick={() => onNavigate('/')}>Home</button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Contact &amp; Location</span>
          </nav>

          <span className="page-eyebrow">Studio Communications</span>
          <h1 className="page-title">
            Say hello, or <em>pay us a visit.</em>
          </h1>
          <p className="page-lead">
            Questions regarding our bespoke treatments, pre-bridal consultations, or location details? We are here to guide you toward your personal beauty ritual.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="contact-details-section">
        <div className="wrap contact-layout-grid">
          {/* Left Column: Studio Information & Visiting Hours */}
          <div className="contact-info-col">
            <div className="contact-card">
              <span className="card-tag">Our Studio</span>
              <h2 className="card-headline">நிலவி Aesthetics &amp; Beauty</h2>
              <p className="card-subtext">
                An unhurried sanctuary in Tambaram, Chennai dedicated to advanced skincare, hair therapy, nail artistry, and bridal makeup.
              </p>

              <div className="contact-meta-list">
                {/* Location */}
                <div className="contact-meta-item">
                  <div className="meta-icon-box">
                    <MapPin size={18} />
                  </div>
                  <div className="meta-text-box">
                    <b>Studio Address</b>
                    <p>12, Lakeview Street, Tambaram, Chennai, Tamil Nadu 600045</p>
                    <a
                      href="https://maps.google.com/?q=Tambaram+Chennai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-action-link"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Telephone & WhatsApp */}
                <div className="contact-meta-item">
                  <div className="meta-icon-box">
                    <Phone size={18} />
                  </div>
                  <div className="meta-text-box">
                    <b>Direct Line &amp; WhatsApp</b>
                    <p>+91 99999 99999</p>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="meta-action-link wa-accent"
                    >
                      <WhatsAppIcon size={14} strokeWidth={1.8} />
                      <span>Chat with a Studio Specialist</span>
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-meta-item">
                  <div className="meta-icon-box">
                    <Mail size={18} />
                  </div>
                  <div className="meta-text-box">
                    <b>Email Inquiries</b>
                    <p>hello@nilavistudio.com</p>
                    <span className="meta-note">We typically reply within 4 business hours.</span>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="contact-meta-item">
                  <div className="meta-icon-box">
                    <Clock size={18} />
                  </div>
                  <div className="meta-text-box">
                    <b>Operating Hours</b>
                    <div className="hours-grid">
                      <div className="hours-row">
                        <span>Tuesday – Saturday</span>
                        <b>9:30 AM – 7:30 PM</b>
                      </div>
                      <div className="hours-row">
                        <span>Sunday</span>
                        <b>10:00 AM – 6:00 PM</b>
                      </div>
                      <div className="hours-row closed">
                        <span>Monday</span>
                        <em>Closed (Sanitation &amp; Staff Training)</em>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Callout */}
            <div className="consult-callout-card">
              <Sparkles size={20} className="callout-sparkle" />
              <div>
                <h4>Prefer booking directly?</h4>
                <p>You can reserve a dedicated treatment time slot in our live studio calendar.</p>
                <button
                  className="btn btn-gold btn-sm"
                  style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => onNavigate('/book-appointment')}
                >
                  <Calendar size={14} strokeWidth={1.8} />
                  <span>Go to Appointment Booking</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Inquiry Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <div className="form-card-header">
                <h3>Send Us an Inquiry</h3>
                <p>Fill out the form below and our studio team will reach out to you.</p>
              </div>

              {submitSuccess && (
                <div className="form-alert-success" role="alert">
                  <CheckCircle2 size={20} />
                  <div>
                    <b>Thank you! Your message has been received.</b>
                    <p>Our studio manager will contact you via phone or email within a few hours.</p>
                  </div>
                </div>
              )}

              {serverError && (
                <div className="form-alert-error" role="alert">
                  <AlertCircle size={20} />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Full Name <span className="req">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Priya Ramanathan"
                    className={`form-input ${errors.name ? 'has-error' : ''}`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span className="form-error-msg">{errors.name}</span>}
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      className={`form-input ${errors.phone ? 'has-error' : ''}`}
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. priya@gmail.com"
                      className={`form-input ${errors.email ? 'has-error' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <span className="form-error-msg">{errors.email}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="topic" className="form-label">
                    Interested Treatment / Inquiry Focus
                  </label>
                  <select
                    id="topic"
                    name="topic"
                    className="form-select"
                    value={formData.topic}
                    onChange={handleChange}
                  >
                    <option value="Signature Facial">Signature Facial &amp; Skin Care</option>
                    <option value="Hydra Glow Facial">Hydra Glow Facial Treatment</option>
                    <option value="Hair Spa & Style">Hair Spa &amp; Keratin Styling</option>
                    <option value="Gel Manicure">Gel Manicure &amp; Nail Artistry</option>
                    <option value="Bridal Packages">Bridal Makeup &amp; Packages</option>
                    <option value="Waxing & Wellness">Waxing &amp; Wellness</option>
                    <option value="General Question">General Inquiry / Gift Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Your Message / Specific Goals <span className="req">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    required
                    placeholder="Tell us about your skin or hair preferences, preferred timing, or any questions..."
                    className={`form-textarea ${errors.message ? 'has-error' : ''}`}
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                  {errors.message && <span className="form-error-msg">{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-gold form-submit-btn"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? 'Sending…' : 'Submit Inquiry'}</span>
                </button>

                <a
                  className="btn btn-wa-subtle form-submit-btn"
                  href={waFormHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon size={16} strokeWidth={1.8} />
                  <span>Send these details on WhatsApp instead</span>
                </a>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

