import React, { useMemo } from 'react'
import * as THREE from 'three'

export function DataStreams() {
  const streams = useMemo(() => {
    const result = []
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2
      const elev = (Math.random() - 0.3) * 1.8
      const len = 12 + Math.random() * 30
      const startR = 9
      const points = []
      for (let s = 0; s < 25; s++) {
        const t = s / 24
        const r = startR + t * len
        points.push(new THREE.Vector3(
          Math.cos(angle + t * 0.4) * r,
          10 + elev * r * 0.25 + Math.sin(t * 5) * 0.4,
          Math.sin(angle + t * 0.4) * r
        ))
      }
      const curve = new THREE.CatmullRomCurve3(points)
      const color = Math.random() > 0.65 ? '#ff7744' : Math.random() > 0.5 ? '#aa55ff' : '#3388ff'
      const opacity = 0.04 + Math.random() * 0.06
      result.push({ curve, color, opacity })
    }
    return result
  }, [])

  return (
    <>
      {streams.map((s, i) => (
        <mesh key={i}>
          <tubeGeometry args={[s.curve, 40, 0.025, 4, false]} />
          <meshBasicMaterial
            color={s.color} transparent opacity={s.opacity}
            blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}
