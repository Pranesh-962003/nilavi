import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Menu, X } from 'lucide-react';

export default function Header({
  logoText = 'நிலவி',
  logoImageUrl = '',
  currentPath = '/',
  onNavigate
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // While the full-screen menu is open: lock page scroll, close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [mobileMenuOpen]);

  // Close the menu if the viewport grows back to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavClick = (path, hash = '') => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      if (hash && currentPath === '/') {
        const el = document.getElementById(hash.replace('#', ''));
        if (el) {
          // Wait a tick so the menu's scroll lock is released first
          setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 60);
          return;
        }
      }
      onNavigate(path + hash);
    }
  };

  const mobileLinks = [
    { label: 'Home', path: '/', hash: '', active: isCurrentPath('/') },
    { label: 'Services', path: '/services', hash: '', active: isCurrentPath('/services') },
    { label: 'Our Ritual', path: '/', hash: '#ritual', active: false },
    { label: 'Gallery', path: '/', hash: '#gallery', active: false },
    { label: 'Contact', path: '/contact', hash: '', active: isCurrentPath('/contact') }
  ];

  function isCurrentPath(path) {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }

  const isCurrent = (path) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      {/* Slim announcement bar (collapses on scroll) */}
      <div className="header-topbar">
        <div className="wrap header-topbar-inner">
          <span>Tue – Sun · 9:30 AM – 7:30 PM</span>
          <span className="topbar-gem" aria-hidden="true" />
          <span className="topbar-keep">Private studio sessions · Tambaram, Chennai</span>
          <span className="topbar-gem" aria-hidden="true" />
          <span>+91 63836 43060</span>
        </div>
      </div>

      <div className="wrap header-inner">
        {/* Brand Logo */}
        <button
          className="header-logo-btn"
          onClick={() => handleNavClick('/')}
          aria-label="நிலவி Aesthetics Home"
        >
          {logoImageUrl ? (
            <img
              src={logoImageUrl}
              alt={logoText}
              className="header-custom-logo"
            />
          ) : (
            <div className="header-brand-crest">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
              </svg>
            </div>
          )}
          <span className="header-brand-lockup">
            <span className="header-brand-title">{logoText}</span>
            <span className="header-brand-sub">Aesthetics · Beauty</span>
          </span>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="header-nav-desktop" aria-label="Main Navigation">
          <button
            className={`nav-link-btn ${isCurrent('/') && !window.location.hash.includes('ritual') ? 'active' : ''}`}
            onClick={() => handleNavClick('/')}
          >
            Home
          </button>

          <button
            className={`nav-link-btn ${isCurrent('/services') ? 'active' : ''}`}
            onClick={() => handleNavClick('/services')}
          >
            Services
          </button>

          <button
            className="nav-link-btn"
            onClick={() => handleNavClick('/', '#ritual')}
          >
            Our Ritual
          </button>

          <button
            className="nav-link-btn"
            onClick={() => handleNavClick('/', '#gallery')}
          >
            Gallery
          </button>

          <button
            className={`nav-link-btn ${isCurrent('/contact') ? 'active' : ''}`}
            onClick={() => handleNavClick('/contact')}
          >
            Contact
          </button>
        </nav>

        {/* Primary CTA and Mobile Toggle */}
        <div className="header-actions">
          <button
            className="btn btn-gold btn-sm header-book-btn"
            onClick={() => handleNavClick('/book-appointment')}
          >
            <Calendar size={14} strokeWidth={1.8} />
            <span>Book Appointment</span>
          </button>

          <button
            className="mobile-nav-toggle-btn"
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

    </header>

    {/* Full-screen mobile menu: rendered outside <header> so it covers the whole viewport */}
    {mobileMenuOpen && (
      <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site navigation">
        <div className="mobile-menu-head">
          <span className="mobile-menu-brand">
            {logoImageUrl ? (
              <img
                src={logoImageUrl}
                alt={logoText}
                className="header-custom-logo"
                style={{ maxHeight: 32, maxWidth: 100, objectFit: 'contain' }}
              />
            ) : (
              <span className="header-brand-crest">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1z" />
                </svg>
              </span>
            )}
            {logoText}
          </span>
          <button
            className="mobile-nav-toggle-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close Navigation Menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="mobile-menu-nav" aria-label="Mobile Navigation">
          {mobileLinks.map((link) => (
            <button
              key={link.label}
              className={`mobile-nav-item ${link.active ? 'active' : ''}`}
              onClick={() => handleNavClick(link.path, link.hash)}
            >
              <span>{link.label}</span>
              <ArrowRight size={18} strokeWidth={1.5} />
            </button>
          ))}
        </nav>

        <div className="mobile-menu-foot">
          <button
            className="btn btn-gold btn-block"
            onClick={() => handleNavClick('/book-appointment')}
          >
            <Calendar size={16} strokeWidth={1.8} />
            <span>Book Appointment</span>
          </button>
          <p>Tue – Sun · 9:30 AM – 7:30 PM</p>
        </div>
      </div>
    )}
    </>
  );
}
