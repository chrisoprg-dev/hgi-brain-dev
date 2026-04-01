import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Platform() {
  const discRef = useRef()
  const ringsRef = useRef([])

  const discMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5;
        float d = length(c);
        float angle = atan(c.y, c.x);
        // Concentric pulse rings
        float rings = sin(d * 40.0 - uTime * 2.0) * 0.5 + 0.5;
        rings *= smoothstep(0.5, 0.1, d);
        // Radial scan lines
        float radial = sin(angle * 12.0 + uTime * 0.5) * 0.5 + 0.5;
        // Grid pattern
        float grid = step(0.95, fract(c.x * 20.0)) + step(0.95, fract(c.y * 20.0));
        grid *= smoothstep(0.5, 0.2, d) * 0.3;
        float alpha = (rings * 0.06 + radial * 0.02 + grid * 0.04) * smoothstep(0.5, 0.0, d);
        vec3 col = mix(vec3(0.0, 0.6, 1.0), vec3(0.3, 0.4, 1.0), radial);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => {
    discMat.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <group position={[0, -2, 0]}>
      {/* Main disc */}
      <mesh ref={discRef} rotation={[-Math.PI / 2, 0, 0]} material={discMat}>
        <circleGeometry args={[25, 128]} />
      </mesh>

      {/* Concentric rings */}
      {[8, 11, 14.5, 18, 22, 26].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.06, r + 0.06, 128]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? '#00aaff' : '#4466ff'}
            transparent opacity={0.2 - i * 0.025}
            blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Bright inner ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.8, 6.2, 128]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Floor grid lines extending outward */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const x1 = Math.cos(angle) * 6, z1 = Math.sin(angle) * 6
        const x2 = Math.cos(angle) * 35, z2 = Math.sin(angle) * 35
        const points = [new THREE.Vector3(x1, 0, z1), new THREE.Vector3(x2, 0, z2)]
        const geo = new THREE.BufferGeometry().setFromPoints(points)
        return (
          <line key={`grid-${i}`} geometry={geo}>
            <lineBasicMaterial color="#1a3366" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
          </line>
        )
      })}
    </group>
  )
}
