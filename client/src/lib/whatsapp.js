// One place for every WhatsApp message the site and the admin send.
// WhatsApp renders *text* as bold, so the templates use that for labels.

export const STUDIO_NAME = 'நிலவி Aesthetics & Beauty Studio';
export const STUDIO_ADDRESS = '12, Lakeview Street, Tambaram, Chennai 600045';

const rupees = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

// "2026-11-22" -> "Sun, 22 Nov 2026"
export function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(iso);
  const part = (options) => d.toLocaleDateString('en-IN', options);
  return `${part({ weekday: 'short' })}, ${d.getDate()} ${part({ month: 'short' })} ${d.getFullYear()}`;
}

// Any phone format -> digits WhatsApp accepts (adds India's 91 to a 10-digit number)
export function toWaNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
}

export function waLink(phone, message) {
  return `https://wa.me/${toWaNumber(phone)}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone, message) {
  window.open(waLink(phone, message), '_blank', 'noopener');
}

// Join lines, dropping any that are empty (so optional fields vanish cleanly)
const lines = (...rows) => rows.filter(row => row !== null && row !== undefined && row !== false).join('\n');
const field = (label, value) => (value ? `*${label}:* ${value}` : null);
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';

/* ---------- Customer -> studio (sent from the website) ---------- */

export function generalEnquiryMessage() {
  return lines(
    `Hi ${STUDIO_NAME},`,
    '',
    'I would like to know more about your treatments and availability.'
  );
}

export function serviceEnquiryMessage(service) {
  return lines(
    `Hi ${STUDIO_NAME},`,
    '',
    'I am interested in this treatment:',
    field('Service', service.name),
    field('Duration', service.dur || service.timing),
    service.price ? field('Starting price', typeof service.price === 'number' ? rupees(service.price) : service.price) : null,
    '',
    'Could you share the available slots?'
  );
}

export function bookingRequestMessage(booking) {
  return lines(
    `Hi ${STUDIO_NAME},`,
    '',
    'I have just requested an appointment on your website. Please confirm my slot.',
    '',
    field('Name', booking.customerName),
    field('Phone', booking.customerPhone),
    field('Service', booking.serviceName),
    field('Date', formatDate(booking.date)),
    field('Time', booking.timeSlot),
    booking.serviceDuration ? field('Duration', booking.serviceDuration) : null,
    booking.servicePrice ? field('Price', rupees(booking.servicePrice)) : null,
    field('Notes', booking.notes),
    booking.id ? field('Booking ref', booking.id) : null
  );
}

export function contactFormMessage(form) {
  return lines(
    `Hi ${STUDIO_NAME},`,
    '',
    'I have an enquiry:',
    field('Name', form.name),
    field('Phone', form.phone),
    field('Email', form.email),
    field('Interested in', form.topic),
    '',
    form.message || null
  );
}

/* ---------- Studio -> customer (sent from the admin dashboard) ---------- */

const bookingBlock = (b) => lines(
  field('Service', b.serviceName),
  field('Date', formatDate(b.date)),
  field('Time', b.timeSlot),
  b.servicePrice ? field('Amount', rupees(b.servicePrice)) : null
);

export const bookingTemplates = {
  received: {
    label: 'Request received',
    hint: 'Acknowledge a new website booking that is still pending',
    build: (b) => lines(
      `Hi ${firstName(b.customerName)}, thank you for choosing ${STUDIO_NAME}.`,
      '',
      'We have received your appointment request:',
      bookingBlock(b),
      '',
      'We will confirm your slot shortly.'
    )
  },
  confirmation: {
    label: 'Booking confirmation',
    hint: 'Confirm the date, time and address',
    build: (b) => lines(
      `Hi ${firstName(b.customerName)}, your appointment at ${STUDIO_NAME} is confirmed.`,
      '',
      bookingBlock(b),
      field('Address', STUDIO_ADDRESS),
      '',
      'Please arrive 10 minutes early. Reply here if you need to reschedule.'
    )
  },
  reminder: {
    label: 'Appointment reminder',
    hint: 'A gentle reminder before the visit',
    build: (b) => lines(
      `Hi ${firstName(b.customerName)}, a gentle reminder of your appointment at ${STUDIO_NAME}.`,
      '',
      bookingBlock(b),
      field('Address', STUDIO_ADDRESS),
      '',
      'Reply here if you need to change the time.'
    )
  },
  reschedule: {
    label: 'Reschedule request',
    hint: 'Ask the client to pick a new time',
    build: (b) => lines(
      `Hi ${firstName(b.customerName)}, this is ${STUDIO_NAME}.`,
      '',
      `We need to move your ${b.serviceName} appointment on ${formatDate(b.date)} at ${b.timeSlot}.`,
      'Could you tell us which other day or time suits you? We are sorry for the change.'
    )
  },
  aftercare: {
    label: 'Thank you and aftercare',
    hint: 'Send after a completed visit',
    build: (b) => lines(
      `Hi ${firstName(b.customerName)}, thank you for visiting ${STUDIO_NAME}.`,
      '',
      `We hope you enjoyed your ${b.serviceName}. If you have any questions about aftercare, just reply to this message.`,
      'We would love to see you again.'
    )
  }
};

export function leadFollowUpMessage(lead) {
  return lines(
    `Hi ${firstName(lead.name)}, this is ${STUDIO_NAME}.`,
    '',
    lead.topic
      ? `Thank you for your enquiry about ${lead.topic}. We would be happy to help.`
      : 'Thank you for your enquiry. We would be happy to help.',
    'When would be a good time for a quick chat, or would you like us to suggest a few appointment slots?'
  );
}

export function clientGreetingMessage(client) {
  return lines(
    `Hi ${firstName(client.name)}, this is ${STUDIO_NAME}.`,
    '',
    client.nextAppointment
      ? `We look forward to seeing you on ${formatDate(client.nextAppointment.date)} at ${client.nextAppointment.timeSlot} for your ${client.nextAppointment.serviceName}.`
      : 'We hope you are doing well. Reply here whenever you would like to book your next visit.'
  );
}
