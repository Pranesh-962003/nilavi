import React, { useState, useEffect, useMemo } from 'react';
import WhatsAppIcon from '../components/WhatsAppIcon';
import { serviceEnquiryMessage, waLink } from '../lib/whatsapp';
import {
  Sparkles,
  Clock,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function ServicesPage({ onNavigate, servicesImages = {}, serviceCategories: propServiceCategories = [], defaultSelectedCategory = 'all', whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '916383643060' }) {
  const [selectedCategory, setSelectedCategory] = useState(defaultSelectedCategory);
  const [expandedServiceId, setExpandedServiceId] = useState(null);
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesList, setCategoriesList] = useState(
    Array.isArray(propServiceCategories) ? propServiceCategories : []
  );

  // Sync / fetch database categories
  useEffect(() => {
    if (Array.isArray(propServiceCategories) && propServiceCategories.length > 0) {
      setCategoriesList(propServiceCategories);
    } else {
      fetch('/api/settings')
        .then(r => r.json())
        .then(res => {
          if (res.success && Array.isArray(res.data?.serviceCategories)) {
            setCategoriesList(res.data.serviceCategories);
          }
        })
        .catch(() => {});
    }
  }, [propServiceCategories]);

  // Dynamic services from database
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          const mapped = res.data.map(apiSvc => {
            const catObj = (categoriesList || []).find(
              c => c.id === apiSvc.category ||
                   c.id?.toLowerCase() === (apiSvc.category || '').toLowerCase() ||
                   c.name?.toLowerCase() === (apiSvc.category || '').toLowerCase()
            );

            const catImage = catObj?.image ||
                             servicesImages[apiSvc.category] ||
                             servicesImages[(apiSvc.category || '').toLowerCase()] ||
                             'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85';

            const resolvedImage = apiSvc.image || catImage;

            return {
              ...apiSvc,
              categoryName: catObj ? catObj.name : (apiSvc.category || 'Treatment'),
              image: resolvedImage,
              benefits: apiSvc.benefits || [
                'Expert consultation with a certified studio aesthetician',
                'Customized formulation based on skin/hair analysis',
                'Premium hypoallergenic salon-grade products',
                'Dedicated aftercare recommendations'
              ],
              shortDesc: apiSvc.description || 'Gentle, personalized treatment planned around your goals.'
            };
          });
          setServicesData(mapped);
        } else {
          setServicesData([]);
        }
      })
      .catch(() => {
        setServicesData([]);
      })
      .finally(() => setLoading(false));
  }, [categoriesList, servicesImages]);

  // STRICTLY database stored categories only — no synthetic, discovered, or mock categories
  const categories = useMemo(() => {
    const list = (Array.isArray(categoriesList) && categoriesList.length > 0)
      ? categoriesList.map(c => ({ id: c.id, label: c.name }))
      : [];

    return [
      { id: 'all', label: 'All Treatments' },
      ...list
    ];
  }, [categoriesList]);

  const validCategoryIds = useMemo(() => {
    const set = new Set();
    (categoriesList || []).forEach(c => {
      if (c.id) set.add(c.id.toLowerCase().trim());
      if (c.name) set.add(c.name.toLowerCase().trim());
    });
    return set;
  }, [categoriesList]);

  const filteredServices = useMemo(() => {
    return servicesData.filter(s => {
      const sCat = (s.category || '').toLowerCase().trim();
      // If we have categories defined in DB, only show services belonging to valid categories
      if (validCategoryIds.size > 0 && !validCategoryIds.has(sCat)) {
        return false;
      }
      if (selectedCategory === 'all') return true;
      const filterKey = selectedCategory.toLowerCase().trim();
      const catObj = categories.find(c => c.id?.toLowerCase() === filterKey || c.label?.toLowerCase() === filterKey);
      return sCat === filterKey || (catObj && (sCat === catObj.id?.toLowerCase() || sCat === catObj.label?.toLowerCase()));
    });
  }, [servicesData, selectedCategory, categories, validCategoryIds]);

  const toggleAccordion = (id) => {
    setExpandedServiceId(prev => (prev === id ? null : id));
  };

  const handleBookService = (serviceId) => {
    if (onNavigate) {
      onNavigate(`/book-appointment?service=${serviceId}`);
    } else {
      window.location.href = `/book-appointment?service=${serviceId}`;
    }
  };

  const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  return (
    <div className="services-page-wrap">
      {/* Editorial Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <button className="breadcrumb-link" onClick={() => onNavigate('/')}>Home</button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Services Menu</span>
          </nav>

          <span className="page-eyebrow">Studio Treatment Catalog</span>
          <h1 className="page-title">
            What we do, and <em>what it costs.</em>
          </h1>
          <p className="page-lead">
            Every treatment at நிலவி begins with an unhurried consultation to examine your skin, hair, and personal goals. All pricing is transparent with no hidden add-ons.
          </p>

          {/* Category Filter Pills */}
          <div className="category-filters-strip" role="tablist" aria-label="Filter treatments by category">
            {categories.map(cat => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={selectedCategory === cat.id}
                className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Section - PRESERVED VERTICAL ACCORDION */}
      <section className="services-accordion-section">
        <div className="wrap">
          <div className="services-catalog-header">
            <div>
              <span className="catalog-count-label">
                Showing {filteredServices.length} {filteredServices.length === 1 ? 'treatment' : 'treatments'}
              </span>
              <p className="catalog-note">Click any treatment to expand full protocol, benefits, and timing.</p>
            </div>
            <button
              className="btn btn-gold"
              onClick={() => onNavigate('/book-appointment')}
            >
              <Calendar size={15} strokeWidth={1.8} />
              <span>Book an Appointment</span>
            </button>
          </div>

          {/* Vertical Accordion List */}
          <div className="vertical-accordion-container" role="region" aria-label="Treatments accordion">
            {filteredServices.map(svc => {
                const isExpanded = expandedServiceId === svc.id;
                return (
                  <div
                    key={svc.id}
                    className={`vertical-accordion-item ${isExpanded ? 'is-expanded' : ''}`}
                  >
                    {/* Collapsed Header / Accordion Trigger */}
                    <button
                      className="accordion-header-btn"
                      onClick={() => toggleAccordion(svc.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`svc-details-${svc.id}`}
                    >
                      <div className="accordion-title-group">
                        <span className="accordion-category-badge">{svc.categoryName || svc.category}</span>
                        <h3 className="accordion-service-name">{svc.name}</h3>
                      </div>

                      <div className="accordion-meta-group">
                        <div className="accordion-timing">
                          <Clock size={14} />
                          <span>{svc.dur}</span>
                        </div>
                        <div className="accordion-price">
                          <small>starting at</small>
                          <b>{fmtCurrency(svc.price)}</b>
                        </div>
                        <div className="accordion-chevron-icon" aria-hidden="true">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Accordion Body */}
                    {isExpanded && (
                      <div className="accordion-expanded-body" id={`svc-details-${svc.id}`}>
                        <div className="expanded-grid">
                          {/* Service Photo */}
                          <div className="expanded-image-wrap">
                            <img
                              src={
                                svc.image ||
                                (serviceCategories || []).find(
                                  c => c.id === svc.category ||
                                       c.id?.toLowerCase() === (svc.category || '').toLowerCase() ||
                                       c.name?.toLowerCase() === (svc.category || '').toLowerCase()
                                )?.image ||
                                servicesImages[svc.category] ||
                                servicesImages[(svc.category || '').toLowerCase()] ||
                                'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85'
                              }
                              alt={svc.name}
                              className="expanded-photo"
                              loading="lazy"
                            />
                          <div className="expanded-image-badge">
                            <Sparkles size={13} />
                            <span>Certified Aesthetician Session</span>
                          </div>
                        </div>

                        {/* Service Description & Benefits */}
                        <div className="expanded-details-content">
                          <p className="expanded-description">{svc.shortDesc}</p>

                          {svc.idealFor && (
                            <div className="expanded-ideal-for">
                              <b>Recommended for:</b>
                              <span>{svc.idealFor}</span>
                            </div>
                          )}

                          {svc.benefits && svc.benefits.length > 0 && (
                            <div className="expanded-benefits-block">
                              <h4>Treatment Steps &amp; Protocol:</h4>
                              <ul className="expanded-benefits-list">
                                {svc.benefits.map((b, i) => (
                                  <li key={i}>
                                    <CheckCircle2 size={15} className="benefit-icon" />
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Footer */}
                          <div className="expanded-actions-row">
                            <div className="price-tag-block">
                              <small>Confirmed starting fee</small>
                              <b className="price-display">{fmtCurrency(svc.price)}</b>
                              <span className="timing-display">({svc.dur})</span>
                            </div>

                            <div className="expanded-cta-group">
                              <a
                                className="btn btn-wa-subtle"
                                href={waLink(whatsappNumber, serviceEnquiryMessage(svc))}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <WhatsAppIcon size={16} strokeWidth={1.8} />
                                <span>Ask on WhatsApp</span>
                              </a>
                              <button
                                className="btn btn-gold"
                                onClick={() => handleBookService(svc.id)}
                              >
                                <span>Book this treatment</span>
                                <ArrowRight size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredServices.length === 0 && (
              <div className="services-empty-state">
                <Sparkles size={28} />
                <p>No treatments found in this category.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedCategory('all')}
                >
                  View All Treatments
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking CTA Banner */}
      <section className="services-cta-banner">
        <div className="wrap">
          <div className="services-cta-card">
            <div className="cta-content">
              <h2>Need guidance choosing the right treatment?</h2>
              <p>
                Visit us for a complimentary 10-minute skin or hair assessment. Our specialists will analyze your condition and recommend an ideal regimen.
              </p>
            </div>
            <div className="cta-actions">
              <button
                className="btn btn-gold"
                onClick={() => onNavigate('/book-appointment')}
              >
                Schedule Consultation
              </button>
              <button
                className="btn btn-outline-light"
                onClick={() => onNavigate('/contact')}
              >
                Inquire via Message
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

