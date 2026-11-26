import React, { useState, useEffect, useMemo } from 'react';
import WhatsAppIcon from './WhatsAppIcon';

const times = [
  { l: '10:00 AM', h: 10, g: 'Morning' },
  { l: '11:00 AM', h: 11, g: 'Morning' },
  { l: '12:00 PM', h: 12, g: 'Morning' },
  { l: '1:30 PM', h: 13.5, g: 'Afternoon' },
  { l: '2:30 PM', h: 14.5, g: 'Afternoon' },
  { l: '3:30 PM', h: 15.5, g: 'Afternoon' },
  { l: '4:30 PM', h: 16.5, g: 'Evening' },
  { l: '5:30 PM', h: 17.5, g: 'Evening' },
  { l: '6:30 PM', h: 18.5, g: 'Evening' }
];

export default function BookingWizard({ selectedServiceId, onBookingCreated, whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '916383643060' }) {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const [step, setStep] = useState(1);
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [takenSlots, setTakenSlots] = useState([]);

  // Fetch real booked slots for selected date from server
  useEffect(() => {
    if (!selectedDate?.iso) {
      setTakenSlots([]);
      return;
    }
    fetch(`/api/bookings/availability?date=${selectedDate.iso}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.taken)) {
          setTakenSlots(data.taken);
        } else {
          setTakenSlots([]);
        }
      })
      .catch(() => setTakenSlots([]));
  }, [selectedDate?.iso]);

  // Fetch dynamic services from server - only MongoDB services will be shown
  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map(s => ({
            id: s.id,
            name: s.name,
            dur: s.dur || s.duration || '45 min',
            price: s.price,
            ic: s.svgSymbol || s.ic || 'M12 3c3.5 3.2 6 6 6 9.2A6 6 0 0 1 6 12.2C6 9 8.500 6.200 12 3Z'
          }));
          setServices(mapped);
        } else {
          setServices([]);
        }
      })
      .catch(() => {
        setServices([]);
      })
      .finally(() => setLoadingServices(false));
  }, []);

  // Update selected service when prop changes
  useEffect(() => {
    if (selectedServiceId) {
      const match = services.find(s => s.id === selectedServiceId);
      if (match) {
        setSelectedSvc(match);
      }
    }
  }, [selectedServiceId, services]);

  // Generate 14 days
  const daysList = useMemo(() => {
    const list = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      list.push({
        dateObj: d,
        iso,
        dayNum: d.getDate(),
        weekday: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
        month: d.toLocaleDateString('en-IN', { month: 'short' }),
        isSunday: d.getDay() === 0
      });
    }
    return list;
  }, []);

  // Format currency
  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

  const handleNext = () => {
    if (step === 1) {
      if (!selectedSvc) {
        setErrors({ e1: 'Choose a treatment to continue.' });
        return;
      }
      setErrors({});
      setStep(2);
    } else if (step === 2) {
      if (!selectedDate) {
        setErrors({ e2: 'Choose a day.' });
        return;
      }
      if (!selectedTime) {
        setErrors({ e2: 'Choose a time.' });
        return;
      }
      setErrors({});
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const cleanPhone = phone.replace(/\D/g, '');
    let valid = true;
    const newErrors = {};

    if (!trimmedName) {
      newErrors.e3 = 'Enter your name.';
      valid = false;
    } else if (cleanPhone.length < 10) {
      newErrors.e3 = 'Enter a valid 10-digit phone number.';
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const bookingPayload = {
      customerName: trimmedName,
      customerPhone: cleanPhone,
      serviceId: selectedSvc.id,
      serviceName: selectedSvc.name,
      servicePrice: selectedSvc.price,
      date: selectedDate.iso,
      timeSlot: selectedTime,
      notes: notes.trim()
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedBooking(data.data);
        if (onBookingCreated) onBookingCreated(data.data);
      } else {
        setErrors({ e3: data.message || 'Error creating appointment.' });
      }
    } catch (err) {
      setErrors({ e3: 'Network error: Unable to connect to server. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookAnother = () => {
    setStep(1);
    setSelectedSvc(null);
    setSelectedDate(null);
    setSelectedTime('');
    setName('');
    setPhone('');
    setNotes('');
    setConfirmedBooking(null);
    setErrors({});
  };

  // WhatsApp confirmation url
  const waUrl = useMemo(() => {
    if (!confirmedBooking) return '#';
    const prettyDate = selectedDate ? selectedDate.dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : confirmedBooking.date;
    const msg = `Hi நிலவி, I would like to book ${confirmedBooking.serviceName} on ${prettyDate} at ${confirmedBooking.timeSlot}. Name: ${confirmedBooking.customerName}, phone: ${confirmedBooking.customerPhone}${confirmedBooking.notes ? `. Note: ${confirmedBooking.notes}` : ''}.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }, [confirmedBooking, selectedDate, whatsappNumber]);

  return (
    <section className="book" id="book">
      <div className="wrap book-grid">
        {/* Sticky Visit Sidebar */}
        <div className="book-side">
          <h2 className="rv">Book your visit</h2>
          <p className="lead rv d1">
            Choose a treatment, pick a day and time, and leave your details. We confirm by phone or WhatsApp within a few hours.
          </p>
          <div className="visit rv d2">
            <h4>Your visit</h4>
            <dl>
              <div>
                <dt>Treatment</dt>
                <dd className={selectedSvc ? '' : 'empty'}>
                  {selectedSvc ? selectedSvc.name : 'Not chosen yet'}
                </dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd className={selectedDate ? '' : 'empty'}>
                  {selectedDate
                    ? selectedDate.dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
                    : 'Not chosen yet'}
                </dd>
              </div>
              <div>
                <dt>Time</dt>
                <dd className={selectedTime ? '' : 'empty'}>
                  {selectedTime || 'Not chosen yet'}
                </dd>
              </div>
              <div>
                <dt>Starting at</dt>
                <dd className={selectedSvc ? '' : 'empty'}>
                  {selectedSvc ? fmt(selectedSvc.price) : '-'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="hours">
            <div>
              <span>Monday to Saturday</span>
              <span>10:00 AM to 8:00 PM</span>
            </div>
            <div>
              <span>Sunday</span>
              <span>11:00 AM to 5:00 PM</span>
            </div>
          </div>
        </div>

        {/* Wizard Panel */}
        <div className="panel-b rv d1">
          {!confirmedBooking ? (
            <div id="wizard">
              {/* Progress Steps */}
              <div className="prog" aria-hidden="true">
                <div className={`pn ${step === 1 ? 'on' : step > 1 ? 'done' : ''}`} data-p="1">
                  <i>{step > 1 ? '✓' : '1'}</i>
                  <span>Treatment</span>
                </div>
                <div className="bar"></div>
                <div className={`pn ${step === 2 ? 'on' : step > 2 ? 'done' : ''}`} data-p="2">
                  <i>{step > 2 ? '✓' : '2'}</i>
                  <span>Date and time</span>
                </div>
                <div className="bar"></div>
                <div className={`pn ${step === 3 ? 'on' : ''}`} data-p="3">
                  <i>3</i>
                  <span>Your details</span>
                </div>
              </div>

              {/* Step 1: Treatment */}
              {step === 1 && (
                <div className="step on" data-s="1">
                  <h3>What would you like?</h3>
                  <p className="sub">Pick one. You can add more when we confirm.</p>
                  {services.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 16px', background: 'rgba(255,255,255,0.6)', borderRadius: 12, border: '1px dashed var(--adm-border, #e5e7eb)' }}>
                      <p style={{ margin: 0, color: 'var(--text-muted, #6b7280)', fontSize: '.9rem' }}>
                        {loadingServices ? 'Loading treatments...' : 'No treatments are currently available to book.'}
                      </p>
                    </div>
                  ) : (
                    <div className="svc-opts" role="radiogroup" aria-label="Treatment">
                      {services.map((s) => (
                        <label key={s.id} className="so">
                          <input
                            type="radio"
                            name="svc"
                            value={s.id}
                            checked={selectedSvc?.id === s.id}
                            onChange={() => {
                              setSelectedSvc(s);
                              setErrors({});
                            }}
                          />
                          <div>
                            <span className="ic">
                              <svg viewBox="0 0 24 24">
                                <path d={s.ic} />
                              </svg>
                            </span>
                            <span>
                              <b>{s.name}</b>
                              <small>{s.dur} · from {fmt(s.price)}</small>
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  {errors.e1 && <div className="err" style={{ marginTop: 14 }}>{errors.e1}</div>}
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div className="step on" data-s="2">
                  <h3>Choose a day and time</h3>
                  <p className="sub">Greyed out times are already taken.</p>

                  <div className="days" role="radiogroup" aria-label="Date">
                    {daysList.map((d) => (
                      <label key={d.iso} className="day">
                        <input
                          type="radio"
                          name="day"
                          value={d.iso}
                          checked={selectedDate?.iso === d.iso}
                          onChange={() => {
                            setSelectedDate(d);
                            setSelectedTime('');
                            setErrors({});
                          }}
                        />
                        <div>
                          <small>{d.weekday}</small>
                          <b>{d.dayNum}</b>
                          <small>{d.month}</small>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div id="slotWrap">
                    {!selectedDate ? (
                      <div className="empty-note">Pick a day to see open times.</div>
                    ) : (
                      ['Morning', 'Afternoon', 'Evening'].map((group) => {
                        const groupTimes = times.filter(t => t.g === group);
                        const now = new Date();
                        const isToday = selectedDate.iso === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                        const nowH = now.getHours() + now.getMinutes() / 60 + 1;

                        return (
                          <div key={group} className="slot-group">
                            <h5>{group}</h5>
                            <div className="slots" role="radiogroup" aria-label={`${group} times`}>
                              {groupTimes.map((t) => {
                                const isPast = isToday && t.h <= nowH;
                                const isSunClosed = selectedDate.isSunday && (t.h < 11 || t.h >= 17);
                                const isTaken = takenSlots.includes(t.l);
                                const disabled = isPast || isSunClosed || isTaken;

                                return (
                                  <label key={t.l} className="slot">
                                    <input
                                      type="radio"
                                      name="time"
                                      value={t.l}
                                      disabled={disabled}
                                      checked={selectedTime === t.l}
                                      onChange={() => {
                                        setSelectedTime(t.l);
                                        setErrors({});
                                      }}
                                    />
                                    <span>{t.l}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {errors.e2 && <div className="err" style={{ marginTop: 14 }}>{errors.e2}</div>}
                </div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <div className="step on" data-s="3">
                  <h3>Almost there</h3>
                  <p className="sub">We only use these to confirm your visit.</p>
                  <div className="two">
                    <div className={`fl ${errors.e3 && !name ? 'bad' : ''}`}>
                      <input
                        id="bName"
                        type="text"
                        placeholder=" "
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <label htmlFor="bName">Your name</label>
                    </div>
                    <div className={`fl ${errors.e3 && phone.replace(/\D/g, '').length < 10 ? 'bad' : ''}`}>
                      <input
                        id="bPhone"
                        type="tel"
                        inputMode="tel"
                        placeholder=" "
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                      <label htmlFor="bPhone">Phone number</label>
                    </div>
                  </div>
                  {errors.e3 && <div className="err">{errors.e3}</div>}
                  <div className="fl">
                    <textarea
                      id="bNote"
                      placeholder=" "
                      style={{ minHeight: 100 }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                    <label htmlFor="bNote">Notes (allergies, occasion, preferred therapist)</label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="nav-btns">
                <button
                  className="back"
                  type="button"
                  style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                  onClick={handleBack}
                >
                  Back
                </button>
                <button
                  className="btn btn-gold"
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleNext}
                >
                  {isSubmitting ? 'Securing slot...' : step === 3 ? 'Request appointment' : 'Continue'}
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation Step */
            <div className="ok on" role="status" aria-live="polite">
              <div className="seal">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>
              <h3>You're on our calendar</h3>
              <p className="lead" style={{ marginInline: 'auto' }}>
                We'll message you shortly to confirm.
              </p>

              <div className="sum">
                <div>
                  <span>Treatment</span>
                  <b>{confirmedBooking.serviceName}</b>
                </div>
                <div>
                  <span>Date</span>
                  <b>{selectedDate ? selectedDate.dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : confirmedBooking.date}</b>
                </div>
                <div>
                  <span>Time</span>
                  <b>{confirmedBooking.timeSlot}</b>
                </div>
                <div>
                  <span>Name</span>
                  <b>{confirmedBooking.customerName}</b>
                </div>
              </div>

              <div className="acts">
                <a
                  className="btn btn-wa"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={waUrl}
                >
                  <WhatsAppIcon size={16} strokeWidth={1.8} />
                  <span>Confirm on WhatsApp</span>
                </a>
                <button className="btn btn-line" type="button" onClick={handleBookAnother}>
                  Book another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

