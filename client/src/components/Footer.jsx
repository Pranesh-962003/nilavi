import React from 'react';
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate, logoText = 'நிலவி', logoImageUrl = '' }) {
  const handleNav = (e, path) => {
    e.preventDefault();
    if (onNavigate) onNavigate(path);
    else window.location.href = path;
  };

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top-grid">
          {/* Column 1: Brand & Philosophy */}
          <div className="footer-brand-col">
            <a href="/" className="footer-logo-link" onClick={(e) => handleNav(e, '/')}>
              {logoImageUrl ? (
                <img
                  src={logoImageUrl}
                  alt={logoText}
                  className="footer-logo-img"
                />
              ) : (
                <div className="footer-logo-crest">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
                  </svg>
                </div>
              )}
              <span className="footer-logo-text">{logoText}</span>
            </a>

            <p className="footer-brand-desc">
              A serene aesthetics and beauty studio in Tambaram, Chennai. We offer gentle, personalized treatments planned around your skin, hair care, and wellness goals.
            </p>

            <div className="footer-tagline-badge">
              <span>Soft light for skin, hair and nails</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title">Navigation</h5>
            <ul className="footer-links-list">
              <li>
                <a href="/" onClick={(e) => handleNav(e, '/')}>Home Overview</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>All Services &amp; Pricing</a>
              </li>
              <li>
                <a href="/#ritual" onClick={(e) => handleNav(e, '/#ritual')}>The நிலவி Ritual</a>
              </li>
              <li>
                <a href="/#gallery" onClick={(e) => handleNav(e, '/#gallery')}>Portfolio &amp; Gallery</a>
              </li>
              <li>
                <a href="/contact" onClick={(e) => handleNav(e, '/contact')}>Contact &amp; Location</a>
              </li>
              <li>
                <a href="/book-appointment" onClick={(e) => handleNav(e, '/book-appointment')}>Book Appointment</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Treatment Menu Highlights */}
          <div className="footer-nav-col">
            <h5 className="footer-col-title">Treatments</h5>
            <ul className="footer-links-list">
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Signature Facials</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Hydra Glow Revival</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Hair Spa &amp; Keratin</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Luxury Gel Manicure</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Bespoke Bridal Makeup</a>
              </li>
              <li>
                <a href="/services" onClick={(e) => handleNav(e, '/services')}>Wellness &amp; Waxing</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Hours */}
          <div className="footer-contact-col">
            <h5 className="footer-col-title">Studio &amp; Hours</h5>
            <div className="footer-contact-info">
              <div className="footer-info-row">
                <MapPin size={15} className="info-icon" />
                <span>12, Lakeview Street, Tambaram, Chennai 600045</span>
              </div>
              <div className="footer-info-row">
                <Phone size={15} className="info-icon" />
                <span>+91 63836 43060</span>
              </div>
              <div className="footer-info-row">
                <Mail size={15} className="info-icon" />
                <span>hello@nilavistudio.com</span>
              </div>
              <div className="footer-info-row">
                <Clock size={15} className="info-icon" />
                <span>Tue – Sun: 9:30 AM – 7:30 PM (Mon Closed)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Oversized gilt wordmark */}
        <div className="footer-wordmark" aria-hidden="true">{logoText}</div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            <span>© {new Date().getFullYear()} நிலவி Aesthetics &amp; Beauty Studio. All rights reserved.</span>
          </div>

          <div className="footer-social-links">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <span>Instagram</span>
              <ArrowUpRight size={12} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <span>Facebook</span>
              <ArrowUpRight size={12} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
              <span>YouTube</span>
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
