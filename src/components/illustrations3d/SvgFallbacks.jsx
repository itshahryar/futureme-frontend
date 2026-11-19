import React from 'react'

/**
 * High-definition, beautifully styled SVG 3D illustrative fallbacks.
 * Designed with layered isometric perspective, glossy gradients,
 * drop shadows, and subtle ambient hover effects.
 */

export function SvgHeroExplorer({ className = 'w-48 h-48', size = 180 }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bodyGrad" x1="40" y1="50" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" />
          <stop offset="0.5" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="visorGrad" x1="70" y1="60" x2="130" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="0.6" stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FCD34D" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="glowLight" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <radialGradient id="shadowRad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Floating Ambient Shadow */}
      <ellipse cx="100" cy="180" rx="55" ry="12" fill="url(#shadowRad)" />

      {/* Orbiting Career Sparks */}
      <circle cx="36" cy="74" r="4" fill="#38BDF8" filter="url(#glowLight)" />
      <circle cx="168" cy="62" r="5" fill="#FCD34D" filter="url(#glowLight)" />
      <circle cx="160" cy="142" r="3.5" fill="#A855F7" filter="url(#glowLight)" />

      {/* Backpack & Thrusters */}
      <rect x="70" y="102" width="60" height="42" rx="14" fill="#1E1B4B" />
      <rect x="74" y="138" width="16" height="12" rx="4" fill="#4338CA" />
      <rect x="110" y="138" width="16" height="12" rx="4" fill="#4338CA" />
      {/* Thruster Flames */}
      <ellipse cx="82" cy="154" rx="4" ry="7" fill="#38BDF8" opacity="0.8" />
      <ellipse cx="118" cy="154" rx="4" ry="7" fill="#38BDF8" opacity="0.8" />

      {/* Explorer Torso / Suit */}
      <rect x="68" y="92" width="64" height="58" rx="20" fill="url(#bodyGrad)" />
      {/* Chest Badge / Tech Emblem */}
      <rect x="88" y="104" width="24" height="14" rx="5" fill="#1E1B4B" />
      <circle cx="95" cy="111" r="3" fill="#10B981" />
      <circle cx="105" cy="111" r="3" fill="#38BDF8" />

      {/* Explorer Helmet */}
      <circle cx="100" cy="68" r="38" fill="#EEF2FF" stroke="#C7D2FE" strokeWidth="3" />
      {/* Glowing Visor */}
      <rect x="74" y="52" width="52" height="32" rx="16" fill="url(#visorGrad)" filter="url(#glowLight)" />
      {/* Visor Glare Reflection */}
      <path
        d="M80 58 Q100 54 116 62 Q100 60 84 66 Z"
        fill="#FFFFFF"
        opacity="0.7"
      />
      {/* Friendly Eye Glows */}
      <ellipse cx="90" cy="67" rx="3.5" ry="4" fill="#FFFFFF" />
      <ellipse cx="110" cy="67" rx="3.5" ry="4" fill="#FFFFFF" />

      {/* Graduation Cap / Tech Antenna on top */}
      <path d="M100 24 L126 34 L100 44 L74 34 Z" fill="url(#goldGrad)" />
      <rect x="98" y="34" width="4" height="8" fill="#D97706" />
      <path d="M126 34 L128 48" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="128" cy="50" r="2.5" fill="#F59E0B" />
    </svg>
  )
}

export function SvgAiBot({ className = 'w-36 h-36', size = 140 }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:rotate-2 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="botSphere" x1="30" y1="30" x2="130" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#E0E7FF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="botScreen" x1="45" y1="55" x2="115" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <radialGradient id="botGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="80" cy="148" rx="42" ry="9" fill="url(#botGlow)" />

      {/* Floating Magnetic Side Pods (Ears) */}
      <ellipse cx="26" cy="76" rx="8" ry="14" fill="#6366F1" />
      <circle cx="26" cy="76" r="4" fill="#A5B4FC" />
      <ellipse cx="134" cy="76" rx="8" ry="14" fill="#6366F1" />
      <circle cx="134" cy="76" r="4" fill="#A5B4FC" />

      {/* Top Antenna */}
      <path d="M80 34 L80 18" stroke="#4F46E5" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="80" cy="14" r="5" fill="#38BDF8" />

      {/* Main Spherical Body */}
      <circle cx="80" cy="78" r="46" fill="url(#botSphere)" stroke="#E0E7FF" strokeWidth="2" />

      {/* Face Screen */}
      <rect x="48" y="58" width="64" height="38" rx="14" fill="url(#botScreen)" />

      {/* Expressive AI Cyan Eyes */}
      <circle cx="67" cy="76" r="5.5" fill="#38BDF8" />
      <circle cx="68" cy="74.5" r="1.8" fill="#FFFFFF" />
      <circle cx="93" cy="76" r="5.5" fill="#38BDF8" />
      <circle cx="94" cy="74.5" r="1.8" fill="#FFFFFF" />

      {/* Gentle Smiling Arc */}
      <path d="M75 86 Q80 89 85 86" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />

      {/* Thruster Glow Ring */}
      <ellipse cx="80" cy="120" rx="16" ry="4" fill="#6366F1" opacity="0.7" />
      <ellipse cx="80" cy="122" rx="10" ry="2.5" fill="#38BDF8" />
    </svg>
  )
}

export function SvgCareerCompass({ className = 'w-36 h-36', size = 140 }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={`select-none transition-transform duration-500 hover:rotate-12 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ringGrad" x1="20" y1="20" x2="140" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="0.5" stopColor="#818CF8" />
          <stop offset="1" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="needleNorth" x1="80" y1="30" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F43F5E" />
          <stop offset="1" stopColor="#E11D48" />
        </linearGradient>
        <linearGradient id="needleSouth" x1="80" y1="80" x2="80" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CBD5E1" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      {/* Outer Dial */}
      <circle cx="80" cy="80" r="62" stroke="url(#ringGrad)" strokeWidth="5" strokeDasharray="6 3" />
      <circle cx="80" cy="80" r="52" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />

      {/* Compass Tick Marks */}
      <line x1="80" y1="32" x2="80" y2="40" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
      <line x1="80" y1="120" x2="80" y2="128" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="80" x2="40" y2="80" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="80" x2="128" y2="80" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

      {/* North Needle */}
      <path d="M80 34 L88 78 L80 84 L72 78 Z" fill="url(#needleNorth)" />
      {/* South Needle */}
      <path d="M80 126 L88 82 L80 84 L72 82 Z" fill="url(#needleSouth)" />

      {/* Center Pivot Gem */}
      <circle cx="80" cy="80" r="9" fill="#1E1B4B" />
      <circle cx="80" cy="80" r="5" fill="#38BDF8" />
      <circle cx="81.5" cy="78.5" r="1.5" fill="#FFFFFF" />

      {/* Orbiting Satellite Star */}
      <circle cx="128" cy="42" r="5" fill="#FCD34D" />
      <circle cx="34" cy="118" r="4" fill="#818CF8" />
    </svg>
  )
}

export function SvgTrophyMastery({ className = 'w-32 h-32', size = 120 }) {
  return (
    <svg
      viewBox="0 0 140 140"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:scale-110 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldCup" x1="30" y1="20" x2="110" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" />
          <stop offset="0.4" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="trophyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow */}
      <ellipse cx="70" cy="124" rx="36" ry="8" fill="url(#trophyGlow)" />

      {/* Handles */}
      <path
        d="M44 38 C28 38 24 58 42 66"
        stroke="#F59E0B"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M96 38 C112 38 116 58 98 66"
        stroke="#F59E0B"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Cup Base & Stem */}
      <rect x="52" y="108" width="36" height="14" rx="4" fill="#78350F" />
      <rect x="56" y="100" width="28" height="10" rx="3" fill="#D97706" />
      <path d="M64 78 L76 78 L74 102 L66 102 Z" fill="#F59E0B" />

      {/* Main Cup */}
      <path
        d="M40 32 L100 32 C100 66 84 80 70 80 C56 80 40 66 40 32 Z"
        fill="url(#goldCup)"
      />

      {/* Star Emblem */}
      <path
        d="M70 44 L72.5 50.5 L79.5 51 L74 55.5 L76 62.5 L70 58.5 L64 62.5 L66 55.5 L60.5 51 L67.5 50.5 Z"
        fill="#FFFFFF"
      />

      {/* Sparkles */}
      <circle cx="32" cy="24" r="3" fill="#FDE047" />
      <circle cx="108" cy="28" r="3.5" fill="#FDE047" />
    </svg>
  )
}

export function SvgRocketLaunch({ className = 'w-36 h-36', size = 140 }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={`select-none transition-transform duration-300 hover:-translate-y-1 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rocketBody" x1="60" y1="20" x2="110" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#C7D2FE" />
        </linearGradient>
        <linearGradient id="coneGrad" x1="60" y1="15" x2="100" y2="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="80" y1="108" x2="80" y2="152" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FCD34D" />
          <stop offset="0.4" stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Exhaust Flame */}
      <path d="M72 108 Q80 152 80 152 Q80 152 88 108 Z" fill="url(#flameGrad)" />
      <ellipse cx="80" cy="116" rx="4" ry="12" fill="#FEF08A" />

      {/* Fins */}
      <path d="M58 84 L42 108 L62 104 Z" fill="#4F46E5" />
      <path d="M102 84 L118 108 L98 104 Z" fill="#4F46E5" />

      {/* Main Rocket Body */}
      <path
        d="M62 44 C62 44 60 76 60 102 L100 102 C100 76 98 44 98 44 Z"
        fill="url(#rocketBody)"
      />

      {/* Rocket Nose Cone */}
      <path d="M62 44 Q80 14 98 44 Z" fill="url(#coneGrad)" />

      {/* Porthole Glass */}
      <circle cx="80" cy="62" r="12" fill="#1E1B4B" />
      <circle cx="80" cy="62" r="9" fill="#38BDF8" />
      <circle cx="83" cy="59" r="2.5" fill="#FFFFFF" />

      {/* Clouds / Smoke Base */}
      <circle cx="48" cy="142" r="14" fill="#E2E8F0" opacity="0.8" />
      <circle cx="112" cy="142" r="14" fill="#E2E8F0" opacity="0.8" />
      <circle cx="80" cy="146" r="12" fill="#CBD5E1" opacity="0.9" />
    </svg>
  )
}
