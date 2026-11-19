import React, { useRef, useState, useCallback } from 'react'

/**
 * Card3DTilt
 * Adds physical 3D perspective tilt to dashboard cards, bento cells, and feature blocks.
 * Supports:
 * - Smooth cubic spring interpolation
 * - Dynamic light/glare reflection following the pointer
 * - Configurable max rotation degrees
 * - Preserve-3D layer depth for children with transform: translateZ(...)
 * - Graceful fallback on mobile touch devices
 */
export default function Card3DTilt({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  scale = 1.015,
  glare = true,
  glareOpacity = 0.12,
  style = {},
  onClick,
  ...props
}) {
  const cardRef = useRef(null)
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    glareShow: false,
    isHovered: false,
  })

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -maxTilt
      const rotateY = ((x - centerX) / centerX) * maxTilt

      const glareX = (x / rect.width) * 100
      const glareY = (y / rect.height) * 100

      setTransform({
        rotateX,
        rotateY,
        glareX,
        glareY,
        glareShow: true,
        isHovered: true,
      })
    },
    [maxTilt]
  )

  const handleMouseLeave = useCallback(() => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
      glareShow: false,
      isHovered: false,
    })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: `${perspective}px`,
        ...style,
      }}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      {...props}
    >
      <div
        className="w-full h-full relative will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: transform.isHovered
            ? `rotateX(${transform.rotateX.toFixed(2)}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`
            : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: transform.isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
      >
        {children}

        {/* Dynamic Specular Glare Reflection */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
            style={{
              opacity: transform.glareShow ? 1 : 0,
              zIndex: 30,
            }}
          >
            <div
              className="absolute w-full h-full"
              style={{
                background: `radial-gradient(circle 280px at ${transform.glareX}% ${transform.glareY}%, rgba(255,255,255,${glareOpacity}), transparent 70%)`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
