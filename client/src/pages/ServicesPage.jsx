import React, { useState, useEffect } from 'react';
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

export default function ServicesPage({ onNavigate, servicesImages = {}, defaultSelectedCategory = 'all', whatsappNumber = '919999999999' }) {
  const [selectedCategory, setSelectedCategory] = useState(defaultSelectedCategory);
  const [expandedServiceId, setExpandedServiceId] = useState('facial');
  const [servicesData, setServicesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback / default services catalog
  const defaultServices = [
    {
      id: 'facial',
      category: 'skin',
      categoryName: 'Skin Care',
      name: 'Signature Botanical Facial',
      dur: '60 min',
      price: 1800,
      image: servicesImages.facial || 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Deep cleansing, botanical enzyme exfoliation, and targeted hydration designed after a clinical skin evaluation.',
      benefits: [
        'Gentle micro-exfoliation to reveal skin radiance',
        'Deep pore unclogging with botanical steam & light extractions',
        'Hydrating algae collagen infusion mask',
        'Relaxing neck, shoulder and facial acupressure massage'
      ],
      idealFor: 'Dullness, uneven texture, dehydration, and seasonal fatigue.'
    },
    {
      id: 'hydra',
      category: 'skin',
      categoryName: 'Skin Care',
      name: 'Hydra Glow & Oxygen Revival',
      dur: '75 min',
      price: 2800,
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Advanced vortex suction and concentrated hyaluronic acid infusion to quench, plump, and deeply clarify the skin.',
      benefits: [
        'Vacuum vortex extraction of impurities and blackheads',
        'Multi-molecular weight hyaluronic serum infusion',
        'Calming cryo-globe lymphatic drainage massage',
        'Immediate dewy, camera-ready luminosity with zero downtime'
      ],
      idealFor: 'Congested pores, fine lines, tired skin, and pre-event glow.'
    },
    {
      id: 'hair',
      category: 'hair',
      categoryName: 'Hair Care',
      name: 'Restorative Hair Spa & Luminous Style',
      dur: '90 min',
      price: 1500,
      image: servicesImages.hair || 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Deep nourishment for tired scalp and hair shafts using nutrient-dense masks, ozone steam, and a custom blowout.',
      benefits: [
        'Aromatherapy scalp massage to stimulate blood flow',
        'Deep conditioning argan and keratin fiber repair mask',
        'Warm ozone steam infusion for moisture penetration',
        'Polished salon blow-dry and long-lasting heat style'
      ],
      idealFor: 'Dry, heat-damaged or chemically treated hair seeking bounce and shine.'
    },
    {
      id: 'nails',
      category: 'nails',
      categoryName: 'Nail Artistry',
      name: 'Luxury Gel Manicure & Hand Therapy',
      dur: '60 min',
      price: 900,
      image: servicesImages.nails || 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Comprehensive cuticle care, nail shaping, hand massage with botanical oils, and chip-resistant gel polish application.',
      benefits: [
        'Gentle cuticle softening and precision nail contouring',
        'Exfoliating rose sugar hand scrub',
        'Warm botanical balm hand and arm massage',
        'High-gloss, chip-resistant LED gel polish lasting 3+ weeks'
      ],
      idealFor: 'Brittle nails, dry cuticles, or anyone looking for durable, elegant nails.'
    },
    {
      id: 'bridal',
      category: 'bridal',
      categoryName: 'Bridal Artistry',
      name: 'Bespoke Bridal Makeup Trial & Draping',
      dur: '120 min',
      price: 3500,
      image: servicesImages.bridal || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Personalized bridal consultation, complete look trial, skin tone balancing, and saree/dupatta draping arrangement.',
      benefits: [
        'Comprehensive review of your wedding trousseau and jewellery',
        'Full HD makeup trial with professional shade matching',
        'Custom false lash placement and waterproofing test',
        'Pre-wedding skincare schedule planned up to the wedding week'
      ],
      idealFor: 'Brides-to-be planning wedding, reception, or muhurtham ceremonies.'
    },
    {
      id: 'wax',
      category: 'wellness',
      categoryName: 'Wellness & Waxing',
      name: 'Gentle Waxing & Calming Body Wellness',
      dur: '30 min',
      price: 300,
      image: servicesImages.wax || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85',
      shortDesc: 'Hygienic, gentle hair removal and threading using sensitive skin waxes followed by cooling organic aloe vera.',
      benefits: [
        'Low-temperature hypoallergenic wax formulated for sensitive skin',
        'Single-use sterilized applicators and fresh clean sheets',
        'Pre-wax skin barrier protection and gentle technique',
        'Post-treatment cooling chamomile and aloe vera balm'
      ],
      idealFor: 'Clean, smooth skin with minimal discomfort and redness.'
    }
  ];

  // Fetch dynamic services if available from API
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          // Merge API data with detailed fallback descriptions & images
          const merged = res.data.map(apiSvc => {
            const fallback = defaultServices.find(d => d.id === apiSvc.id) || {};
            return {
              ...fallback,
              ...apiSvc,
              image: apiSvc.image || fallback.image || defaultServices[0].image,
              benefits: fallback.benefits || [
                'Expert consultation with a certified studio aesthetician',
                'Customized formulation based on skin/hair analysis',
                'Premium hypoallergenic salon-grade products',
                'Dedicated aftercare recommendations'
              ],
              shortDesc: apiSvc.description || fallback.shortDesc
            };
          });
          setServicesData(merged);
        } else {
          setServicesData(defaultServices);
        }
      })
      .catch(() => {
        setServicesData(defaultServices);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: 'all', label: 'All Treatments' },
    { id: 'skin', label: 'Skin Care' },
    { id: 'hair', label: 'Hair Care' },
    { id: 'nails', label: 'Nail Artistry' },
    { id: 'bridal', label: 'Bridal Makeup' },
    { id: 'wellness', label: 'Wellness & Waxing' }
  ];

  const filteredServices = servicesData.filter(s => {
    if (selectedCategory === 'all') return true;
    return (s.category || '').toLowerCase() === selectedCategory.toLowerCase();
  });

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
                            src={svc.image}
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

