import React, { useCallback } from 'react'
import Canvas3DContainer from './Canvas3DContainer'
import { SvgCareerCompass } from './SvgFallbacks'

/**
 * CareerCompass3D
 * Gyroscopic 3D navigation compass symbolizing career direction, milestones, and progress.
 * Features:
 * - Nested concentric gimbal rings with metallic reflections
 * - Glowing directional diamond core
 * - Orbiting planetary satellite nodes
 * - Smooth rotation responsive to cursor parallax
 */
export default function CareerCompass3D({
  className = 'w-36 h-36 sm:w-44 sm:h-44',
  size = 160,
  interactive = true,
}) {
  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.4)

    const masterGroup = new THREE.Group()
    scene.add(masterGroup)

    // Materials
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      metalness: 0.8,
      roughness: 0.2,
    })
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      metalness: 0.7,
      roughness: 0.25,
    })
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      metalness: 0.3,
      roughness: 0.1,
      emissive: 0x0891b2,
      emissiveIntensity: 0.5,
    })
    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      metalness: 0.4,
      roughness: 0.2,
      emissive: 0xe11d48,
      emissiveIntensity: 0.4,
    })
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.2,
    })

    // Outer Gyroscope Ring
    const outerTorus = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.05, 16, 64), outerRingMat)
    masterGroup.add(outerTorus)

    // Middle Gyroscope Ring
    const middleTorus = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.045, 16, 64), innerRingMat)
    masterGroup.add(middleTorus)

    // Inner Gyroscope Ring
    const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 16, 64), outerRingMat)
    masterGroup.add(innerTorus)

    // Central Compass Core (Diamond / Octahedron pointer)
    const pointerNorth = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 4), rubyMat)
    pointerNorth.position.y = 0.4
    masterGroup.add(pointerNorth)

    const pointerSouth = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.8, 4), crystalMat)
    pointerSouth.rotation.x = Math.PI
    pointerSouth.position.y = -0.4
    masterGroup.add(pointerSouth)

    const centerGem = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22), goldMat)
    masterGroup.add(centerGem)

    // Satellite Nodes orbiting the compass
    const satelliteGroup = new THREE.Group()
    scene.add(satelliteGroup)

    const sat1 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), crystalMat)
    satelliteGroup.add(sat1)

    const sat2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), goldMat)
    satelliteGroup.add(sat2)

    return {
      update: ({ time, mouse }) => {
        // Gyroscope ring rotations
        outerTorus.rotation.x = Math.sin(time * 0.8) * 0.35 + mouse.y * 0.4
        outerTorus.rotation.y = time * 0.5 + mouse.x * 0.5

        middleTorus.rotation.y = Math.cos(time * 0.7) * 0.4 + mouse.x * 0.4
        middleTorus.rotation.z = time * 0.7 + mouse.y * 0.3

        innerTorus.rotation.x = time * 0.9
        innerTorus.rotation.z = Math.sin(time) * 0.3

        // Center pointer wobble & float
        const coreBob = Math.sin(time * 3) * 0.06
        pointerNorth.position.y = 0.4 + coreBob
        pointerSouth.position.y = -0.4 + coreBob
        centerGem.position.y = coreBob
        centerGem.rotation.y = time * 1.5

        // Satellite orbits
        const orbR1 = 1.6
        sat1.position.set(Math.cos(time * 1.8) * orbR1, Math.sin(time * 2.2) * 0.5, Math.sin(time * 1.8) * orbR1)

        const orbR2 = 1.5
        sat2.position.set(Math.cos(time * 1.4 + 2) * orbR2, Math.cos(time * 1.7) * 0.4, Math.sin(time * 1.4 + 2) * orbR2)
        sat2.rotation.x += 0.02
        sat2.rotation.y += 0.03

        // Global parallax
        masterGroup.rotation.x = -mouse.y * 0.35
        masterGroup.rotation.y = mouse.x * 0.45
      },
    }
  }, [])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<SvgCareerCompass size={size} />}
    />
  )
}
