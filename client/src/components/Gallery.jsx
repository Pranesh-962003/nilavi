import React, { useState, useMemo } from 'react';
import Lightbox from './Lightbox';

export default function Gallery({ galleryImages }) {
  const [filter, setFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const defaultTiles = [
    {
      id: 1,
      cat: 'bridal',
      title: 'Bridal glow',
      subtitle: 'Makeup and skin prep',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
      classes: 'tile arch-t tall'
    },
    {
      id: 2,
      cat: 'skin',
      title: 'Hydra glow facial',
      subtitle: 'Skin care',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      classes: 'tile'
    },
    {
      id: 3,
      cat: 'hair',
      title: 'Colour melt & styling',
      subtitle: 'Hair care',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      classes: 'tile'
    },
    {
      id: 4,
      cat: 'nails',
      title: 'Gold fleck gel set',
      subtitle: 'Nail artistry',
      image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80',
      classes: 'tile arch-t tall'
    },
    {
      id: 5,
      cat: 'hair',
      title: 'Keratin smoothing & spa',
      subtitle: 'Hair care',
      image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1000&q=80',
      classes: 'tile wide'
    },
    {
      id: 6,
      cat: 'skin',
      title: 'Brightening botanical facial',
      subtitle: 'Skin care',
      image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      classes: 'tile'
    },
    {
      id: 7,
      cat: 'nails',
      title: 'Luxury french manicure',
      subtitle: 'Nail artistry',
      image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80',
      classes: 'tile'
    },
    {
      id: 8,
      cat: 'bridal',
      title: 'Reception makeup & draping',
      subtitle: 'Bridal artistry',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
      classes: 'tile wide'
    }
  ];

  const tiles = (galleryImages && galleryImages.length > 0) ? galleryImages : defaultTiles;

  const visibleTiles = tiles.filter(t => filter === 'all' || t.cat === filter);

  const openLightbox = (indexInVisible) => {
    setLightboxIndex(indexInVisible);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const galleryCategories = useMemo(() => {
    const set = new Set(['all']);
    tiles.forEach(t => {
      if (t.cat) set.add(t.cat.toLowerCase().trim());
    });
    return Array.from(set);
  }, [tiles]);

  return (
    <section className="gallery" id="gallery">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="section-eyebrow">Studio Portfolio</span>
            <h2 className="rv">Recent <em>work</em></h2>
          </div>
          <p className="lead rv d1">
            Real client transformations in facials, hair colour, manicures, and bridal looks from our studio.
          </p>
        </div>

        <div className="filters rv" role="group" aria-label="Filter gallery">
          {galleryCategories.map((cat) => (
            <button
              key={cat}
              className="chipf"
              aria-pressed={filter === cat}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid" id="grid">
          {visibleTiles.map((t, idx) => (
            <button
              key={t.id}
              className={t.classes}
              aria-label={t.title}
              onClick={() => openLightbox(idx)}
            >
              <span className="art">
                <img
                  src={t.image}
                  alt={t.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </span>
              <span className="cap">
                {t.title}
                <small>{t.subtitle}</small>
              </span>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={visibleTiles}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
}
