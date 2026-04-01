import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function EnergyBeam() {
  const matRef = useRef()

  const beamMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main(){
        float edge = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 2.0);
        float yFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
        // Scrolling energy
        float scroll1 = sin(vUv.y * 30.0 - uTime * 4.0) * 0.5 + 0.5;
        float scroll2 = sin(vUv.y * 50.0 - uTime * 6.0 + 1.5) * 0.5 + 0.5;
        float energy = scroll1 * 0.6 + scroll2 * 0.4;
        float alpha = edge * yFade * energy * 0.12;
        vec3 col = mix(vec3(0.0, 0.7, 1.0), vec3(0.5, 0.3, 1.0), vUv.y);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => {
    beamMat.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <group position={[0, 4, 0]}>
      {/* Wide outer beam */}
      <mesh material={beamMat}>
        <cylinderGeometry args={[0.3, 2.5, 24, 16, 1, true]} />
      </mesh>
      {/* Bright core */}
      <mesh>
        <cylinderGeometry args={[0.08, 0.5, 22, 8, 1, true]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Hot center line */}
      <mesh>
        <cylinderGeometry args={[0.02, 0.15, 20, 4, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
