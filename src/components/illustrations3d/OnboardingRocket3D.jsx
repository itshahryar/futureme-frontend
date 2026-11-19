import React, { useCallback, useRef } from 'react'
import Canvas3DContainer from './Canvas3DContainer'
import { SvgRocketLaunch } from './SvgFallbacks'

/**
 * OnboardingRocket3D
 * Playful 3D cartoon rocket representing the launch of a student's career journey.
 * Features:
 * - Aerodynamic fuselage with red nose cone and stabilizing wings
 * - Reflective porthole window with glowing cyan glass
 * - Dynamic thruster exhaust flame with particle sparks
 * - Click interaction: lift-off rocket boost!
 */
export default function OnboardingRocket3D({
  className = 'w-36 h-36 sm:w-44 sm:h-44',
  size = 160,
  interactive = true,
}) {
  const boostRef = useRef({ boosting: false, boostTime: 0 })

  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.4)

    const rocketGroup = new THREE.Group()
    scene.add(rocketGroup)

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    })
    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.2,
    })
    const indigoMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.3,
      metalness: 0.3,
    })
    const cyanPortholeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
    })
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
    })

    // 1. Fuselage (Body cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.52, 0.52, 1.3, 24)
    const bodyMesh = new THREE.Mesh(bodyGeo, whiteMat)
    bodyMesh.position.y = -0.1
    rocketGroup.add(bodyMesh)

    // 2. Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.52, 0.85, 24)
    const noseMesh = new THREE.Mesh(noseGeo, redMat)
    noseMesh.position.y = 0.98
    rocketGroup.add(noseMesh)

    // 3. Porthole Window
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 16, 24), indigoMat)
    rimMesh.position.set(0, 0.15, 0.52)
    rocketGroup.add(rimMesh)

    const glassMesh = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), cyanPortholeMat)
    glassMesh.position.set(0, 0.15, 0.53)
    rocketGroup.add(glassMesh)

    // 4. Fins / Wings (3 around base)
    const finShape = new THREE.Shape()
    finShape.moveTo(0, 0)
    finShape.lineTo(0.55, -0.6)
    finShape.lineTo(0, -0.4)
    finShape.closePath()

    const finExtrudeSettings = { depth: 0.06, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 }
    const finGeo = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings)

    // Fin Left
    const finL = new THREE.Mesh(finGeo, indigoMat)
    finL.position.set(-0.5, -0.3, 0)
    finL.rotation.y = Math.PI
    rocketGroup.add(finL)

    // Fin Right
    const finR = new THREE.Mesh(finGeo, indigoMat)
    finR.position.set(0.5, -0.3, 0)
    rocketGroup.add(finR)

    // 5. Exhaust Nozzle & Flame
    const nozzleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.32, 0.25, 16), indigoMat)
    nozzleMesh.position.y = -0.85
    rocketGroup.add(nozzleMesh)

    const flameMesh = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 16), flameMat)
    flameMesh.rotation.x = Math.PI
    flameMesh.position.y = -1.3
    rocketGroup.add(flameMesh)

    return {
      update: ({ time, mouse }) => {
        let yPos = Math.sin(time * 2.8) * 0.12
        let zTilt = Math.sin(time * 1.5) * 0.08

        // Boost on click
        const boost = boostRef.current
        if (boost.boosting) {
          const progress = (time - boost.boostTime) * 4
          if (progress < Math.PI * 2) {
            yPos += Math.sin(progress) * 0.4
            zTilt += Math.sin(progress * 2) * 0.15
          } else {
            boost.boosting = false
          }
        }

        rocketGroup.position.y = yPos
        rocketGroup.rotation.z = zTilt + mouse.x * 0.2
        rocketGroup.rotation.x = -mouse.y * 0.25
        rocketGroup.rotation.y = mouse.x * 0.35

        // Flame jitter
        const flameScale = 0.8 + Math.sin(time * 22) * 0.35
        flameMesh.scale.set(1, flameScale, 1)
      },
      onClick: () => {
        boostRef.current = { boosting: true, boostTime: performance.now() / 1000 }
      },
    }
  }, [])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<SvgRocketLaunch size={size} />}
    />
  )
}
