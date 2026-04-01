import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Platform() {
  const discMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      uniform float uTime; varying vec2 vUv;
      void main(){
        vec2 c = vUv - 0.5;
        float d = length(c);
        float angle = atan(c.y, c.x);
        float rings = sin(d * 50.0 - uTime * 2.5) * 0.5 + 0.5;
        rings *= smoothstep(0.5, 0.05, d);
        float radial = sin(angle * 16.0 + uTime * 0.3) * 0.5 + 0.5;
        float grid = step(0.96, fract(c.x * 25.0)) + step(0.96, fract(c.y * 25.0));
        grid *= smoothstep(0.5, 0.15, d) * 0.2;
        float alpha = (rings * 0.08 + radial * 0.02 + grid * 0.05) * smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(0.15, 0.5, 1.0, alpha);
      }
    `,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  }), [])

  useFrame(({ clock }) => { discMat.uniforms.uTime.value = clock.getElapsedTime() })

  return (
    <group position={[0, -3, 0]}>
      <mesh rotation={[-Math.PI/2, 0, 0]} material={discMat}>
        <circleGeometry args={[28, 128]} />
      </mesh>
      {[6, 9, 12.5, 16, 20, 24, 28].map((r, i) => (
        <mesh key={i} rotation={[-Math.PI/2, 0, 0]}>
          <ringGeometry args={[r - 0.05, r + 0.05, 128]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#0099ff' : '#3355ff'} transparent opacity={0.25 - i * 0.03} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI/2, 0, 0]}>
        <ringGeometry args={[4.5, 5.0, 128]} />
        <meshBasicMaterial color="#00ddff" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({length: 24}).map((_, i) => {
        const a = (i/24)*Math.PI*2
        const pts = [new THREE.Vector3(Math.cos(a)*5, 0, Math.sin(a)*5), new THREE.Vector3(Math.cos(a)*35, 0, Math.sin(a)*35)]
        return <line key={i} geometry={new THREE.BufferGeometry().setFromPoints(pts)}>
          <lineBasicMaterial color="#0a2255" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </line>
      })}
    </group>
  )
}
