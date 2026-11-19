import React, { useCallback } from 'react'
import Canvas3DContainer from './Canvas3DContainer'

/**
 * Interactive3DScene
 * Ambient, subtle 3D floating geometric field for page headers, hero sections, and auth pages.
 * Renders floating pastel polyhedra with soft reflections and cursor parallax.
 */
export default function Interactive3DScene({
  className = 'absolute inset-0 pointer-events-none opacity-40',
  count = 14,
  interactive = true,
}) {
  const handleSceneInit = useCallback(
    ({ THREE, scene, camera }) => {
      camera.position.set(0, 0, 7)

      const shapesGroup = new THREE.Group()
      scene.add(shapesGroup)

      const materials = [
        new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.3, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0xc084fc, roughness: 0.3, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.2, metalness: 0.5 }),
      ]

      const geometries = [
        new THREE.IcosahedronGeometry(0.35),
        new THREE.OctahedronGeometry(0.3),
        new THREE.TorusGeometry(0.32, 0.08, 12, 24),
        new THREE.BoxGeometry(0.38, 0.38, 0.38),
      ]

      const items = []
      for (let i = 0; i < count; i++) {
        const geo = geometries[i % geometries.length]
        const mat = materials[i % materials.length]
        const mesh = new THREE.Mesh(geo, mat)

        const x = (Math.random() - 0.5) * 10
        const y = (Math.random() - 0.5) * 6
        const z = (Math.random() - 0.5) * 3

        mesh.position.set(x, y, z)
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
        shapesGroup.add(mesh)

        items.push({
          mesh,
          speedX: (Math.random() - 0.5) * 0.015,
          speedY: (Math.random() - 0.5) * 0.015,
          rotX: (Math.random() - 0.5) * 0.02,
          rotY: (Math.random() - 0.5) * 0.02,
          baseY: y,
          seed: Math.random() * 10,
        })
      }

      return {
        update: ({ time, mouse }) => {
          items.forEach((item) => {
            item.mesh.rotation.x += item.rotX
            item.mesh.rotation.y += item.rotY
            item.mesh.position.y = item.baseY + Math.sin(time * 1.5 + item.seed) * 0.25
          })

          shapesGroup.rotation.y = mouse.x * 0.15
          shapesGroup.rotation.x = -mouse.y * 0.1
        },
      }
    },
    [count]
  )

  return (
    <Canvas3DContainer
      className={className}
      initScene={handleSceneInit}
      interactive={interactive}
      fallback={<div className="absolute inset-0 bg-linear-to-b from-indigo-50/30 to-transparent" />}
    />
  )
}
