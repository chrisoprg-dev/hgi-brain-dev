import React, { useMemo } from 'react'
import * as THREE from 'three'

export function DataStreams() {
  const streams = useMemo(() => {
    const result = []
    for (let i = 0; i < 50; i++) {
      const a = Math.random()*Math.PI*2
      const elev = (Math.random()-0.3)*2.0
      const len = 10+Math.random()*30
      const pts = []
      for (let s = 0; s < 30; s++) {
        const t = s/29, r = 8+t*len
        pts.push(new THREE.Vector3(Math.cos(a+t*0.5)*r, 8+elev*r*0.2+Math.sin(t*6)*0.3, Math.sin(a+t*0.5)*r))
      }
      const curve = new THREE.CatmullRomCurve3(pts)
      const colors = ['#3388ff','#6644ff','#ff7744','#00ccaa']
      result.push({ curve, color: colors[Math.floor(Math.random()*colors.length)], opacity: 0.03+Math.random()*0.05 })
    }
    return result
  }, [])

  return <>{streams.map((s,i) => <mesh key={i}><tubeGeometry args={[s.curve,40,0.02,4,false]} /><meshBasicMaterial color={s.color} transparent opacity={s.opacity} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>)}</>
}
