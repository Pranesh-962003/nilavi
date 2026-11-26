import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';

export default function Services({ onSelectService, onNavigate, servicesImages = {}, serviceCategories = [] }) {
  const defaultImages = {
    facial: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
    skin: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
    hair: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1000&q=85',
    nails: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85',
    bridal: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=85',
    wax: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
    wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85'
  };

  const servicesList = (Array.isArray(serviceCategories) && serviceCategories.length > 0)
    ? serviceCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        short: cat.name,
        image: cat.image || servicesImages[cat.id] || defaultImages[cat.id] || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
        desc: cat.description || `Specialized ${cat.name} treatments customized around your personal wellness goals.`,
        pricePrefix: 'from',
        price: '₹900',
        timing: '45 min'
      }))
    : [];

  const [activeId, setActiveId] = useState(servicesList[0]?.id || '');

  useEffect(() => {
    if (servicesList.length > 0 && !servicesList.some(s => s.id === activeId)) {
      setActiveId(servicesList[0].id);
    }
  }, [servicesList, activeId]);

  if (servicesList.length === 0) {
    return null;
  }

  const handleActivate = (id) => {
    setActiveId(id);
  };

  const handleBook = (e, svcId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(`/book-appointment?service=${svcId}`);
    } else if (onSelectService) {
      onSelectService(svcId);
      const bookEl = document.getElementById('book');
      if (bookEl) bookEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="services-section-homepage">
      <div className="wrap">
        {/* Section Header */}
        <div className="head services-head">
          <div>
            <span className="section-eyebrow">Studio Treatment Menu</span>
            <h2 className="rv">What we do, and <em>what it costs.</em></h2>
            <p className="lead rv d1">
              Transparent, honest starting rates. Every treatment begins with a dedicated consultation to evaluate your skin or hair before any work begins.
            </p>
          </div>

          <div className="services-header-cta">
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate ? onNavigate('/services') : window.location.href = '/services'}
            >
              <span>View All Services &amp; Full Menu</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* PRESERVED VERTICAL EXPANDABLE ACCORDION PANELS */}
        <div className="panels rv" id="panels" role="region" aria-label="Services expandable accordion">
          {servicesList.map((s, idx) => {
            const isActive = activeId === s.id;
            return (
              <article
                key={s.id}
                className={`panel ${isActive ? 'active' : ''}`}
                tabIndex={0}
                aria-expanded={isActive}
                aria-label={s.name}
                onClick={() => handleActivate(s.id)}
                onFocus={() => handleActivate(s.id)}
              >
                <img
                  className="scene"
                  src={s.image}
                  alt={s.name}
                  loading="lazy"
                />

                <span className="panel-num" aria-hidden="true">0{idx + 1}</span>

                {/* Vertical Spine Title (When collapsed) */}
                <span className="vt" aria-hidden={isActive}>
                  {s.short}
                </span>

                {/* Expanded Details Body */}
                <div className="body">
                  <div className="panel-badge">
                    <Sparkles size={13} />
                    <span>{s.timing} session</span>
                  </div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  <div className="row">
                    <span className="price">
                      <small>{s.pricePrefix}</small>
                      <b>{s.price}</b>
                    </span>
                    <button
                      className="btn btn-gold"
                      onClick={(e) => handleBook(e, s.id)}
                    >
                      <Calendar size={14} />
                      <span>Book this service</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
