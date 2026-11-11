import React, { useState, useEffect } from 'react';

export default function Reviews({ reviews: initialReviews = [] }) {
  const defaultReviews = [
    {
      id: 'rev-1',
      name: 'Priya R.',
      service: 'Signature facial',
      quote: 'I came in for a facial before my sister\'s wedding and left with a skincare plan I still follow. It felt like being looked after, not sold to.',
      avatarInitial: 'P',
      featured: true
    },
    {
      id: 'rev-2',
      name: 'Meera S.',
      service: 'Hair colour',
      quote: 'My hair colour turned out exactly like the photo I brought. Calm studio, spotless tools.',
      avatarInitial: 'M',
      featured: false
    },
    {
      id: 'rev-3',
      name: 'Anjali K.',
      service: 'Bridal makeup',
      quote: 'The bridal trial took the stress away. On the day, I looked like myself, only lit from within.',
      avatarInitial: 'A',
      featured: false
    }
  ];

  const [reviewsList, setReviewsList] = useState(initialReviews.length > 0 ? initialReviews : defaultReviews);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setReviewsList(data.data);
        }
      })
      .catch(() => {});
  }, []);

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
