import React, { useCallback } from 'react'
import Canvas3DContainer from './Canvas3DContainer'

/**
 * SkillGalaxy3D
 * An interactive 3D skill constellation representing interconnected competencies.
 * Features:
 * - Floating crystalline skill nodes (polyhedra)
 * - Dynamic connecting laser web
 * - Reacts to cursor proximity with gentle rotation
 */
export default function SkillGalaxy3D({
  className = 'w-36 h-36 sm:w-44 sm:h-44',
  interactive = true,
}) {
  const handleSceneInit = useCallback(({ THREE, scene, camera }) => {
    camera.position.set(0, 0, 4.6)

    const galaxyGroup = new THREE.Group()
    scene.add(galaxyGroup)

    const colors = [0x4f46e5, 0x06b6d4, 0x10b981, 0xf59e0b, 0xec4899]
    const nodeCount = 9
    const nodes = []
    const nodeCoords = []

    for (let i = 0; i < nodeCount; i++) {
      const col = colors[i % colors.length]
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.2,
        metalness: 0.6,
        emissive: col,
        emissiveIntensity: 0.25,
      })
      const geo = i % 2 === 0 ? new THREE.OctahedronGeometry(0.18) : new THREE.DodecahedronGeometry(0.15)
      const mesh = new THREE.Mesh(geo, mat)

      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      const r = 1.35
      const x = r * Math.cos(theta) * Math.sin(phi)
      const y = r * Math.sin(theta) * Math.sin(phi)
      const z = r * Math.cos(phi)

      mesh.position.set(x, y, z)
      galaxyGroup.add(mesh)
      nodes.push({ mesh, baseX: x, baseY: y, baseZ: z, phase: Math.random() * Math.PI })
      nodeCoords.push(new THREE.Vector3(x, y, z))
    }

    // Connecting lines between nodes
    const lineIndices = [
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 0,
      0, 3, 1, 5, 2, 7, 4, 8,
    ]
    const linePoints = []
    for (let i = 0; i < lineIndices.length; i += 2) {
      linePoints.push(nodeCoords[lineIndices[i]], nodeCoords[lineIndices[i + 1]])
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.45,
    })
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat)
    galaxyGroup.add(lineMesh)

    return {
      update: ({ time, mouse }) => {
        galaxyGroup.rotation.y = time * 0.4 + mouse.x * 0.4
        galaxyGroup.rotation.x = Math.sin(time * 0.3) * 0.2 - mouse.y * 0.3

        nodes.forEach((n, idx) => {
          n.mesh.rotation.x += 0.02
          n.mesh.rotation.y += 0.03
          const pulse = 1 + Math.sin(time * 2.5 + n.phase) * 0.15
          n.mesh.scale.setScalar(pulse)
        })
      },
    }
  }, [])

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={
        <div className="flex items-center justify-center w-full h-full text-indigo-500">
          <svg viewBox="0 0 100 100" className="w-24 h-24 animate-pulse">
            <polygon points="50,15 80,35 80,65 50,85 20,65 20,35" stroke="#4F46E5" strokeWidth="2" fill="none" />
            <circle cx="50" cy="15" r="4" fill="#38BDF8" />
            <circle cx="80" cy="35" r="4" fill="#818CF8" />
            <circle cx="80" cy="65" r="4" fill="#F59E0B" />
            <circle cx="50" cy="85" r="4" fill="#10B981" />
            <circle cx="20" cy="65" r="4" fill="#EC4899" />
            <circle cx="20" cy="35" r="4" fill="#6366F1" />
          </svg>
        </div>
      }
    />
  )
}
