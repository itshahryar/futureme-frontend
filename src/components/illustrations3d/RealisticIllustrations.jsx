import React from 'react'

/**
 * Beautiful, Realistic, High-End Vector Illustrations
 * Crafted for FutureMe - Modern SaaS Aesthetic
 * Featuring realistic proportions, soft layered gradients, polished lighting, and elegant depth.
 */

/**
 * Realistic Student Hero Illustration
 * A modern, ambitious student/professional at a sleek desk with an ultrathin laptop,
 * coffee mug, ambient desk lamp glow, and floating career achievement accents.
 */
export function RealisticStudentHero({ className = 'w-48 h-48 sm:w-56 sm:h-56', size = 220 }) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`select-none drop-shadow-md transition-transform duration-500 hover:scale-[1.02] ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft Ambient Shadow */}
        <radialGradient id="deskShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* Natural Skin Tones */}
        <linearGradient id="skinTone" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FBD5C0" />
          <stop offset="1" stopColor="#F5BFA2" />
        </linearGradient>
        <linearGradient id="skinShadow" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F0AC88" />
          <stop offset="1" stopColor="#E59972" />
        </linearGradient>

        {/* Modern Hair Gradient */}
        <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#2A1B18" />
          <stop offset="0.7" stopColor="#1E1513" />
          <stop offset="1" stopColor="#110B0A" />
        </linearGradient>

        {/* Stylish Modern Clothing (Indigo Crewneck) */}
        <linearGradient id="sweaterGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366F1" />
          <stop offset="0.6" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>

        {/* Sleek Laptop Metallic Finish */}
        <linearGradient id="laptopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#E2E8F0" />
          <stop offset="0.5" stopColor="#CBD5E1" />
          <stop offset="1" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1E1B4B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.1" />
        </filter>
      </defs>

      {/* Desk Surface Shadow */}
      <ellipse cx="120" cy="216" rx="85" ry="14" fill="url(#deskShadow)" />

      {/* Sleek Desk Line */}
      <rect x="25" y="206" width="190" height="6" rx="3" fill="#E2E8F0" />
      <rect x="35" y="210" width="170" height="2" rx="1" fill="#CBD5E1" />

      {/* Coffee Mug on Desk */}
      <rect x="42" y="190" width="14" height="18" rx="3" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
      <path d="M56 194 Q62 198 56 204" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" fill="none" />
      <ellipse cx="49" cy="190" rx="7" ry="2" fill="#D97706" />
      {/* Steam Wisps */}
      <path d="M47 184 Q49 181 48 178" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M51 185 Q53 182 52 179" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

      {/* Realistic Student Body */}
      {/* Torso & Shoulders */}
      <path
        d="M84 158 Q120 150 156 158 L168 206 L72 206 Z"
        fill="url(#sweaterGrad)"
      />
      {/* Collar Detail */}
      <path
        d="M106 154 Q120 162 134 154 Q120 166 106 154 Z"
        fill="#3730A3"
      />
      <path
        d="M108 152 Q120 158 132 152"
        stroke="#818CF8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Arms & Hands typing on laptop */}
      <path
        d="M72 178 Q90 190 106 195 L102 202 Q84 196 68 184 Z"
        fill="#4338CA"
      />
      <path
        d="M168 178 Q150 190 134 195 L138 202 Q156 196 172 184 Z"
        fill="#4338CA"
      />
      {/* Hands */}
      <ellipse cx="106" cy="198" rx="6" ry="4" fill="url(#skinTone)" />
      <ellipse cx="134" cy="198" rx="6" ry="4" fill="url(#skinTone)" />

      {/* Neck */}
      <rect x="112" y="132" width="16" height="24" rx="4" fill="url(#skinShadow)" />
      <path d="M112 142 Q120 148 128 142" fill="url(#skinTone)" />

      {/* Head & Face */}
      <ellipse cx="120" cy="116" rx="20" ry="24" fill="url(#skinTone)" />
      {/* Soft Rosy Cheeks */}
      <circle cx="107" cy="122" r="3.5" fill="#F43F5E" opacity="0.25" />
      <circle cx="133" cy="122" r="3.5" fill="#F43F5E" opacity="0.25" />

      {/* Realistic Eyes with friendly catchlights */}
      <ellipse cx="111" cy="114" rx="2.8" ry="3.5" fill="#1E1513" />
      <circle cx="112" cy="113" r="1" fill="#FFFFFF" />
      <ellipse cx="129" cy="114" rx="2.8" ry="3.5" fill="#1E1513" />
      <circle cx="130" cy="113" r="1" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M106 108 Q111 106 116 108" stroke="#1E1513" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M124 108 Q129 106 134 108" stroke="#1E1513" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gentle Nose & Smile */}
      <path d="M120 114 L120 120 L122 121" stroke="#E59972" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114 127 Q120 131 126 127" stroke="#9A3412" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Ears */}
      <ellipse cx="99" cy="117" rx="3.5" ry="6" fill="url(#skinShadow)" />
      <ellipse cx="141" cy="117" rx="3.5" ry="6" fill="url(#skinShadow)" />

      {/* Modern Hairstyle (Layered crop with natural volume) */}
      <path
        d="M98 112 C96 90 112 80 122 80 C138 80 144 92 143 112 C141 104 137 98 128 97 C120 96 112 99 106 104 C102 107 100 110 98 112 Z"
        fill="url(#hairGrad)"
      />
      {/* Front bangs highlight */}
      <path
        d="M101 104 Q114 90 128 95 Q118 92 108 101 Z"
        fill="#3F2823"
        opacity="0.8"
      />

      {/* Ultrathin Modern Laptop (Silver / Slate) */}
      {/* Base */}
      <path
        d="M92 202 L148 202 L154 206 L86 206 Z"
        fill="url(#laptopGrad)"
        stroke="#64748B"
        strokeWidth="0.8"
      />
      {/* Trackpad */}
      <rect x="114" y="203" width="12" height="2" rx="0.5" fill="#94A3B8" />

      {/* Screen Display */}
      <rect
        x="96"
        y="166"
        width="48"
        height="35"
        rx="2.5"
        fill="url(#screenGrad)"
        stroke="#475569"
        strokeWidth="1.2"
      />
      {/* Glowing Screen Content: Code & Growth Analytics */}
      <rect x="100" y="171" width="16" height="3" rx="1" fill="#38BDF8" />
      <rect x="100" y="176" width="24" height="2" rx="0.8" fill="#818CF8" />
      <rect x="100" y="180" width="18" height="2" rx="0.8" fill="#A5B4FC" />
      <rect x="100" y="184" width="22" height="2" rx="0.8" fill="#34D399" />
      {/* Mini Bar Chart on screen */}
      <rect x="128" y="184" width="2.5" height="8" rx="0.8" fill="#F59E0B" />
      <rect x="132" y="180" width="2.5" height="12" rx="0.8" fill="#10B981" />
      <rect x="136" y="174" width="2.5" height="18" rx="0.8" fill="#6366F1" />

      {/* Floating Modern Achievement Badges (Glassmorphic) */}
      {/* Left Badge: Career Verified */}
      <g filter="url(#cardShadow)">
        <rect x="14" y="86" width="46" height="24" rx="7" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="1.2" />
        <circle cx="26" cy="98" r="5" fill="#10B981" />
        <path d="M24 98 L25.5 99.5 L28.5 96.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="34" y="94" width="20" height="3" rx="1" fill="#0F172A" />
        <rect x="34" y="99" width="14" height="2.5" rx="0.8" fill="#94A3B8" />
      </g>

      {/* Right Badge: 94% Match */}
      <g filter="url(#cardShadow)">
        <rect x="176" y="74" width="50" height="24" rx="7" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="1.2" />
        <circle cx="188" cy="86" r="5" fill="#4F46E5" />
        <path d="M188 83 L188 89 M185 86 L191 86" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <rect x="196" y="82" width="24" height="3" rx="1" fill="#0F172A" />
        <rect x="196" y="87" width="16" height="2.5" rx="0.8" fill="#10B981" />
      </g>

      {/* Elegant Floating Lightbulb Idea Spark */}
      <circle cx="120" cy="46" r="14" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1.5" />
      <path
        d="M115 44 C115 40 125 40 125 44 C125 48 122 50 122 52 L118 52 C118 50 115 48 115 44 Z"
        fill="#F59E0B"
      />
      <rect x="118.5" y="53" width="3" height="2" rx="0.5" fill="#D97706" />
      {/* Spark Lines */}
      <line x1="120" y1="26" x2="120" y2="29" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="134" y1="36" x2="131" y2="38" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="106" y1="36" x2="109" y2="38" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Realistic Career Mentor Illustration
 * Professional, encouraging guide with tablet and analytical insights
 */
export function RealisticMentorGuide({ className = 'w-32 h-32', size = 130 }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mentorJacket" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#1E293B" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <linearGradient id="mentorShirt" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#EEF2FF" />
          <stop offset="1" stopColor="#E0E7FF" />
        </linearGradient>
        <linearGradient id="mentorHair" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#475569" />
          <stop offset="1" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Shadow */}
      <ellipse cx="80" cy="150" rx="46" ry="7" fill="#0F172A" opacity="0.1" />

      {/* Shoulders & Blazer */}
      <path d="M42 120 Q80 110 118 120 L126 156 L34 156 Z" fill="url(#mentorJacket)" />
      {/* V-Neck & Shirt */}
      <path d="M68 114 L80 134 L92 114 Z" fill="url(#mentorShirt)" />
      <path d="M78 128 L80 156 L82 128 Z" fill="#6366F1" />

      {/* Neck */}
      <rect x="74" y="98" width="12" height="18" rx="3" fill="#F5BFA2" />

      {/* Head */}
      <ellipse cx="80" cy="82" rx="17" ry="20" fill="#FBD5C0" />
      {/* Cheeks */}
      <circle cx="71" cy="87" r="2.5" fill="#F43F5E" opacity="0.2" />
      <circle cx="89" cy="87" r="2.5" fill="#F43F5E" opacity="0.2" />

      {/* Eyes */}
      <ellipse cx="73" cy="81" rx="2.2" ry="2.8" fill="#1E293B" />
      <circle cx="74" cy="80" r="0.8" fill="#FFFFFF" />
      <ellipse cx="87" cy="81" rx="2.2" ry="2.8" fill="#1E293B" />
      <circle cx="88" cy="80" r="0.8" fill="#FFFFFF" />

      {/* Eyebrows */}
      <path d="M69 76 Q73 74 77 76" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M83 76 Q87 74 91 76" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" />

      {/* Glasses (Modern round frames) */}
      <circle cx="73" cy="81" r="6" stroke="#4F46E5" strokeWidth="1.2" fill="none" />
      <circle cx="87" cy="81" r="6" stroke="#4F46E5" strokeWidth="1.2" fill="none" />
      <line x1="79" y1="81" x2="81" y2="81" stroke="#4F46E5" strokeWidth="1.2" />

      {/* Smile */}
      <path d="M76 91 Q80 94 84 91" stroke="#9A3412" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Hair */}
      <path
        d="M63 78 C61 58 74 52 83 52 C95 52 99 62 97 78 C95 72 90 68 82 68 C76 68 70 71 63 78 Z"
        fill="url(#mentorHair)"
      />

      {/* Holding Digital Tablet */}
      <rect x="52" y="132" width="56" height="24" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1" />
      <rect x="56" y="135" width="48" height="18" rx="2" fill="#1E1B4B" />
      {/* Tablet Analytics */}
      <rect x="60" y="139" width="16" height="2" rx="0.5" fill="#38BDF8" />
      <rect x="60" y="143" width="22" height="2" rx="0.5" fill="#818CF8" />
      <circle cx="94" cy="144" r="4" fill="#10B981" />
      <path d="M92.5 144 L93.5 145 L95.5 143" stroke="#FFFFFF" strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Realistic Sculpted Trophy Mastery
 * Polished gold cup with realistic reflections, laurel branches, and pedestal
 */
export function RealisticTrophyMastery({ className = 'w-24 h-24 sm:w-28 sm:h-28', size = 110 }) {
  return (
    <svg
      viewBox="0 0 140 140"
      width={size}
      height={size}
      className={`select-none drop-shadow-md transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="realGold" x1="30" y1="20" x2="110" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.3" stopColor="#F59E0B" />
          <stop offset="0.8" stopColor="#D97706" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="pedestalGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#334155" />
          <stop offset="1" stopColor="#0F172A" />
        </linearGradient>
        <radialGradient id="trophyAmbient" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Warm Ambient Glow */}
      <ellipse cx="70" cy="126" rx="42" ry="8" fill="url(#trophyAmbient)" />

      {/* Pedestal Base */}
      <rect x="44" y="116" width="52" height="10" rx="3" fill="url(#pedestalGrad)" />
      <rect x="48" y="110" width="44" height="6" rx="2" fill="#475569" />
      {/* Plaque */}
      <rect x="56" y="117" width="28" height="6" rx="1.5" fill="#FCD34D" />

      {/* Stem */}
      <path d="M65 82 L75 82 L73 110 L67 110 Z" fill="#D97706" />
      <ellipse cx="70" cy="106" rx="9" ry="2.5" fill="#F59E0B" />

      {/* Handles */}
      <path
        d="M44 38 C26 38 22 62 44 72"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M96 38 C114 38 118 62 96 72"
        stroke="#F59E0B"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Main Cup */}
      <path
        d="M40 30 L100 30 C100 68 84 84 70 84 C56 84 40 68 40 30 Z"
        fill="url(#realGold)"
      />
      {/* Cup Rim Highlight */}
      <ellipse cx="70" cy="30" rx="30" ry="4" fill="#FEF3C7" opacity="0.6" />

      {/* Star of Excellence */}
      <path
        d="M70 42 L72.5 49 L80 49.5 L74.2 54 L76.5 61 L70 56.5 L63.5 61 L65.8 54 L60 49.5 L67.5 49 Z"
        fill="#FFFFFF"
        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
      />

      {/* Sparkling Stars */}
      <circle cx="28" cy="24" r="2.5" fill="#FDE047" />
      <circle cx="112" cy="26" r="3" fill="#FDE047" />
      <circle cx="70" cy="14" r="2" fill="#FDE047" />
    </svg>
  )
}

/**
 * Realistic Learning & Academic Milestone Stack
 * Hardcover textbooks, ribbon bookmark, diploma scroll
 */
export function RealisticLearningStack({ className = 'w-24 h-24 sm:w-28 sm:h-28', size = 110 }) {
  return (
    <svg
      viewBox="0 0 140 140"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bookBlue" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#312E81" />
          <stop offset="0.2" stopColor="#4338CA" />
          <stop offset="0.8" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="bookTeal" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#064E3B" />
          <stop offset="0.2" stopColor="#047857" />
          <stop offset="0.8" stopColor="#10B981" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
        <linearGradient id="scrollGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FFFBEB" />
          <stop offset="1" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="70" cy="126" rx="46" ry="7" fill="#0F172A" opacity="0.12" />

      {/* Bottom Book (Indigo) */}
      <rect x="24" y="98" width="92" height="18" rx="3" fill="url(#bookBlue)" />
      {/* Pages edge */}
      <rect x="28" y="101" width="84" height="12" rx="1.5" fill="#F8FAFC" />
      <line x1="32" y1="104" x2="108" y2="104" stroke="#E2E8F0" strokeWidth="0.8" />
      <line x1="32" y1="107" x2="108" y2="107" stroke="#E2E8F0" strokeWidth="0.8" />
      <line x1="32" y1="110" x2="108" y2="110" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Spine Left */}
      <rect x="22" y="98" width="6" height="18" rx="2" fill="#312E81" />

      {/* Middle Book (Emerald) */}
      <rect x="30" y="80" width="80" height="16" rx="3" fill="url(#bookTeal)" />
      <rect x="34" y="83" width="72" height="10" rx="1.5" fill="#F8FAFC" />
      <line x1="38" y1="86" x2="102" y2="86" stroke="#E2E8F0" strokeWidth="0.8" />
      <line x1="38" y1="89" x2="102" y2="89" stroke="#E2E8F0" strokeWidth="0.8" />
      {/* Ribbon Bookmark hanging down */}
      <path d="M90 84 L90 106 L94 103 L98 106 L98 84 Z" fill="#EF4444" />

      {/* Top Graduation Cap (Sleek Black with Golden Tassel) */}
      <path d="M70 42 L116 56 L70 70 L24 56 Z" fill="#1E1B4B" stroke="#0F172A" strokeWidth="1" />
      <rect x="52" y="66" width="36" height="12" rx="3" fill="#312E81" />
      {/* Button & Gold Tassel */}
      <circle cx="70" cy="56" r="3" fill="#F59E0B" />
      <path d="M70 56 Q88 62 94 76" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="91" y="76" width="6" height="10" rx="1" fill="#D97706" />
    </svg>
  )
}

/**
 * 3D Cartoon AI Companion Mentor Droid
 * Spherical pearlescent chassis, curved visor with happy cyan LED eyes,
 * golden pulse antenna, floating magnetic audio pods, and anti-gravity propulsion halo.
 */
export function MentorBot3D({ className = 'w-24 h-24', size = 96 }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="botChassis" cx="35%" cy="30%" r="65%">
          <stop stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#F1F5F9" />
          <stop offset="1" stopColor="#CBD5E1" />
        </radialGradient>
        <linearGradient id="botVisor" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#0F172A" />
          <stop offset="1" stopColor="#1E1B4B" />
        </linearGradient>
        <linearGradient id="haloCyan" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#38BDF8" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="1" stopColor="#38BDF8" stopOpacity="0.2" />
        </linearGradient>
        <radialGradient id="botShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0F172A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Floor Shadow */}
      <ellipse cx="60" cy="110" rx="34" ry="6" fill="url(#botShadow)" />

      {/* Anti-gravity Propulsion Halo */}
      <ellipse cx="60" cy="98" rx="22" ry="5" fill="none" stroke="url(#haloCyan)" strokeWidth="3" />
      <ellipse cx="60" cy="98" rx="14" ry="3" fill="#38BDF8" opacity="0.35" />

      {/* Antenna with golden pulse */}
      <line x1="60" y1="20" x2="60" y2="30" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="18" r="5" fill="#F59E0B" />
      <circle cx="60" cy="18" r="7" fill="#FDE68A" opacity="0.4" />

      {/* Main Spherical Chassis */}
      <circle cx="60" cy="60" r="36" fill="url(#botChassis)" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Left & Right Magnetic Floating Ears */}
      <rect x="18" y="48" width="6" height="24" rx="3" fill="#4F46E5" stroke="#3730A3" strokeWidth="1" />
      <circle cx="21" cy="60" r="1.5" fill="#38BDF8" />
      <rect x="96" y="48" width="6" height="24" rx="3" fill="#4F46E5" stroke="#3730A3" strokeWidth="1" />
      <circle cx="99" cy="60" r="1.5" fill="#38BDF8" />

      {/* Curved Deep Visor Screen */}
      <rect x="32" y="44" width="56" height="30" rx="12" fill="url(#botVisor)" stroke="#334155" strokeWidth="1.2" />
      {/* Visor Glare Reflection */}
      <path d="M38 48 Q60 45 82 48" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

      {/* Happy Expressive Animated Cyan Eyes (^  ^) */}
      <path d="M44 60 Q49 53 54 60" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M66 60 Q71 53 76 60" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Subtle Rosy Cheeks */}
      <circle cx="42" cy="65" r="2.5" fill="#F43F5E" opacity="0.4" />
      <circle cx="78" cy="65" r="2.5" fill="#F43F5E" opacity="0.4" />

      {/* Mini Floating Telemetry Card */}
      <g className="translate-y-[-2px]">
        <rect x="80" y="32" width="28" height="15" rx="4" fill="#FFFFFF" stroke="#E0E7FF" strokeWidth="1" />
        <rect x="84" y="36" width="12" height="2" rx="0.5" fill="#4F46E5" />
        <rect x="84" y="40" width="18" height="2" rx="0.5" fill="#10B981" />
        <circle cx="102" cy="37" r="1.5" fill="#10B981" />
      </g>
    </svg>
  )
}

/**
 * 3D Gyroscope Career Compass
 * Metallic gold outer ring, concentric indigo gimbal, and glowing central sapphire prism.
 */
export function CareerCompass3D({ className = 'w-20 h-20', size = 80 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldCompass" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="0.5" stopColor="#F59E0B" />
          <stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="indigoGimbal" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <radialGradient id="prismGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="1" stopColor="#0284C7" />
        </radialGradient>
      </defs>

      {/* Outer Golden Ring with Cardinal Ticks */}
      <circle cx="50" cy="50" r="42" stroke="url(#goldCompass)" strokeWidth="3" fill="#FFFFFF" fillOpacity="0.9" />
      <circle cx="50" cy="50" r="37" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 3" />

      {/* Cardinal Direction Ticks */}
      <line x1="50" y1="12" x2="50" y2="17" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="83" x2="50" y2="88" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="50" x2="17" y2="50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
      <line x1="83" y1="50" x2="88" y2="50" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

      {/* Inner Tilted Gimbal Ring */}
      <ellipse cx="50" cy="50" rx="28" ry="22" stroke="url(#indigoGimbal)" strokeWidth="2.5" transform="rotate(-25 50 50)" />

      {/* Glowing 3D Central Diamond Prism */}
      <path d="M50 26 L62 48 L50 74 L38 48 Z" fill="url(#prismGlow)" stroke="#0284C7" strokeWidth="1" />
      {/* Prism Facet */}
      <path d="M50 26 L62 48 L50 54 Z" fill="#7DD3FC" opacity="0.8" />
      <path d="M50 26 L38 48 L50 54 Z" fill="#0284C7" opacity="0.8" />
      <path d="M50 54 L62 48 L50 74 Z" fill="#0369A1" />
      <path d="M50 54 L38 48 L50 74 Z" fill="#0C4A6E" />

      {/* North Arrow Tip Highlight */}
      <circle cx="50" cy="26" r="3" fill="#F59E0B" />
      <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
    </svg>
  )
}

/**
 * 3D Cartoon Growth Rocket
 * Indigo fuselage, golden metallic fins, circular glowing viewport, and cartoon thruster flame.
 */
export function GrowthRocket3D({ className = 'w-16 h-16', size = 64 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="rocketBody" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#3730A3" />
        </linearGradient>
        <linearGradient id="rocketFin" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Smoke Clouds at Base */}
      <circle cx="26" cy="80" r="10" fill="#E2E8F0" opacity="0.7" />
      <circle cx="36" cy="85" r="8" fill="#CBD5E1" opacity="0.6" />

      {/* Flame */}
      <path d="M38 68 Q24 82 20 86 Q32 82 46 76 Z" fill="#EF4444" />
      <path d="M39 69 Q28 80 26 84 Q34 80 44 75 Z" fill="#F59E0B" />
      <path d="M40 70 Q32 77 31 80 Q36 78 43 74 Z" fill="#FEF08A" />

      {/* Rocket Fins */}
      <path d="M42 56 L30 68 L44 68 Z" fill="url(#rocketFin)" />
      <path d="M64 40 L76 52 L68 56 Z" fill="url(#rocketFin)" />

      {/* Fuselage (Tilted 45deg) */}
      <path
        d="M68 20 C76 28 80 42 70 54 L52 70 C40 60 46 44 54 36 Z"
        fill="url(#rocketBody)"
        stroke="#312E81"
        strokeWidth="1.2"
      />
      {/* Nosecone Gold Accent */}
      <path d="M68 20 C71 23 74 27 75 31 L63 37 C61 33 63 26 68 20 Z" fill="url(#rocketFin)" />

      {/* Circular Viewport */}
      <circle cx="60" cy="44" r="8" fill="#FFFFFF" stroke="#312E81" strokeWidth="1.5" />
      <circle cx="60" cy="44" r="6" fill="#38BDF8" />
      <path d="M57 41 Q61 40 64 42" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

/**
 * 3D Holographic Milestone Beacon
 * Glowing waypoint beacon with concentric neon energy rings and golden star marker.
 */
export function MilestoneBeacon3D({ className = 'w-16 h-16', size = 64 }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="beaconGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base Floor Rings */}
      <ellipse cx="40" cy="68" rx="28" ry="7" fill="url(#beaconGlow)" />
      <ellipse cx="40" cy="66" rx="22" ry="5.5" stroke="#818CF8" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx="40" cy="62" rx="16" ry="4" fill="#312E81" stroke="#4F46E5" strokeWidth="1" />

      {/* Upward Holographic Light Pillar */}
      <path d="M30 62 L36 30 L44 30 L50 62 Z" fill="#EEF2FF" opacity="0.6" />

      {/* Floating 3D Golden Milestone Star */}
      <path
        d="M40 18 L43 25 L50 25.5 L44.8 30 L46.8 37 L40 33 L33.2 37 L35.2 30 L30 25.5 L37 25 Z"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1"
        filter="drop-shadow(0 2px 4px rgba(245, 158, 11, 0.3))"
      />
      <circle cx="40" cy="27" r="2" fill="#FEF08A" />
    </svg>
  )
}

/**
 * 3D Skill Gap Benchmarking & Matrix Radar
 * Concentric isometric target grid, glowing connected capability nodes, and central target jewel.
 */
export function SkillMatrixRadar3D({ className = 'w-10 h-10', size = 40 }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="matrixGrid" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#6366F1" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
        <radialGradient id="matrixGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="40" cy="40" r="36" fill="url(#matrixGlow)" />

      {/* Outer Hexagonal Radar Ring */}
      <polygon
        points="40,8 70,24 70,56 40,72 10,56 10,24"
        stroke="#CBD5E1"
        strokeWidth="1.2"
        strokeDasharray="2 2"
        fill="#FFFFFF"
        fillOpacity="0.75"
      />

      {/* Middle Concentric Target Ring */}
      <polygon
        points="40,18 61,30 61,50 40,62 19,50 19,30"
        stroke="#818CF8"
        strokeWidth="1.4"
        fill="#EEF2FF"
        fillOpacity="0.6"
      />

      {/* Radar Axes */}
      <line x1="40" y1="8" x2="40" y2="72" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="10" y1="24" x2="70" y2="56" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="10" y1="56" x2="70" y2="24" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

      {/* Capability Polygon (Active Competency Map) */}
      <polygon
        points="40,22 58,34 50,52 35,55 24,38"
        fill="#6366F1"
        fillOpacity="0.35"
        stroke="#4F46E5"
        strokeWidth="1.8"
      />

      {/* Interactive 3D Skill Nodes */}
      <circle cx="40" cy="22" r="3.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="58" cy="34" r="3.5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="50" cy="52" r="3" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="35" cy="55" r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
      <circle cx="24" cy="38" r="3.5" fill="#6366F1" stroke="#FFFFFF" strokeWidth="1.2" />

      {/* Center Target Bullseye */}
      <circle cx="40" cy="40" r="2.5" fill="#4F46E5" />
    </svg>
  )
}

/**
 * 3D Winding Learning Roadmap Pathway
 * Curving 3D isometric curriculum ribbon with milestone flags and waypoint destination pin.
 * (Zero bot/companion elements - pure curriculum path)
 */
export function CurriculumRoadmap3D({ className = 'w-10 h-10', size = 40 }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={`select-none drop-shadow-sm transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="roadRibbon" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#818CF8" />
          <stop offset="0.5" stopColor="#6366F1" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
        <linearGradient id="flagGold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Floor Ambient Shadow */}
      <ellipse cx="40" cy="68" rx="30" ry="6" fill="#0F172A" opacity="0.1" />

      {/* 3D S-Curve Roadmap Highway Ribbon */}
      <path
        d="M12 65 C24 65 30 52 42 50 C54 48 58 35 68 25"
        stroke="url(#roadRibbon)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Dashed Center Guidance Line */}
      <path
        d="M14 65 C25 65 31 52 42 50 C53 48 57 35 66 25"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2.5 3"
        fill="none"
        opacity="0.85"
      />

      {/* Milestone Checkpoint 1 (Pin / Marker) */}
      <circle cx="24" cy="61" r="3" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />

      {/* Milestone Checkpoint 2 (Pin / Marker) */}
      <circle cx="42" cy="50" r="3.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.2" />

      {/* Destination Milestone Flag (Peak Checkpoint) */}
      <line x1="66" y1="12" x2="66" y2="28" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M66 12 L76 17 L66 22 Z" fill="url(#flagGold)" stroke="#D97706" strokeWidth="0.8" />
      <circle cx="66" cy="12" r="1.5" fill="#FDE68A" />

      {/* Floating Sparkle Stars */}
      <circle cx="20" cy="40" r="1.5" fill="#818CF8" />
      <circle cx="56" cy="20" r="1.5" fill="#C084FC" />
    </svg>
  )
}
