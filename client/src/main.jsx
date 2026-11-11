import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './grand.css';
import './admin.css';

// Automatically route relative /api requests to external backend if VITE_API_URL is set
const apiBase = import.meta.env.VITE_API_URL;
if (apiBase && typeof window !== 'undefined') {
  const rawFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api')) {
      input = `${apiBase.replace(/\/+$/, '')}${input}`;
    }
    return rawFetch(input, init);
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

