import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  User,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import WhatsAppIcon from '../components/WhatsAppIcon';

const timeSlots = [
  { label: '10:00 AM', period: 'Morning' },
  { label: '11:00 AM', period: 'Morning' },
  { label: '12:00 PM', period: 'Morning' },
  { label: '1:30 PM', period: 'Afternoon' },
  { label: '2:30 PM', period: 'Afternoon' },
  { label: '3:30 PM', period: 'Afternoon' },
  { label: '4:30 PM', period: 'Evening' },
  { label: '5:30 PM', period: 'Evening' },
  { label: '6:30 PM', period: 'Evening' }
];

import { bookingRequestMessage, formatDate, waLink } from '../lib/whatsapp';

export default function BookingPage({ onNavigate, initialServiceId = null, whatsappNumber = '919999999999' }) {
  const [services, setServices] = useState([
    { id: 'facial', name: 'Signature Botanical Facial', category: 'skin', dur: '60 min', price: 1800, desc: 'Deep cleansing, botanical enzyme exfoliation, and custom hydration.' },
    { id: 'hydra', name: 'Hydra Glow & Oxygen Revival', category: 'skin', dur: '75 min', price: 2800, desc: 'Hyaluronic vortex infusion and oxygenated skin revival.' },
    { id: 'hair', name: 'Restorative Hair Spa & Style', category: 'hair', dur: '90 min', price: 1500, desc: 'Deep conditioning argan repair mask, scalp massage, and blowout.' },
    { id: 'nails', name: 'Luxury Gel Manicure & Hand Therapy', category: 'nails', dur: '60 min', price: 900, desc: 'Cuticle restoration, organic hand massage, and long-lasting gel coat.' },
    { id: 'bridal', name: 'Bespoke Bridal Makeup Trial & Draping', category: 'bridal', dur: '120 min', price: 3500, desc: 'High-definition bridal trial, false lash placement, and wardrobe styling.' },
    { id: 'wax', name: 'Gentle Waxing & Calming Body Wellness', category: 'wellness', dur: '30 min', price: 300, desc: 'Hypoallergenic strip waxing with soothing chamomile aloe vera.' }
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [takenSlots, setTakenSlots] = useState([]);

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [bookingError, setBookingError] = useState('');

  // Fetch dynamic services from server
  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          const list = res.data.map(s => ({
            id: s.id,
            name: s.name,
            category: s.category || 'skin',
            dur: s.dur || '60 min',
            price: Number(s.price) || 1500,
            desc: s.description || 'Personalized treatment with our studio specialists.'
          }));
          setServices(list);
        }
      })
      .catch(() => {});
  }, []);

  // Pre-select service from URL param or props
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const svcParam = initialServiceId || params.get('service');
    if (svcParam && services.length > 0) {
      const match = services.find(s => s.id === svcParam);
      if (match) {
        setSelectedService(match);
      }
    }
  }, [initialServiceId, services]);

  // Load the slots already taken on the chosen day so they can't be picked twice
  const loadAvailability = (iso) => {
    if (!iso) return;
    fetch(`/api/bookings/availability?date=${iso}`)
      .then(r => r.json())
      .then(res => {
        const taken = res.success && Array.isArray(res.taken) ? res.taken : [];
        setTakenSlots(taken);
        setSelectedTime(prev => (taken.includes(prev) ? '' : prev));
      })
      .catch(() => setTakenSlots([]));
  };

  useEffect(() => {
    setTakenSlots([]);
    if (selectedDate?.iso) loadAvailability(selectedDate.iso);
  }, [selectedDate?.iso]);

  // Generate 14 selectable days starting tomorrow/today
  const availableDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isMonday = d.getDay() === 1; // Studio is closed on Mondays
      days.push({
        dateObj: d,
        iso,
        dayNum: d.getDate(),
        weekday: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        isClosed: isMonday,
        closedReason: isMonday ? 'Closed (Sanitation)' : null
      });
    }
    return days;
  }, []);

  const fmtCurrency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

  const filteredServices = services.filter(s => {
    if (categoryFilter === 'all') return true;
    return (s.category || '').toLowerCase() === categoryFilter.toLowerCase();
  });

  // Step Navigators
  const goToNextStep = () => {
    setFormErrors({});
    if (currentStep === 1) {
      if (!selectedService) {
        setFormErrors({ service: 'Please select a treatment to proceed.' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate) {
        setFormErrors({ date: 'Please select your preferred date.' });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!selectedTime) {
        setFormErrors({ time: 'Please choose an available appointment slot.' });
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      const cleanPhone = customerDetails.phone.replace(/\D/g, '');
      const errs = {};
      if (!customerDetails.name.trim()) errs.name = 'Please provide your name.';
      if (!cleanPhone || cleanPhone.length < 10) errs.phone = 'Please provide a valid 10-digit phone number.';
      if (Object.keys(errs).length > 0) {
        setFormErrors(errs);
        return;
      }
      setCurrentStep(5);
    }
  };

  const goToPrevStep = () => {
    setFormErrors({});
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final Submission to /api/bookings
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setBookingError('');

    const payload = {
      customerName: customerDetails.name.trim(),
      customerPhone: customerDetails.phone.replace(/\D/g, ''),
      customerEmail: customerDetails.email.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate.iso,
      timeSlot: selectedTime,
      notes: customerDetails.notes.trim()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedBooking(data.data);
      } else {
        setBookingError(data.message || 'Unable to confirm appointment slot. Please try another slot.');
        if (res.status === 409) {
          // Someone else took the slot while this form was open: go back to the time step
          loadAvailability(payload.date);
          setSelectedTime('');
          setCurrentStep(3);
        }
      }
    } catch {
      // Never pretend a booking was saved when the server could not be reached
      setBookingError('We could not reach the studio just now, so your appointment has not been saved. Please try again in a moment, or message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const restartBooking = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime('');
    setCustomerDetails({ name: '', phone: '', email: '', notes: '' });
    setConfirmedBooking(null);
    setBookingError('');
  };

  // WhatsApp confirmation message link
  const waConfirmationLink = useMemo(() => {
    if (!confirmedBooking) return '#';
    return waLink(whatsappNumber, bookingRequestMessage(confirmedBooking));
  }, [confirmedBooking, whatsappNumber]);

  return (
    <div className="booking-page-wrap">
      {/* Editorial Page Hero */}
      <section className="page-hero">
        <div className="wrap">
          <nav className="page-breadcrumb" aria-label="Breadcrumb">
            <button className="breadcrumb-link" onClick={() => onNavigate('/')}>Home</button>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Book Appointment</span>
          </nav>

          <span className="page-eyebrow">Studio Calendar</span>
          <h1 className="page-title">
            Reserve your <em>studio visit.</em>
          </h1>
          <p className="page-lead">
            Select your preferred treatment, convenient date, and time slot. We guarantee single-client attention and strict sterilization protocols.
          </p>
        </div>
      </section>

      {/* Main Wizard Area */}
      <section className="wizard-main-section">
        <div className="wrap">
          {!confirmedBooking ? (
            <div className="wizard-box-container">
              {/* Stepper Progress Bar */}
              <div className="wizard-progress-bar" role="progressbar" aria-valuenow={currentStep} aria-valuemin="1" aria-valuemax="5">
                {[
                  { step: 1, title: 'Treatment' },
                  { step: 2, title: 'Date' },
                  { step: 3, title: 'Time Slot' },
                  { step: 4, title: 'Your Details' },
                  { step: 5, title: 'Confirm' }
                ].map(item => (
                  <div
                    key={item.step}
                    className={`progress-step-item ${currentStep === item.step ? 'active' : currentStep > item.step ? 'completed' : ''}`}
                  >
                    <div className="step-circle">
                      {currentStep > item.step ? <CheckCircle2 size={16} /> : item.step}
                    </div>
                    <span className="step-label">{item.title}</span>
                  </div>
                ))}
              </div>

              {/* Wizard Dynamic Step Content */}
              <div className="wizard-card-surface">
                {/* STEP 1: SELECT TREATMENT */}
                {currentStep === 1 && (
                  <div className="step-content">
                    <div className="step-heading-block">
                      <span className="step-indicator-tag">Step 1 of 5</span>
                      <h2>Choose a Service</h2>
                      <p>Select the treatment you would like to reserve today.</p>
                    </div>

                    {formErrors.service && (
                      <div className="wizard-alert-error">
                        <AlertCircle size={16} />
                        <span>{formErrors.service}</span>
                      </div>
                    )}

                    {/* Category tabs */}
                    <div className="step-category-tabs">
                      {['all', 'skin', 'hair', 'nails', 'bridal', 'wellness'].map(cat => (
                        <button
                          key={cat}
                          className={`cat-tab-btn ${categoryFilter === cat ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {cat === 'all' ? 'All' : cat.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Services cards selection */}
                    <div className="service-selection-grid">
                      {filteredServices.map(svc => {
                        const isSelected = selectedService?.id === svc.id;
                        return (
                          <div
                            key={svc.id}
                            className={`service-option-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedService(svc);
                              setFormErrors({});
                            }}
                          >
                            <div className="service-card-top">
                              <span className="service-cat-pill">{svc.category}</span>
                              <div className="service-card-duration">
                                <Clock size={13} />
                                <span>{svc.dur}</span>
                              </div>
                            </div>

                            <h4>{svc.name}</h4>
                            <p>{svc.desc}</p>

                            <div className="service-card-bottom">
                              <span className="service-price-tag">{fmtCurrency(svc.price)}</span>
                              <div className="selection-radio-circle">
                                {isSelected && <div className="radio-inner" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT DATE */}
                {currentStep === 2 && (
                  <div className="step-content">
                    <div className="step-heading-block">
                      <span className="step-indicator-tag">Step 2 of 5</span>
                      <h2>Select Your Visit Date</h2>
                      <p>Available dates over the next 14 days (Studio is closed on Mondays).</p>
                    </div>

                    {formErrors.date && (
                      <div className="wizard-alert-error">
                        <AlertCircle size={16} />
                        <span>{formErrors.date}</span>
                      </div>
                    )}

                    <div className="days-selection-grid">
                      {availableDays.map((d, idx) => {
                        const isSelected = selectedDate?.iso === d.iso;
                        return (
                          <button
                            key={idx}
                            disabled={d.isClosed}
                            className={`day-card-btn ${isSelected ? 'selected' : ''} ${d.isClosed ? 'is-closed' : ''}`}
                            onClick={() => {
                              if (!d.isClosed) {
                                setSelectedDate(d);
                                setFormErrors({});
                              }
                            }}
                          >
                            <span className="day-weekday">{d.weekday}</span>
                            <b className="day-num">{d.dayNum}</b>
                            <span className="day-month">{d.month}</span>
                            {d.isClosed && <span className="closed-label">Closed</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: SELECT TIME SLOT */}
                {currentStep === 3 && (
                  <div className="step-content">
                    <div className="step-heading-block">
                      <span className="step-indicator-tag">Step 3 of 5</span>
                      <h2>Pick an Appointment Slot</h2>
                      <p>
                        Selected Date: <b>{selectedDate?.weekday}, {selectedDate?.month} {selectedDate?.dayNum}</b>
                      </p>
                    </div>

                    {formErrors.time && (
                      <div className="wizard-alert-error">
                        <AlertCircle size={16} />
                        <span>{formErrors.time}</span>
                      </div>
                    )}

                    {['Morning', 'Afternoon', 'Evening'].map(period => (
                      <div key={period} className="time-period-group">
                        <h4 className="period-title">{period} Hours</h4>
                        <div className="slots-grid">
                          {timeSlots
                            .filter(t => t.period === period)
                            .map((slot, i) => {
                              const isSelected = selectedTime === slot.label;
                              const isTaken = takenSlots.includes(slot.label);
                              return (
                                <button
                                  key={i}
                                  className={`slot-pill-btn ${isSelected ? 'selected' : ''} ${isTaken ? 'is-taken' : ''}`}
                                  disabled={isTaken}
                                  title={isTaken ? 'This time is already booked' : undefined}
                                  onClick={() => {
                                    setSelectedTime(slot.label);
                                    setFormErrors({});
                                  }}
                                >
                                  <Clock size={14} />
                                  <span>{slot.label}</span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STEP 4: CUSTOMER DETAILS */}
                {currentStep === 4 && (
                  <div className="step-content">
                    <div className="step-heading-block">
                      <span className="step-indicator-tag">Step 4 of 5</span>
                      <h2>Your Contact Details</h2>
                      <p>We use this information to confirm your appointment and send visit reminders.</p>
                    </div>

                    <div className="wizard-form-fields">
                      <div className="form-group">
                        <label className="form-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <div className="input-with-icon">
                          <User size={16} />
                          <input
                            type="text"
                            placeholder="e.g. Priya Ramanathan"
                            className={`form-input ${formErrors.name ? 'has-error' : ''}`}
                            value={customerDetails.name}
                            onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                          />
                        </div>
                        {formErrors.name && <span className="form-error-msg">{formErrors.name}</span>}
                      </div>

                      <div className="form-row-two">
                        <div className="form-group">
                          <label className="form-label">
                            Mobile Number <span className="req">*</span>
                          </label>
                          <div className="input-with-icon">
                            <Phone size={16} />
                            <input
                              type="tel"
                              placeholder="10-digit mobile number"
                              className={`form-input ${formErrors.phone ? 'has-error' : ''}`}
                              value={customerDetails.phone}
                              onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                            />
                          </div>
                          {formErrors.phone && <span className="form-error-msg">{formErrors.phone}</span>}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Email (Optional)</label>
                          <div className="input-with-icon">
                            <Mail size={16} />
                            <input
                              type="email"
                              placeholder="e.g. priya@gmail.com"
                              className="form-input"
                              value={customerDetails.email}
                              onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Personal Preferences / Allergies / Notes</label>
                        <div className="input-with-icon textarea-icon">
                          <FileText size={16} />
                          <textarea
                            rows="3"
                            placeholder="e.g. Sensitive skin, bridal trial preferences, or specific requests..."
                            className="form-textarea"
                            value={customerDetails.notes}
                            onChange={(e) => setCustomerDetails({ ...customerDetails, notes: e.target.value })}
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & CONFIRM */}
                {currentStep === 5 && (
                  <div className="step-content">
                    <div className="step-heading-block">
                      <span className="step-indicator-tag">Step 5 of 5</span>
                      <h2>Review &amp; Confirm Booking</h2>
                      <p>Please review your appointment summary before final confirmation.</p>
                    </div>

                    {bookingError && (
                      <div className="wizard-alert-error">
                        <AlertCircle size={16} />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    <div className="booking-summary-card">
                      <div className="summary-section">
                        <h4>Selected Treatment</h4>
                        <div className="summary-item-row">
                          <div>
                            <b>{selectedService?.name}</b>
                            <small>{selectedService?.dur} session</small>
                          </div>
                          <span className="summary-price">{fmtCurrency(selectedService?.price)}</span>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>Date &amp; Time</h4>
                        <div className="summary-meta-grid">
                          <div className="meta-pair">
                            <Calendar size={15} />
                            <span>{selectedDate?.weekday}, {selectedDate?.month} {selectedDate?.dayNum}, {selectedDate?.dateObj.getFullYear()}</span>
                          </div>
                          <div className="meta-pair">
                            <Clock size={15} />
                            <span>{selectedTime}</span>
                          </div>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>Client Details</h4>
                        <p>
                          <b>{customerDetails.name}</b> · {customerDetails.phone}
                          {customerDetails.email && ` · ${customerDetails.email}`}
                        </p>
                        {customerDetails.notes && (
                          <div className="summary-notes-quote">
                            "{customerDetails.notes}"
                          </div>
                        )}
                      </div>

                      <div className="summary-total-footer">
                        <span>Total Due at Studio</span>
                        <b>{fmtCurrency(selectedService?.price)}</b>
                      </div>
                    </div>
                  </div>
                )}

                {/* Wizard Footer Navigation Actions */}
                <div className="wizard-footer-actions">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={goToPrevStep}
                      disabled={isSubmitting}
                    >
                      <ArrowLeft size={15} />
                      <span>Previous Step</span>
                    </button>
                  )}

                  <div style={{ marginLeft: 'auto' }}>
                    {currentStep < 5 ? (
                      <button
                        type="button"
                        className="btn btn-gold"
                        onClick={goToNextStep}
                      >
                        <span>Continue</span>
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-gold"
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span>Reserving Slot...</span>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Confirm &amp; Book Appointment</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Booking Confirmation Screen */
            <div className="booking-confirmation-screen">
              <div className="confirmation-card">
                <div className="confirmation-crest-wrap">
                  <CheckCircle2 size={36} />
                </div>

                <span className="confirmation-badge">Request Received</span>
                <h2>We Look Forward to Welcoming You!</h2>
                <p className="confirmation-subtext">
                  Your appointment request is saved in our studio calendar and this slot is held for you. We will confirm it shortly. Tap the WhatsApp button below to send us these details for a faster reply.
                </p>

                <div className="confirmed-details-card">
                  <div className="detail-row">
                    <span>Reference ID:</span>
                    <b>{confirmedBooking.id}</b>
                  </div>
                  <div className="detail-row">
                    <span>Treatment:</span>
                    <b>{confirmedBooking.serviceName}</b>
                  </div>
                  <div className="detail-row">
                    <span>Date &amp; Time:</span>
                    <b>{formatDate(confirmedBooking.date)} at {confirmedBooking.timeSlot}</b>
                  </div>
                  <div className="detail-row">
                    <span>Client:</span>
                    <b>{confirmedBooking.customerName} ({confirmedBooking.customerPhone})</b>
                  </div>
                  <div className="detail-row total">
                    <span>Estimated Amount:</span>
                    <b className="total-gold">{fmtCurrency(confirmedBooking.servicePrice)}</b>
                  </div>
                </div>

                <div className="confirmation-actions-strip">
                  <a
                    href={waConfirmationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-wa"
                  >
                    <WhatsAppIcon size={16} strokeWidth={1.8} />
                    <span>Send WhatsApp Confirmation</span>
                  </a>

                  <button
                    className="btn btn-secondary"
                    onClick={restartBooking}
                  >
                    <span>Book Another Service</span>
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => onNavigate('/')}
                  >
                    <span>Return to Home</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

