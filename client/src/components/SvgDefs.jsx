import React from 'react';

export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2E7D0" />
          <stop offset=".45" stopColor="#D6BB83" />
          <stop offset=".75" stopColor="#B58A43" />
          <stop offset="1" stopColor="#9A742F" />
        </linearGradient>
        <linearGradient id="gPlum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B1F5C" />
          <stop offset=".6" stopColor="#735B88" />
          <stop offset="1" stopColor="#9A742F" />
        </linearGradient>
        <linearGradient id="gLilac" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FAF6ED" />
          <stop offset=".55" stopColor="#F2E7D0" />
          <stop offset="1" stopColor="#D6BB83" />
        </linearGradient>
        <linearGradient id="gChamp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FAF6ED" />
          <stop offset="1" stopColor="#D6BB83" />
        </linearGradient>
        <linearGradient id="gDeep" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#25211D" />
          <stop offset="1" stopColor="#3B1F5C" />
        </linearGradient>
        <radialGradient id="gGlow">
          <stop offset="0" stopColor="#D6BB83" stopOpacity=".6" />
          <stop offset="1" stopColor="#D6BB83" stopOpacity="0" />
        </radialGradient>
        <path id="star" d="M0-9 L2.4-2.4 L9 0 L2.4 2.4 L0 9 L-2.4 2.4 L-9 0 L-2.4-2.4Z" />
        <path id="cres" d="M20 -39 A44 44 0 1 0 20 39 A40 40 0 0 1 20 -39Z" />
        <g id="lotus">
          <g fill="url(#gGold)" stroke="#fff" strokeOpacity=".45" strokeWidth="1">
            <ellipse cx="0" cy="-42" rx="13" ry="42" transform="rotate(-72)" opacity=".7" />
            <ellipse cx="0" cy="-42" rx="13" ry="42" transform="rotate(72)" opacity=".7" />
            <ellipse cx="0" cy="-44" rx="14" ry="44" transform="rotate(-46)" opacity=".85" />
            <ellipse cx="0" cy="-44" rx="14" ry="44" transform="rotate(46)" opacity=".85" />
            <ellipse cx="0" cy="-46" rx="14" ry="46" transform="rotate(-22)" />
            <ellipse cx="0" cy="-46" rx="14" ry="46" transform="rotate(22)" />
            <ellipse cx="0" cy="-50" rx="14" ry="50" />
          </g>
        </g>

        <symbol id="s-bridal" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gPlum)" />
          <circle cx="150" cy="170" r="120" fill="url(#gGlow)" />
          <path d="M52 400V190a98 98 0 0 1 196 0V400" fill="none" stroke="url(#gGold)" strokeWidth="2.5" />
          <path d="M76 400V192a74 74 0 0 1 148 0V400" fill="none" stroke="#E9D296" strokeOpacity=".45" strokeWidth="1.5" />
          <use href="#cres" fill="url(#gGold)" transform="translate(150 165) scale(1.25) rotate(-25)" />
          <use href="#star" fill="#F4E2A8" transform="translate(88 96) scale(.8)" />
          <use href="#star" fill="#F4E2A8" transform="translate(214 118) scale(.6)" />
          <use href="#star" fill="#F4E2A8" transform="translate(190 62)" />
          <g fill="none" stroke="#E9D296" strokeOpacity=".5">
            <circle cx="150" cy="400" r="60" />
            <circle cx="150" cy="400" r="90" />
            <circle cx="150" cy="400" r="120" />
          </g>
          <use href="#lotus" transform="translate(150 372) scale(.9)" />
        </symbol>

        <symbol id="s-skin" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gLilac)" />
          <circle cx="150" cy="190" r="140" fill="url(#gGlow)" />
          <g fill="none" stroke="#A47C25" strokeOpacity=".55">
            <ellipse cx="150" cy="330" rx="62" ry="10" />
            <ellipse cx="150" cy="332" rx="100" ry="16" />
            <ellipse cx="150" cy="334" rx="140" ry="22" />
          </g>
          <use href="#lotus" transform="translate(150 322) scale(1.55)" />
          <g fill="#C9A24B">
            <circle cx="70" cy="120" r="6" />
            <circle cx="236" cy="96" r="9" opacity=".7" />
            <circle cx="206" cy="160" r="4" />
            <circle cx="96" cy="200" r="5" opacity=".6" />
          </g>
          <use href="#star" fill="#A47C25" transform="translate(238 210) scale(.7)" />
        </symbol>

        <symbol id="s-hair" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gDeep)" />
          <circle cx="210" cy="120" r="130" fill="url(#gGlow)" opacity=".55" />
          <g fill="none" stroke="url(#gGold)" strokeLinecap="round">
            <path d="M-20 60 C 80 150, 140 -10, 330 90" strokeWidth="3" />
            <path d="M-20 100 C 90 190, 150 30, 330 130" strokeWidth="2.2" opacity=".85" />
            <path d="M-20 140 C 80 230, 160 70, 330 170" strokeWidth="3.4" />
            <path d="M-20 185 C 100 270, 150 110, 330 215" strokeWidth="2" opacity=".8" />
            <path d="M-20 230 C 90 310, 160 150, 330 255" strokeWidth="3" />
            <path d="M-20 275 C 100 350, 150 200, 330 300" strokeWidth="2.2" opacity=".85" />
            <path d="M-20 320 C 80 390, 170 250, 330 345" strokeWidth="3.2" />
          </g>
          <use href="#star" fill="#F4E2A8" transform="translate(240 50)" />
          <use href="#star" fill="#F4E2A8" transform="translate(56 330) scale(.7)" />
        </symbol>

        <symbol id="s-nails" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gLilac)" />
          <circle cx="150" cy="200" r="150" fill="url(#gGlow)" />
          <g>
            <rect x="26" y="170" width="40" height="120" rx="20" fill="url(#gPlum)" />
            <rect x="76" y="120" width="42" height="150" rx="21" fill="url(#gGold)" />
            <rect x="128" y="96" width="44" height="170" rx="22" fill="url(#gPlum)" />
            <rect x="182" y="128" width="42" height="146" rx="21" fill="#fff" stroke="#B58A43" strokeWidth="2" />
            <rect x="234" y="180" width="40" height="112" rx="20" fill="url(#gGold)" />
          </g>
          <use href="#cres" fill="#F3E2AE" transform="translate(150 150) scale(.4) rotate(-20)" />
          <g fill="#F3E2AE">
            <circle cx="46" cy="210" r="3" />
            <circle cx="58" cy="236" r="2.2" />
            <circle cx="203" cy="170" r="3" />
            <circle cx="214" cy="198" r="2" />
          </g>
          <g fill="#C9A24B">
            <circle cx="97" cy="160" r="3" fill="#fff" />
            <circle cx="256" cy="220" r="3" fill="#fff" />
          </g>
        </symbol>

        <symbol id="s-smooth" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gChamp)" />
          <circle cx="80" cy="90" r="130" fill="url(#gGlow)" />
          <g fill="none" stroke="#3D1666" strokeLinecap="round" strokeWidth="2.2">
            <path d="M-10 40 C 70 10, 150 70, 320 30" opacity=".9" />
            <path d="M-10 80 C 70 50, 150 110, 320 70" opacity=".8" />
            <path d="M-10 120 C 70 90, 150 150, 320 110" opacity=".7" />
            <path d="M-10 160 C 70 130, 150 190, 320 150" opacity=".62" />
            <path d="M-10 200 C 70 170, 150 230, 320 190" opacity=".54" />
            <path d="M-10 240 C 70 210, 150 270, 320 230" opacity=".46" />
            <path d="M-10 280 C 70 250, 150 310, 320 270" opacity=".38" />
            <path d="M-10 320 C 70 290, 150 350, 320 310" opacity=".3" />
            <path d="M-10 360 C 70 330, 150 390, 320 350" opacity=".22" />
          </g>
        </symbol>

        <symbol id="s-glow" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gPlum)" />
          <circle cx="150" cy="200" r="180" fill="url(#gGlow)" />
          <circle cx="150" cy="200" r="78" fill="url(#gGold)" />
          <g fill="none" stroke="#F3E2AE" strokeOpacity=".5">
            <circle cx="150" cy="200" r="110" />
            <circle cx="150" cy="200" r="145" strokeOpacity=".3" />
          </g>
          <use href="#star" fill="#fff" transform="translate(60 80)" />
          <use href="#star" fill="#F4E2A8" transform="translate(240 120) scale(1.2)" />
          <use href="#star" fill="#fff" transform="translate(230 320) scale(.8)" />
          <use href="#star" fill="#F4E2A8" transform="translate(66 300) scale(.7)" />
        </symbol>

        <symbol id="s-cres" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gLilac)" />
          <use href="#cres" fill="url(#gDeep)" transform="translate(140 200) scale(3.1) rotate(-30)" />
          <g fill="#C9A24B">
            <circle cx="232" cy="96" r="5" />
            <circle cx="252" cy="150" r="3" />
            <circle cx="214" cy="60" r="3" />
            <circle cx="60" cy="340" r="4" />
          </g>
          <use href="#star" fill="#A47C25" transform="translate(236 280)" />
        </symbol>

        <symbol id="s-recep" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="400" fill="url(#gChamp)" />
          <circle cx="150" cy="150" r="140" fill="url(#gGlow)" />
          <g fill="url(#gPlum)">
            <path d="M10 400V230a52 52 0 0 1 104 0V400Z" />
            <path d="M98 400V190a52 52 0 0 1 104 0V400Z" opacity=".92" />
            <path d="M186 400V230a52 52 0 0 1 104 0V400Z" />
          </g>
          <path d="M0 70 Q150 150 300 70" fill="none" stroke="#8A651B" strokeOpacity=".6" />
          <g fill="#C9A24B">
            <circle cx="30" cy="90" r="4" />
            <circle cx="75" cy="112" r="4" />
            <circle cx="120" cy="126" r="4" />
            <circle cx="150" cy="128" r="4" />
            <circle cx="180" cy="126" r="4" />
            <circle cx="225" cy="112" r="4" />
            <circle cx="270" cy="90" r="4" />
          </g>
          <use href="#cres" fill="url(#gGold)" transform="translate(150 215) scale(.7) rotate(-20)" />
        </symbol>

        <symbol id="wa" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0v-1a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </symbol>
      </defs>
    </svg>
  );
}

