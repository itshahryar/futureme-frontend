import React from 'react'

/**
 * Floating3DObject
 * Adds smooth continuous floating, levitation, or bobbing animation to icons, badges, or 3D cards.
 * Uses hardware-accelerated CSS keyframe transforms with configurable delay, duration, and amplitude.
 */
export default function Floating3DObject({
  children,
  className = '',
  duration = 4,
  delay = 0,
  amplitude = 8,
  rotate = 3,
  style = {},
}) {
  return (
    <div
      className={`inline-block will-change-transform ${className}`}
      style={{
        animation: `floatKeyframes ${duration}s ease-in-out ${delay}s infinite alternate`,
        '--float-amp': `${amplitude}px`,
        '--float-rot': `${rotate}deg`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
