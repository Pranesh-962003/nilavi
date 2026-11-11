import React from 'react';

export default function Ritual() {
  return (
    <section className="ritual" id="ritual">
      <div className="wrap">
        <div className="head is-centered">
          <div>
            <span className="section-eyebrow is-centered">Four Unhurried Steps</span>
            <h2 className="rv">The நிலவி <em>ritual</em></h2>
            <p className="lead rv d1">
              Every visit is thoughtful and personalized, designed for relaxation and noticeable results.
            </p>
          </div>
        </div>

        <div className="phases">
          <div className="phase rv">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="#FAF6ED" stroke="#B58A43" strokeWidth="1.5" />
              {/* Consultation / Listen icon */}
              <circle cx="50" cy="40" r="14" fill="none" stroke="#735B88" strokeWidth="2.5" />
              <path d="M26 78 C28 62, 72 62, 74 78" fill="none" stroke="#735B88" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h3>Listen</h3>
            <p>Ten quiet minutes to examine your skin, your hair goals, and your wellness preferences.</p>
          </div>

          <div className="phase rv d1">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="#FAF6ED" stroke="#B58A43" strokeWidth="1.5" />
              {/* Botanical Cleanse / Drop icon */}
              <path d="M50 24 C50 24, 30 52, 30 64 A20 20 0 0 0 70 64 C70 52, 50 24, 50 24 Z" fill="url(#gGold)" />
            </svg>
            <h3>Prepare</h3>
            <p>A gentle botanical cleanse and skin patch check, with fresh sterilized kits prepared before you.</p>
          </div>

          <div className="phase rv d2">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="#FAF6ED" stroke="#B58A43" strokeWidth="1.5" />
              {/* Care & Treat icon */}
              <circle cx="50" cy="50" r="22" fill="url(#gGold)" opacity="0.4" />
              <path d="M34 50 L45 61 L66 38" fill="none" stroke="#29251F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3>Treat</h3>
            <p>Your personalized beauty therapy, performed at an unhurried pace by a certified specialist.</p>
          </div>

          <div className="phase rv d3">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="42" fill="url(#gGold)" />
              {/* Radiance / Glow starburst */}
              <path d="M50 20 L53 43 L76 50 L53 57 L50 80 L47 57 L24 50 L47 43 Z" fill="#29251F" />
            </svg>
            <h3>Glow</h3>
            <p>A customized home aftercare routine and hydration tips so your skin and hair stay radiant.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
