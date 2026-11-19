import React, { useCallback } from 'react'
import Canvas3DContainer from './Canvas3DContainer'
import { SvgTrophyMastery } from './SvgFallbacks'
import confetti from 'canvas-confetti'

/**
 * TrophyMastery3D
 * Celebratory 3D achievement trophy for quiz completions, milestones, and high scores.
 * Features:
 * - Lustrous golden chalice with handles and pedestal
 * - Floating orbiting victory laurel rings
 * - Sparkling victory dust
 * - Interactive click: triggers multi-colored confetti burst!
 */
export default function TrophyMastery3D({
  className = 'w-32 h-32 sm:w-40 sm:h-40',
  size = 140,
  interactive = true,
  autoConfetti = false,
}) {
  const triggerConfetti = useCallback(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#38BDF8', '#F59E0B', '#10B981', '#EC4899'],
      })
    } catch {
      // safe fallback
    }
  }, [])

  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.3)

    const trophyGroup = new THREE.Group()
    scene.add(trophyGroup)

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.18,
      emissive: 0xd97706,
      emissiveIntensity: 0.15,
    })
    const darkWoodMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.3,
      roughness: 0.6,
    })
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xfffbeb,
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.1,
    })
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfcd34d,
      transparent: true,
      opacity: 0.7,
    })

    // 1. Base pedestal
    const baseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.3, 24), darkWoodMat)
    baseMesh.position.y = -1.15
    trophyGroup.add(baseMesh)

    // 2. Stem
    const stemMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.5, 20), goldMat)
    stemMesh.position.y = -0.75
    trophyGroup.add(stemMesh)

    // 3. Cup Chalice
    const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.3, 1.0, 28, 1, false), goldMat)
    cupMesh.position.y = -0.05
    trophyGroup.add(cupMesh)

    // Rim
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.06, 16, 32), goldMat)
    rimMesh.rotation.x = Math.PI / 2
    rimMesh.position.y = 0.45
    trophyGroup.add(rimMesh)

    // 4. Handles (Left and Right)
    const handleL = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 12, 24, Math.PI), goldMat)
    handleL.position.set(-0.75, -0.05, 0)
    handleL.rotation.z = Math.PI / 2
    trophyGroup.add(handleL)

    const handleR = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 12, 24, Math.PI), goldMat)
    handleR.position.set(0.75, -0.05, 0)
    handleR.rotation.z = -Math.PI / 2
    trophyGroup.add(handleR)

    // 5. Star on front of cup
    const starMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), starMat)
    starMesh.position.set(0, -0.05, 0.6)
    trophyGroup.add(starMesh)

    // 6. Halo ring
    const haloTorus = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.025, 16, 48), ringMat)
    haloTorus.rotation.x = Math.PI / 3
    trophyGroup.add(haloTorus)

    return {
      update: ({ time, mouse }) => {
        trophyGroup.position.y = Math.sin(time * 2.4) * 0.08
        trophyGroup.rotation.y = time * 0.6 + mouse.x * 0.4
        trophyGroup.rotation.x = -mouse.y * 0.2

        starMesh.rotation.y += 0.03
        starMesh.rotation.z += 0.02

        haloTorus.rotation.z = time * 0.8
        haloTorus.rotation.y = Math.sin(time) * 0.2
      },
      onClick: () => {
        triggerConfetti()
      },
    }
  }, [triggerConfetti])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<SvgTrophyMastery size={size} />}
    />
  )
}
