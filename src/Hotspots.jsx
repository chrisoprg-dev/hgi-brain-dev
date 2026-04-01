import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const AGENTS = [
  { name: "Intelligence Engine", c: "#00e5ff" },
  { name: "Financial", c: "#00e5ff" },
  { name: "Winnability", c: "#00e5ff" },
  { name: "CRM", c: "#00e5ff" },
  { name: "Discovery", c: "#00e5ff" },
  { name: "OPI Cal", c: "#00e5ff" },
  { name: "Disaster Monitor", c: "#00e5ff" },
  { name: "Fed Scanner", c: "#00e5ff" },
  { name: "Grant Scanner", c: "#00e5ff" },
  { name: "Proposal Writer", c: "#daa520" },
  { name: "Red Team", c: "#daa520" },
  { name: "Brief", c: "#daa520" },
  { name: "Assembly", c: "#daa520" },
  { name: "Content Engine", c: "#daa520" },
  { name: "Design Visual", c: "#daa520" },
  { name: "Quality Gate", c: "#4ecdc4" },
  { name: "Staffing", c: "#4ecdc4" },
  { name: "Recruiting", c: "#4ecdc4" },
  { name: "Pipeline Scanner", c: "#4ecdc4" },
  { name: "Research Analysis", c: "#e8834a" },
  { name: "KB Agent", c: "#e8834a" },
  { name: "Competitive Intel", c: "#e8834a" },
  { name: "Market Research", c: "#e8834a" },
  { name: "Exec Brief", c: "#9b59b6" },
  { name: "Dashboard", c: "#9b59b6" },
  { name: "Morning Brief", c: "#9b59b6" },
  { name: "Self-Awareness", c: "#ff6b6b" },
  { name: "Learning Engine", c: "#ff6b6b" },
  { name: "Memory Curator", c: "#ff6b6b" },
  { name: "Eval Calibrator", c: "#ff6b6b" },
  { name: "Loss Analysis", c: "#ff6b6b" },
]

export function Hotspots() {
  const groupRef = useRef()
  const dotsRef = useRef([])

  const positions = useMemo(() => {
    return AGENTS.map((a, i) => {
      // Fibonacci sphere distribution
      const phi = Math.acos(1 - 2 * (i + 0.5) / AGENTS.length)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i
      let x = Math.sin(phi) * Math.cos(theta) * 1.35
      let y = Math.sin(phi) * Math.sin(theta) * 0.82
      let z = Math.cos(phi) * 1.08
      if (y < -0.2) y *= 0.55
      return { x: x * 8.8, y: y * 8.8 + 10, z: z * 8.8, color: a.c, name: a.name, phase: Math.random() * Math.PI * 2 }
    })
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.03
    }
  })

  return (
    <group ref={groupRef} rotation={[-0.12, 0, 0]}>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, p.y - 10, p.z]}>
          {/* Bright core */}
          <mesh>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Color glow */}
          <mesh>
            <sphereGeometry args={[0.6, 8, 6]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* Wide aura */}
          <mesh>
            <sphereGeometry args={[1.2, 6, 4]} />
            <meshBasicMaterial color={p.color} transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
