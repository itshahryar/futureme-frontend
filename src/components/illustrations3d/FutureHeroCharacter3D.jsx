import React, { useCallback, useRef } from 'react'
import Canvas3DContainer from './Canvas3DContainer'
import { SvgHeroExplorer } from './SvgFallbacks'

/**
 * FutureHeroCharacter3D
 * Modern 3D illustrative character: A student tech explorer with cute proportions,
 * glowing visor, jetpack, and orbiting career glyphs.
 * - Tracks mouse pointer with smooth head/torso tilt
 * - Idle floating / levitation animation
 * - Bouncy reaction + celebratory sparkles on click
 * - Optimized Three.js geometry with MeshStandardMaterial & ACES tone mapping
 */
export default function FutureHeroCharacter3D({
  className = 'w-44 h-44 sm:w-52 sm:h-52',
  size = 200,
  interactive = true,
}) {
  const jumpStateRef = useRef({ jumping: false, jumpStart: 0 })

  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.8)

    // Master character group
    const charGroup = new THREE.Group()
    scene.add(charGroup)

    // Materials with soft cartoon / SaaS aesthetic
    const suitMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.35,
      metalness: 0.15,
    })
    const helmetMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.1,
    })
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.85,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45,
    })
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.7,
      emissive: 0xd97706,
      emissiveIntensity: 0.2,
    })
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.5,
      metalness: 0.2,
    })
    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    })

    // 1. Torso
    const torsoGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.9, 24)
    const torso = new THREE.Mesh(torsoGeo, suitMat)
    torso.position.y = -0.35
    charGroup.add(torso)

    // Chest badge
    const badgeGeo = new THREE.BoxGeometry(0.4, 0.22, 0.1)
    const badge = new THREE.Mesh(badgeGeo, darkMat)
    badge.position.set(0, -0.25, 0.5)
    charGroup.add(badge)

    const badgeLight = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), cyanGlowMat)
    badgeLight.position.set(0.1, -0.25, 0.55)
    charGroup.add(badgeLight)

    // 2. Head / Helmet Group (rotates towards cursor)
    const headGroup = new THREE.Group()
    headGroup.position.y = 0.55
    charGroup.add(headGroup)

    const helmetGeo = new THREE.SphereGeometry(0.72, 32, 28)
    const helmet = new THREE.Mesh(helmetGeo, helmetMat)
    headGroup.add(helmet)

    // Visor
    const visorGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.38, 28, 1, false, -Math.PI / 2.5, Math.PI * 0.8)
    const visor = new THREE.Mesh(visorGeo, visorMat)
    visor.rotation.x = Math.PI / 2
    visor.position.set(0, 0.05, 0.38)
    headGroup.add(visor)

    // Eyes (cute glowing cyan ellipses inside visor)
    const eyeGeo = new THREE.SphereGeometry(0.065, 16, 16)
    const eyeL = new THREE.Mesh(eyeGeo, cyanGlowMat)
    eyeL.scale.set(1, 1.4, 0.6)
    eyeL.position.set(-0.16, 0.05, 0.68)
    headGroup.add(eyeL)

    const eyeR = new THREE.Mesh(eyeGeo, cyanGlowMat)
    eyeR.scale.set(1, 1.4, 0.6)
    eyeR.position.set(0.16, 0.05, 0.68)
    headGroup.add(eyeR)

    // Explorer Cap / Star Antenna
    const capGeo = new THREE.ConeGeometry(0.35, 0.18, 4)
    const cap = new THREE.Mesh(capGeo, goldMat)
    cap.rotation.y = Math.PI / 4
    cap.position.y = 0.78
    headGroup.add(cap)

    const tasselGeo = new THREE.SphereGeometry(0.06, 12, 12)
    const tassel = new THREE.Mesh(tasselGeo, goldMat)
    tassel.position.set(0.25, 0.72, 0)
    headGroup.add(tassel)

    // 3. Backpack / Tech Thruster
    const packGeo = new THREE.BoxGeometry(0.7, 0.75, 0.35)
    const pack = new THREE.Mesh(packGeo, darkMat)
    pack.position.set(0, -0.3, -0.45)
    charGroup.add(pack)

    // Thruster nozzles
    const thrusterGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.22, 16)
    const thrusterL = new THREE.Mesh(thrusterGeo, suitMat)
    thrusterL.position.set(-0.22, -0.72, -0.42)
    charGroup.add(thrusterL)

    const thrusterR = new THREE.Mesh(thrusterGeo, suitMat)
    thrusterR.position.set(0.22, -0.72, -0.42)
    charGroup.add(thrusterR)

    // Thruster glow flames
    const flameGeo = new THREE.ConeGeometry(0.09, 0.3, 16)
    const flameL = new THREE.Mesh(flameGeo, cyanGlowMat)
    flameL.rotation.x = Math.PI
    flameL.position.set(-0.22, -0.92, -0.42)
    charGroup.add(flameL)

    const flameR = new THREE.Mesh(flameGeo, cyanGlowMat)
    flameR.rotation.x = Math.PI
    flameR.position.set(0.22, -0.92, -0.42)
    charGroup.add(flameR)

    // 4. Orbiting Career Badges / Glyphs
    const orbitGroup = new THREE.Group()
    scene.add(orbitGroup)

    const badge1 = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), goldMat)
    orbitGroup.add(badge1)

    const badge2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15), suitMat)
    orbitGroup.add(badge2)

    const badge3 = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14), cyanGlowMat)
    orbitGroup.add(badge3)

    // 5. Star Dust Sparkle Particles
    const sparkleCount = 28
    const sparkleGeo = new THREE.BufferGeometry()
    const sparklePositions = new Float32Array(sparkleCount * 3)
    for (let i = 0; i < sparkleCount * 3; i += 3) {
      sparklePositions[i] = (Math.random() - 0.5) * 4
      sparklePositions[i + 1] = (Math.random() - 0.5) * 3
      sparklePositions[i + 2] = (Math.random() - 0.5) * 2
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3))
    const sparkleMat = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
    })
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat)
    scene.add(sparkles)

    // Animation loop update hook
    return {
      update: ({ time, mouse }) => {
        // Idle floating sine wave
        let yOffset = Math.sin(time * 2.2) * 0.12

        // Jump physics when clicked
        const jump = jumpStateRef.current
        if (jump.jumping) {
          const jumpProgress = (time - jump.jumpStart) * 3.5
          if (jumpProgress < Math.PI) {
            yOffset += Math.sin(jumpProgress) * 0.45
            charGroup.rotation.z = Math.sin(jumpProgress) * 0.15
          } else {
            jump.jumping = false
            charGroup.rotation.z = 0
          }
        }

        charGroup.position.y = yOffset

        // Smooth head & torso tracking towards mouse
        headGroup.rotation.y = mouse.x * 0.55
        headGroup.rotation.x = -mouse.y * 0.35
        charGroup.rotation.y = mouse.x * 0.25
        charGroup.rotation.x = -mouse.y * 0.12

        // Thruster flame flicker
        const flameScale = 0.8 + Math.sin(time * 16) * 0.3
        flameL.scale.set(1, flameScale, 1)
        flameR.scale.set(1, flameScale, 1)

        // Orbiting badges
        const r = 1.45
        badge1.position.set(Math.cos(time * 1.5) * r, Math.sin(time * 2) * 0.35 + 0.2, Math.sin(time * 1.5) * (r * 0.6))
        badge1.rotation.y += 0.02
        badge1.rotation.x += 0.015

        badge2.position.set(Math.cos(time * 1.5 + 2.1) * r, Math.sin(time * 1.8 + 1) * 0.35 - 0.1, Math.sin(time * 1.5 + 2.1) * (r * 0.6))
        badge2.rotation.y += 0.025
        badge2.rotation.z += 0.015

        badge3.position.set(Math.cos(time * 1.5 + 4.2) * r, Math.sin(time * 2.2 + 2) * 0.35 + 0.1, Math.sin(time * 1.5 + 4.2) * (r * 0.6))
        badge3.rotation.x += 0.03

        // Sparkles gentle rotation
        sparkles.rotation.y = time * 0.05
      },
      onClick: () => {
        jumpStateRef.current = { jumping: true, jumpStart: performance.now() / 1000 }
      },
    }
  }, [])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<SvgHeroExplorer size={size} />}
    />
  )
}
