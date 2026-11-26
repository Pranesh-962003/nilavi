import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

// Signature Gold 4-Point Sparkle Star
function SparkleStar({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0C12 6.62742 6.62742 12 0 12C6.62742 12 12 17.3726 12 24C12 17.3726 17.3726 12 24 12C17.3726 12 12 6.62742 12 0Z"
        fill="url(#sparkleGoldGrad)"
      />
      <defs>
        <radialGradient
          id="sparkleGoldGrad"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(12 12) rotate(90) scale(12)"
        >
          <stop stopColor="#FFF2B2" />
          <stop offset="0.45" stopColor="#F9E076" />
          <stop offset="0.8" stopColor="#C59B3F" />
          <stop offset="1" stopColor="#8E6A1E" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Vector Professional Luxury Makeup Powder Brush
function LuxuryMakeupBrush() {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="nilavi-brush-cursor"
    >
      <defs>
        {/* Polished Gold Ferrule Gradient */}
        <linearGradient id="brushGoldFerrule" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="25%" stopColor="#F9E076" />
          <stop offset="50%" stopColor="#C59B3F" />
          <stop offset="75%" stopColor="#FFF2B2" />
          <stop offset="100%" stopColor="#8E6A1E" />
        </linearGradient>

        {/* Glossy Tapered Handle Gradient */}
        <linearGradient id="brushHandle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B1F5C" />
          <stop offset="35%" stopColor="#1E0A36" />
          <stop offset="70%" stopColor="#2D1150" />
          <stop offset="100%" stopColor="#170B24" />
        </linearGradient>

        {/* Soft Fluffy Ombre Bristle Gradient */}
        <linearGradient id="bristleGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#3E2723" />
          <stop offset="35%" stopColor="#6D4C41" />
          <stop offset="65%" stopColor="#A1887F" />
          <stop offset="85%" stopColor="#D7CCC8" />
          <stop offset="100%" stopColor="#F9E076" />
        </linearGradient>

        {/* Gold Powder Dust Highlights on Bristle Tips */}
        <radialGradient id="powderGlow" cx="20%" cy="20%" r="50%">
          <stop offset="0%" stopColor="#FFF6D1" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#F6E4A6" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>

        {/* Handle Metallic Sheen */}
        <linearGradient id="handleSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Long Sleek Handle */}
      <path
        d="M88 88 L142 142 C146 146 150 144 148 139 L108 80 Z"
        fill="url(#brushHandle)"
      />
      {/* Handle specular reflection */}
      <path
        d="M88 88 L138 138 C141 141 143 140 140 136 L94 82 Z"
        fill="url(#handleSheen)"
      />

      {/* Handle Gold Base Finial */}
      <circle cx="145" cy="142" r="3.5" fill="url(#brushGoldFerrule)" />

      {/* 2. Metallic Gold Ferrule with Crimped Rings */}
      <path
        d="M66 66 L86 86 C88 88 92 84 90 82 L70 62 C68 60 64 64 66 66 Z"
        fill="url(#brushGoldFerrule)"
        stroke="#6B4E12"
        strokeWidth="0.8"
      />
      {/* Ferrule Crimp Lines */}
      <line x1="72" y1="65" x2="84" y2="77" stroke="#6B4E12" strokeWidth="1" />
      <line x1="76" y1="69" x2="88" y2="81" stroke="#FFF2B2" strokeWidth="1" />

      {/* 3. Soft Fluffy Sculpted Powder Brush Bristles */}
      <path
        d="M66 62 
           C60 52 50 36 38 24 
           C30 16 20 18 16 26 
           C14 34 22 46 34 56 
           C44 64 56 70 68 70 
           Z"
        fill="url(#bristleGrad)"
        stroke="#8D6E63"
        strokeWidth="0.5"
      />

      {/* Inner bristle fiber volume curves */}
      <path
        d="M62 60 
           C54 48 44 32 32 24 
           C24 18 18 22 17 28 
           C16 34 26 48 38 58 
           Z"
        fill="url(#powderGlow)"
      />

      {/* Fine individual bristle lines */}
      <path
        d="M26 22 C36 32 48 48 58 58 M22 26 C30 36 42 50 52 62 M18 32 C26 40 38 54 46 64"
        stroke="#F6E4A6"
        strokeWidth="0.75"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M20 20 C24 28 34 42 44 52"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}

// Background Concentric Golden Arcs SVG (Warm Luxury Ivory & Gold Theme)
function GoldenArcs() {
  return (
    <div className="nilavi-preloader-arcs" aria-hidden="true">
      <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="warmArcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C59B3F" stopOpacity="0.28" />
            <stop offset="50%" stopColor="#E3C678" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#8E6A1E" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="warmArcGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F6E4A6" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#C59B3F" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#6B4E12" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle
          cx="300"
          cy="300"
          r="260"
          stroke="url(#warmArcGrad1)"
          strokeWidth="1.2"
          strokeDasharray="40 18 8 18 120 24"
        />
        <circle
          cx="300"
          cy="300"
          r="210"
          stroke="url(#warmArcGrad2)"
          strokeWidth="1"
          strokeDasharray="80 30 15 30"
        />
        <circle
          cx="300"
          cy="300"
          r="160"
          stroke="url(#warmArcGrad1)"
          strokeWidth="0.8"
          strokeDasharray="6 12 24 12"
        />
        <circle
          cx="300"
          cy="300"
          r="110"
          stroke="url(#warmArcGrad2)"
          strokeWidth="0.7"
          strokeDasharray="4 8"
        />
      </svg>
    </div>
  );
}

// Ambient Background Dust Particles
const DUST_PARTICLES = [
  { id: 1, top: '15%', left: '20%', size: 3.5, delay: '0s', duration: '4.8s' },
  { id: 2, top: '22%', left: '78%', size: 3, delay: '1.2s', duration: '5.4s' },
  { id: 3, top: '38%', left: '12%', size: 2.2, delay: '2.1s', duration: '4.2s' },
  { id: 4, top: '45%', left: '86%', size: 4, delay: '0.6s', duration: '6.0s' },
  { id: 5, top: '65%', left: '18%', size: 2.5, delay: '3.0s', duration: '5.1s' },
  { id: 6, top: '75%', left: '72%', size: 3.5, delay: '1.8s', duration: '4.5s' },
  { id: 7, top: '82%', left: '28%', size: 2.8, delay: '0.4s', duration: '5.8s' },
  { id: 8, top: '88%', left: '60%', size: 2.2, delay: '2.5s', duration: '4.7s' },
  { id: 9, top: '28%', left: '35%', size: 2.5, delay: '1.5s', duration: '5.2s' },
  { id: 10, top: '32%', left: '65%', size: 3.2, delay: '0.9s', duration: '4.9s' },
  { id: 11, top: '70%', left: '42%', size: 2, delay: '2.8s', duration: '5.5s' },
  { id: 12, top: '60%', left: '80%', size: 2.8, delay: '1.1s', duration: '4.4s' }
];

export default function LoadingScreen({
  isLoading = true,
  logoSrc = '/nilavi-gold-brand.png'
}) {
  const [isMounted, setIsMounted] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
      }, 480);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(true);
      setIsFadingOut(false);
    }
  }, [isLoading]);

  if (!isMounted) return null;

  return (
    <div
      className={`nilavi-preloader-overlay ${isFadingOut ? 'fade-out' : ''}`}
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* Background Concentric Golden Arc Lines */}
      <GoldenArcs />

      {/* Ambient Floating Background Dust Particles */}
      <div className="nilavi-dust-container" aria-hidden="true">
        {DUST_PARTICLES.map((p) => (
          <span
            key={p.id}
            className="nilavi-dust-particle"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration
            }}
          />
        ))}
      </div>

      {/* Central Stage */}
      <div className="nilavi-preloader-stage">
        {/* Soft Ambient Golden Aura */}
        <div className="nilavi-logo-ambient-glow" aria-hidden="true" />

        {/* Logo Reveal Container */}
        <div className="nilavi-logo-reveal-wrapper">
          <img
            src={logoSrc || '/nilavi-gold-brand.png'}
            alt=""
            className="nilavi-preloader-logo"
            onError={(e) => {
              if (e.target.src !== '/nilavi-gold-logo.png' && e.target.src !== '/favicon.png') {
                e.target.src = '/nilavi-gold-logo.png';
              }
            }}
          />

          {/* Sweeping Track */}
          <div className="nilavi-brush-sweeper" aria-hidden="true">
            {/* Active Scattered Powder Dust Burst System */}
            <div className="nilavi-powder-scatter-zone">
              {/* Soft billowing powder puff cloud */}
              <div className="nilavi-brush-powder-cloud" />

              {/* Scattered gold powder flecks bursting behind bristles */}
              <span className="nilavi-scatter-fleck fleck-1" />
              <span className="nilavi-scatter-fleck fleck-2" />
              <span className="nilavi-scatter-fleck fleck-3" />
              <span className="nilavi-scatter-fleck fleck-4" />
              <span className="nilavi-scatter-fleck fleck-5" />
              <span className="nilavi-scatter-fleck fleck-6" />
              <span className="nilavi-scatter-fleck fleck-7" />
              <span className="nilavi-scatter-fleck fleck-8" />

              {/* Center Twinkling Sparkle Star */}
              <SparkleStar className="nilavi-brush-sparkle" />
            </div>

            {/* Natural Hand Brushing Wiggle Container */}
            <div className="nilavi-brush-wiggler">
              <LuxuryMakeupBrush />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
