import React from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { generalEnquiryMessage, waLink } from '../lib/whatsapp';

export default function WhatsAppFab({ whatsappNumber = '919999999999' }) {
  const waHref = waLink(whatsappNumber, generalEnquiryMessage());

  return (
    <a
      className="fab"
      target="_blank"
      rel="noopener noreferrer"
      href={waHref}
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <WhatsAppIcon size={24} strokeWidth={1.85} />
    </a>
  );
}
