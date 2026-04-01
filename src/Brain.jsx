import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export function Brain() {
  const { scene } = useGLTF('/brain.glb')
  const groupRef = useRef()
  const matsRef = useRef([])

  useEffect(() => {
    if (!scene) return
    const mats = []
    scene.traverse((child) => {
      if (child.isMesh && child.geometry.attributes.position.count > 50) {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0x1a2266),
          emissive: new THREE.Color(0x2244aa),
          emissiveIntensity: 0.8,
          metalness: 0.3,
          roughness: 0.5,
          transparent: true,
          opacity: 0.85,
          wireframe: false,
          side: THREE.DoubleSide,
        })
        child.material = mat
        mats.push({ mesh: child, mat })

        // Add a wireframe overlay
        const wireMat = new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          wireframe: true,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        const wireClone = new THREE.Mesh(child.geometry.clone(), wireMat)
        wireClone.scale.copy(child.scale).multiplyScalar(1.002)
        wireClone.position.copy(child.position)
        wireClone.rotation.copy(child.rotation)
        child.parent.add(wireClone)

        // Add Fresnel glow shell
        const glowMat = new THREE.MeshBasicMaterial({
          color: 0x4488ff,
          transparent: true,
          opacity: 0.06,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.BackSide,
        })
        const glowClone = new THREE.Mesh(child.geometry.clone(), glowMat)
        glowClone.scale.copy(child.scale).multiplyScalar(1.05)
        glowClone.position.copy(child.position)
        glowClone.rotation.copy(child.rotation)
        child.parent.add(glowClone)
      }
    })
    matsRef.current = mats
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05
    }
    // Pulse emissive
    matsRef.current.forEach(({ mat }, i) => {
      const pulse = 0.6 + Math.sin(t * 1.5 + i * 0.5) * 0.4
      mat.emissiveIntensity = pulse
    })
  })

  return (
    <group position={[0, 8, 0]} rotation={[-0.15, 0, 0]}>
      <group ref={groupRef} scale={2.5}>
        <primitive object={scene} />
      </group>
      {/* Atmosphere */}
      <mesh scale={[11, 8.5, 10]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color="#2244aa" transparent opacity={0.025} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

useGLTF.preload('/brain.glb')
