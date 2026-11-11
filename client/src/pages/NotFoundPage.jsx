import React from 'react';
import { Sparkles, ArrowLeft, Home, Scissors } from 'lucide-react';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="not-found-page-wrap">
      <div className="wrap">
        <div className="not-found-card">
          <div className="not-found-crest">
            <Sparkles size={32} />
          </div>
          <span className="not-found-code">404</span>
          <h1>Page Not Found</h1>
          <p>
            The page you are looking for may have been moved, renamed, or is temporarily unavailable.
          </p>

          <div className="not-found-actions">
            <button
              className="btn btn-gold"
              onClick={() => onNavigate('/')}
            >
              <Home size={15} />
              <span>Return to Homepage</span>
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('/services')}
            >
              <Scissors size={15} />
              <span>Explore Services</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

