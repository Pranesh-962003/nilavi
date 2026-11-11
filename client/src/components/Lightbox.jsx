import React, { useEffect } from 'react';

export default function Lightbox({ items, currentIndex, onClose, onNavigate }) {
  const currentItem = items[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + items.length) % items.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % items.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  if (!currentItem) return null;

  return (
    <div
      className="lb open"
      id="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image"
      onClick={(e) => {
        if (e.target.id === 'lb') onClose();
      }}
    >
      <button className="x" id="lbX" aria-label="Close" onClick={onClose}>
        ✕
      </button>

      <button
        className="pv"
        id="lbP"
        aria-label="Previous image"
        onClick={() => onNavigate((currentIndex - 1 + items.length) % items.length)}
      >
        ←
      </button>

      <div className="lb-card" id="lbCard">
        <div className="art">
          <img
            src={currentItem.image}
            alt={currentItem.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="cap">
          {currentItem.title}
          <small>{currentItem.subtitle}</small>
        </div>
      </div>

      <button
        className="nx"
        id="lbN"
        aria-label="Next image"
        onClick={() => onNavigate((currentIndex + 1) % items.length)}
      >
        →
      </button>
    </div>
  );
}
