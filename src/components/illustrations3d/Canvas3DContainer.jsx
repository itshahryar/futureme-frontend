import React, { useEffect, useRef, useState } from 'react'

/**
 * Universal Three.js Canvas Container.
 * Handles:
 * - WebGL availability detection with seamless SVG fallback
 * - IntersectionObserver: pauses render loop when off-screen to save 100% GPU
 * - ResizeObserver: responsive resizing without canvas stretching
 * - Mouse & touch tracking with smooth damping
 * - Clean disposal of Three.js resources (geometries, materials, renderer)
 */

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

export default function Canvas3DContainer({
  className = '',
  initScene,
  fallback = null,
  interactive = true,
  cameraFov = 45,
  cameraNear = 0.1,
  cameraFar = 1000,
  defaultCameraPos = [0, 0, 5],
  onPointerMove,
  onClick,
  style = {},
}) {
  const containerRef = useRef(null)
  const [hasWebGL, setHasWebGL] = useState(true)
  const isVisibleRef = useRef(true)
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovering: false })
  const sceneStateRef = useRef(null)

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setHasWebGL(false)
      return
    }

    const container = containerRef.current
    if (!container) return

    let animationId = null
    let disposed = false
    let currentWidth = container.clientWidth || 300
    let currentHeight = container.clientHeight || 300

    // Dynamic import Three.js
    let THREE
    import('three').then((module) => {
      if (disposed) return
      THREE = module

      // Create Scene, Camera, Renderer
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        cameraFov,
        currentWidth / (currentHeight || 1),
        cameraNear,
        cameraFar
      )
      camera.position.set(...defaultCameraPos)

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setSize(currentWidth, currentHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1

      container.replaceChildren(renderer.domElement)

      // Lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
      scene.add(ambientLight)

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
      dirLight.position.set(5, 8, 6)
      scene.add(dirLight)

      const pointLight = new THREE.PointLight(0x6366f1, 1.5, 20)
      pointLight.position.set(-4, -2, 4)
      scene.add(pointLight)

      const fillLight = new THREE.DirectionalLight(0xa5b4fc, 0.6)
      fillLight.position.set(-5, -4, -4)
      scene.add(fillLight)

      // Call custom scene initializer
      let updateScene = null
      try {
        const sceneHook = initScene({
          THREE,
          scene,
          camera,
          renderer,
          container,
          mouse: mouseRef.current,
        })
        if (typeof sceneHook === 'function') {
          updateScene = sceneHook
        } else if (sceneHook && typeof sceneHook.update === 'function') {
          updateScene = sceneHook.update
        }
        sceneStateRef.current = sceneHook
      } catch (err) {
        console.warn('Canvas3D initScene error, falling back:', err)
        setHasWebGL(false)
        return
      }

      // Render loop
      let lastTime = performance.now()
      const animate = (time) => {
        if (disposed) return
        animationId = requestAnimationFrame(animate)

        if (!isVisibleRef.current) return

        const delta = Math.min((time - lastTime) / 1000, 0.1)
        lastTime = time

        // Smooth mouse damping
        const m = mouseRef.current
        m.x += (m.targetX - m.x) * 0.08
        m.y += (m.targetY - m.y) * 0.08

        if (updateScene) {
          updateScene({ time: time / 1000, delta, mouse: m, THREE, camera, scene, renderer })
        }

        renderer.render(scene, camera)
      }
      animationId = requestAnimationFrame(animate)

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || !entries[0]) return
        const entry = entries[0]
        const w = entry.contentRect.width
        const h = entry.contentRect.height
        if (w > 0 && h > 0) {
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }
      })
      resizeObserver.observe(container)

      // Intersection Observer (pause rendering when out of viewport)
      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting
        },
        { threshold: 0.05 }
      )
      intersectionObserver.observe(container)

      // Cleanup
      sceneStateRef.current = {
        dispose: () => {
          disposed = true
          if (animationId) cancelAnimationFrame(animationId)
          resizeObserver.disconnect()
          intersectionObserver.disconnect()

          // Dispose scene objects
          scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => mat.dispose())
              } else {
                obj.material.dispose()
              }
            }
          })
          renderer.dispose()
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement)
          }
        },
      }
    }).catch((err) => {
      console.warn('Failed to load Three.js, using fallback:', err)
      setHasWebGL(false)
    })

    return () => {
      disposed = true
      if (sceneStateRef.current && typeof sceneStateRef.current.dispose === 'function') {
        sceneStateRef.current.dispose()
      }
    }
  }, [cameraFov, cameraNear, cameraFar, defaultCameraPos, initScene])

  const handlePointerMove = (e) => {
    if (!interactive) return
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    // Normalized coordinates (-1 to 1)
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1)
    mouseRef.current.targetX = normX
    mouseRef.current.targetY = normY
    mouseRef.current.isHovering = true

    if (onPointerMove) onPointerMove(e, { normX, normY })
  }

  const handlePointerLeave = () => {
    mouseRef.current.targetX = 0
    mouseRef.current.targetY = 0
    mouseRef.current.isHovering = false
  }

  const handleClick = (e) => {
    if (onClick) onClick(e, mouseRef.current)
    if (sceneStateRef.current && typeof sceneStateRef.current.onClick === 'function') {
      sceneStateRef.current.onClick(e)
    }
  }

  if (!hasWebGL && fallback) {
    return <div className={`relative ${className}`} style={style}>{fallback}</div>
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      style={{ touchAction: 'none', ...style }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    />
  )
}
