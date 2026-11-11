import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import SvgDefs from './components/SvgDefs';
import Header from './components/Header';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Services from './components/Services';
import Ritual from './components/Ritual';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import WhatsAppFab from './components/WhatsAppFab';
import { logoutAdmin, onUnauthorized, verifyAdminSession } from './lib/api';

// Dedicated Customer Pages
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Views
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    return window.location.pathname || '/';
  });

  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
  });

  // The admin is only signed in once the server confirms the stored session token
  const [adminUser, setAdminUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    verifyAdminSession().then(user => {
      if (cancelled) return;
      setAdminUser(user);
      setAuthChecked(true);
    });
    // Any admin request answered with 401 drops back to the sign-in screen
    onUnauthorized(() => setAdminUser(null));
    return () => {
      cancelled = true;
      onUnauthorized(null);
    };
  }, []);

  const [siteSettings, setSiteSettings] = useState(null);

  // Studio WhatsApp configuration
  const WHATSAPP_NUMBER = '919999999999';

  // Load site settings (custom logo, hero image, service images)
  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSiteSettings(data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Listen to popstate for browser Back / Forward buttons & Hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = window.location.pathname || '/';
      const isAdm = pathname.startsWith('/admin') || window.location.hash === '#admin';
      setCurrentPath(pathname);
      setIsAdminRoute(isAdm);
      if (isAdm) {
        fetchSettings();
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Custom client-side router navigation
  const navigateTo = (to) => {
    if (to.startsWith('/admin') || to === '#admin') {
      window.history.pushState(null, '', to);
      setCurrentPath('/admin');
      setIsAdminRoute(true);
      fetchSettings();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const [pathPart, hashPart] = to.split('#');
    // Route on the path only; any ?query (e.g. ?service=facial) stays in the URL for the page to read
    const targetPath = pathPart.split('?')[0] || '/';

    window.history.pushState(null, '', to);
    setCurrentPath(targetPath);
    setIsAdminRoute(false);

    if (hashPart) {
      setTimeout(() => {
        const el = document.getElementById(hashPart);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToSite = () => {
    navigateTo('/');
    fetchSettings();
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminUser(null);
  };

  // Determine which page component to render
  const renderCustomerPage = () => {
    const path = currentPath;

    if (path === '/' || path === '') {
      return (
        <main id="top">
          <Hero
            whatsappNumber={WHATSAPP_NUMBER}
            heroImageUrl={siteSettings?.heroImageUrl}
            heroTagline={siteSettings?.heroTagline}
            heroTitle={siteSettings?.heroTitle}
            heroSubtitle={siteSettings?.heroSubtitle}
            onNavigate={navigateTo}
          />
          <Marquee />
          <Services
            onNavigate={navigateTo}
            servicesImages={siteSettings?.servicesImages}
          />
          <Ritual />
          <Gallery galleryImages={siteSettings?.galleryImages} />
          <Reviews />

          {/* Homepage Booking CTA Banner */}
          <section className="home-booking-cta-strip">
            <div className="wrap">
              <div className="cta-strip-card">
                <div className="cta-strip-text">
                  <span className="cta-strip-tag">Private Studio Sessions</span>
                  <h2>Ready for skin, hair or bridal therapy?</h2>
                  <p>
                    Reserve your personalized consultation or treatment in our serene studio in Tambaram, Chennai.
                  </p>
                </div>
                <div className="cta-strip-buttons">
                  <button
                    className="btn btn-gold"
                    onClick={() => navigateTo('/book-appointment')}
                  >
                    <Calendar size={15} strokeWidth={1.8} />
                    <span>Book an Appointment</span>
                  </button>
                  <button
                    className="btn btn-outline-light"
                    onClick={() => navigateTo('/services')}
                  >
                    View Services Menu
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Location & Hours Preview */}
          <section className="home-location-preview">
            <div className="wrap">
              <div className="location-preview-grid">
                <div>
                  <span className="loc-label">Visit Our Studio</span>
                  <h3>12, Lakeview Street, Tambaram, Chennai 600045</h3>
                  <p>Tue – Sun: 9:30 AM – 7:30 PM (Mondays Closed for Sanitation)</p>
                </div>
                <div className="loc-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigateTo('/contact')}
                  >
                    Contact &amp; Directions
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      );
    }

    if (path === '/services' || path.startsWith('/services/')) {
      return (
        <ServicesPage
          onNavigate={navigateTo}
          servicesImages={siteSettings?.servicesImages}
        />
      );
    }

    if (path === '/contact') {
      return (
        <ContactPage
          onNavigate={navigateTo}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      );
    }

    if (path === '/book-appointment') {
      return (
        <BookingPage
          onNavigate={navigateTo}
          whatsappNumber={WHATSAPP_NUMBER}
        />
      );
    }

    // 404 Fallback for unknown URLs
    return <NotFoundPage onNavigate={navigateTo} />;
  };

  return (
    <>
      <SvgDefs />

      {isAdminRoute ? (
        !authChecked ? null : adminUser ? (
          <AdminDashboard
            onLogout={handleAdminLogout}
            onBackToSite={handleBackToSite}
            whatsappNumber={WHATSAPP_NUMBER}
          />
        ) : (
          <AdminLogin
            onLoginSuccess={(user) => setAdminUser(user)}
            onBackToSite={handleBackToSite}
          />
        )
      ) : (
        <div className="site-wrapper">
          <Header
            logoText={siteSettings?.logoText || 'நிலவி'}
            logoImageUrl={siteSettings?.logoImageUrl || ''}
            currentPath={currentPath}
            onNavigate={navigateTo}
          />

          {renderCustomerPage()}

          <Footer
            onNavigate={navigateTo}
            logoText={siteSettings?.logoText || 'நிலவி'}
            logoImageUrl={siteSettings?.logoImageUrl || ''}
          />

          <WhatsAppFab whatsappNumber={WHATSAPP_NUMBER} />
        </div>
      )}
    </>
  );
}
