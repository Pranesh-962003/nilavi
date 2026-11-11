import React from 'react';

export default function Marquee() {
  const items = [
    'Signature facials',
    'Hair colour and spa',
    'Bridal makeup',
    'Gel nails and nail art',
    'Keratin smoothing',
    'Threading and waxing',
    'Hydra glow'
  ];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {items.map((it, idx) => (
          <span key={`m1-${idx}`}>{it}</span>
        ))}
        {items.map((it, idx) => (
          <span key={`m2-${idx}`}>{it}</span>
        ))}
      </div>
    </div>
  );
}

