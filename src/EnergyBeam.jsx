import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function EnergyBeam() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main(){
        float edge = 1.0 - pow(abs(vUv.x - 0.5)*2.0, 1.5);
        float yFade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
        float s1 = sin(vUv.y*40.0 - uTime*5.0)*0.5+0.5;
        float s2 = sin(vUv.y*60.0 - uTime*7.0+1.5)*0.5+0.5;
        float energy = s1*0.6 + s2*0.4;
        float alpha = edge * yFade * energy * 0.15;
        vec3 col = mix(vec3(0.0,0.6,1.0), vec3(0.4,0.2,1.0), vUv.y);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => { mat.uniforms.uTime.value = clock.getElapsedTime() })

  return (
    <group position={[0, 3, 0]}>
      <mesh material={mat}><cylinderGeometry args={[0.2, 3.0, 22, 16, 1, true]} /></mesh>
      <mesh><cylinderGeometry args={[0.06, 0.8, 20, 8, 1, true]} />
        <meshBasicMaterial color="#88ccff" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh><cylinderGeometry args={[0.01, 0.2, 18, 4, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  )
}
