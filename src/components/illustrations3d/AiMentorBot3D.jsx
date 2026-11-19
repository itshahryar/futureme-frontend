import React, { useCallback, useRef } from 'react'
import Canvas3DContainer from './Canvas3DContainer'
import { SvgAiBot } from './SvgFallbacks'

/**
 * AiMentorBot3D
 * An interactive, charming 3D AI companion droid.
 * - Spherical aerodynamic chassis with pearlescent material
 * - Expressive visor eyes that track mouse coordinates
 * - Floating magnetic audio/sensor pods
 * - Bottom anti-gravity propulsion halo
 * - Bouncy interactive nod on click
 */
export default function AiMentorBot3D({
  className = 'w-36 h-36 sm:w-44 sm:h-44',
  size = 160,
  interactive = true,
  mood = 'happy', // 'happy' | 'thinking' | 'celebrate'
}) {
  const nodRef = useRef({ nodding: false, startTime: 0 })

  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.2)

    const botGroup = new THREE.Group()
    scene.add(botGroup)

    // Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.15,
      metalness: 0.25,
    })
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.3,
      metalness: 0.5,
    })
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.9,
    })
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
    })
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.75,
    })

    // 1. Main Spherical Head/Body
    const sphereGeo = new THREE.SphereGeometry(1.0, 36, 32)
    const mainSphere = new THREE.Mesh(sphereGeo, chassisMat)
    botGroup.add(mainSphere)

    // 2. Visor Screen Cavity
    const screenGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.42, 32, 1, false, -Math.PI / 2.3, Math.PI * 0.85)
    const screenMesh = new THREE.Mesh(screenGeo, screenMat)
    screenMesh.rotation.x = Math.PI / 2
    screenMesh.position.set(0, 0.05, 0.6)
    botGroup.add(screenMesh)

    // 3. Digital AI Eyes (Cyan glowing capsules)
    const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16)
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat)
    leftEye.scale.set(1, 1.4, 0.5)
    leftEye.position.set(-0.25, 0.06, 0.95)
    botGroup.add(leftEye)

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat)
    rightEye.scale.set(1, 1.4, 0.5)
    rightEye.position.set(0.25, 0.06, 0.95)
    botGroup.add(rightEye)

    // 4. Floating Magnetic Ear Pods (Left & Right)
    const podGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.38, 20)
    const leftPod = new THREE.Mesh(podGeo, accentMat)
    leftPod.rotation.z = Math.PI / 2
    leftPod.position.set(-1.22, 0, 0)
    botGroup.add(leftPod)

    const rightPod = new THREE.Mesh(podGeo, accentMat)
    rightPod.rotation.z = -Math.PI / 2
    rightPod.position.set(1.22, 0, 0)
    botGroup.add(rightPod)

    // 5. Antenna on Top
    const antennaStem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.35, 12), accentMat)
    antennaStem.position.set(0, 1.15, 0)
    botGroup.add(antennaStem)

    const antennaOrb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), eyeMat)
    antennaOrb.position.set(0, 1.35, 0)
    botGroup.add(antennaOrb)

    // 6. Anti-gravity Propulsion Ring (Bottom Halo)
    const haloGeo = new THREE.TorusGeometry(0.55, 0.05, 16, 32)
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    haloMesh.rotation.x = Math.PI / 2
    haloMesh.position.set(0, -1.05, 0)
    botGroup.add(haloMesh)

    // Update hook
    return {
      update: ({ time, mouse }) => {
        // Floating levitation
        let yPos = Math.sin(time * 2.5) * 0.1

        // Interactive nod
        const nod = nodRef.current
        if (nod.nodding) {
          const progress = (time - nod.startTime) * 5
          if (progress < Math.PI * 2) {
            yPos += Math.sin(progress) * 0.25
            botGroup.rotation.x = Math.sin(progress) * 0.3
          } else {
            nod.nodding = false
          }
        } else {
          // Track mouse with smooth tilt
          botGroup.rotation.y = mouse.x * 0.45
          botGroup.rotation.x = -mouse.y * 0.35
        }

        botGroup.position.y = yPos

        // Eye tracking
        leftEye.position.x = -0.25 + mouse.x * 0.08
        leftEye.position.y = 0.06 - mouse.y * 0.06
        rightEye.position.x = 0.25 + mouse.x * 0.08
        rightEye.position.y = 0.06 - mouse.y * 0.06

        // Pod gentle floating oscillation
        leftPod.position.y = Math.sin(time * 3 + 1) * 0.06
        rightPod.position.y = Math.sin(time * 3 + 2.5) * 0.06

        // Halo energy pulse
        haloMesh.scale.setScalar(1 + Math.sin(time * 8) * 0.08)
        haloMat.opacity = 0.6 + Math.sin(time * 8) * 0.25
      },
      onClick: () => {
        nodRef.current = { nodding: true, startTime: performance.now() / 1000 }
      },
    }
  }, [])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<SvgAiBot size={size} />}
    />
  )
}
