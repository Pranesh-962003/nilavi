import React, { useState, useEffect } from 'react';

export default function Reviews({ reviews: initialReviews = [] }) {
  const [reviewsList, setReviewsList] = useState(initialReviews);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setReviewsList(data.data);
        }
      })
      .catch(() => {});
  }, []);

  if (!reviewsList || reviewsList.length === 0) {
    return null;
  }

  return (
    <section id="reviews">
      <div className="wrap">
        <div className="head">
          <div>
            <span className="section-eyebrow">Client Stories</span>
            <h2 className="rv">Kind <em>words</em></h2>
          </div>
          <p className="lead rv d1">From clients who keep coming back.</p>
        </div>

        <div className="quotes">
          {reviewsList.map((r, idx) => (
            <figure key={r.id || idx} className={`q ${r.featured ? 'feat' : ''} rv ${idx === 1 ? 'd1' : idx === 2 ? 'd2' : ''}`}>
              <div>
                <div className="stars">★★★★★</div>
                <blockquote>“{r.quote}”</blockquote>
              </div>
              <figcaption className="who">
                <span className="av">{r.avatarInitial || r.name?.[0] || 'N'}</span>
                <div>
                  <b>{r.name}</b>
                  <span>{r.service}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
