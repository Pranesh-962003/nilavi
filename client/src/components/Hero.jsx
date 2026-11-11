import React from 'react';
import { Sparkles, Calendar, ArrowRight, Star } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { generalEnquiryMessage, waLink } from '../lib/whatsapp';

export default function Hero({
  whatsappNumber = '919999999999',
  heroImageUrl = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=85',
  heroTagline = 'Aesthetics and beauty studio, Chennai',
  heroTitle = 'Soft light for skin, hair and nails.',
  heroSubtitle = 'Gentle, personalized and unhurried treatments planned around your skin, hair care, makeup, and wellness goals.',
  onNavigate
}) {
  const waHref = waLink(whatsappNumber, generalEnquiryMessage());

  return (
    <section className="hero" id="hero">
      <div className="wrap hero-grid">
        {/* Left Column: Brand Statement & Actions */}
        <div className="hero-text-col">
          <div className="hero-eyebrow-pill">
            <Sparkles size={13} className="eyebrow-sparkle" />
            <span>{heroTagline}</span>
          </div>

          <h1 className="hero-headline">
            Soft light for <span className="gold-text">skin, hair and nails.</span>
          </h1>

          <p className="hero-description">
            {heroSubtitle}
          </p>

          <div className="hero-cta-group">
            <button
              className="btn btn-gold"
              onClick={() => {
                if (onNavigate) onNavigate('/book-appointment');
                else window.location.href = '/book-appointment';
              }}
            >
              <Calendar size={15} strokeWidth={1.8} />
              <span>Book an Appointment</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => {
                if (onNavigate) onNavigate('/services');
                else window.location.href = '/services';
              }}
            >
              <span>Explore Our Services</span>
              <ArrowRight size={15} strokeWidth={1.8} />
            </button>

            <a
              className="btn btn-wa-subtle"
              target="_blank"
              rel="noopener noreferrer"
              href={waHref}
              title="Chat with our specialist"
            >
              <WhatsAppIcon size={16} strokeWidth={1.8} />
              <span>WhatsApp Us</span>
            </a>
          </div>

          {/* Social Proof & Trust Metrics */}
          <div className="hero-trust-strip">
            <div className="trust-item">
              <div className="trust-value-row">
                <Star size={14} className="star-gold" fill="#C59B3F" color="#C59B3F" />
                <b>4.9</b>
              </div>
              <span>Google verified rating</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <b>2,400+</b>
              <span>Satisfied patrons</span>
            </div>
            <div className="trust-divider" />
            <div className="trust-item">
              <b>9 Years</b>
              <span>Studio artistry</span>
            </div>
          </div>
        </div>

        {/* Right Column: Art-Directed Arch Portrait */}
        <div className="hero-visual-col">
          <div className="hero-portrait-frame">
            <div className="portrait-arch-backdrop" />
            <div className="portrait-arch-main">
              <img
                src={heroImageUrl}
                alt="Aesthetic skincare treatment and beauty studio portrait at நிலவி Chennai"
                className="portrait-img"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
