import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'


export function Brain() {
  const { scene } = useGLTF('/brain.glb')
  const groupRef = useRef()
  const holoRefs = useRef([])

  // Clone scene and apply holographic material to all meshes
  const brainScene = useMemo(() => {
    const clone = scene.clone(true)
    return clone
  }, [scene])

  return (
    <group position={[0, 8, 0]} rotation={[-0.15, 0, 0]}>
      <group ref={groupRef} scale={2.8}>
        {/* Main brain with holographic material */}
        <primitive object={brainScene}>
        </primitive>
      </group>

      {/* Override all children materials with holographic after mount */}
      <BrainMaterials groupRef={groupRef} holoRefs={holoRefs} />

      {/* Outer glow shells */}
      <mesh scale={[12, 9, 11]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial color="#2244aa" transparent opacity={0.03} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh scale={[16, 12, 14]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#1122aa" transparent opacity={0.015} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

function BrainMaterials({ groupRef, holoRefs }) {
  useEffect(() => {
    if (!groupRef.current) return
    groupRef.current.traverse((child) => {
      if (child.isMesh) {
        // Skip cubes or non-brain geometry
        if (child.geometry.attributes.position.count < 100) return
        child.material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0x3366ff) },
            uFresnelColor: { value: new THREE.Color(0x00ccff) },
          },
          vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vWorldPos;
            void main(){
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vViewPos = mvPos.xyz;
              vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * mvPos;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uFresnelColor;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            varying vec3 vWorldPos;
            void main(){
              vec3 viewDir = normalize(-vViewPos);
              float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

              // Base translucent blue
              vec3 col = uColor * 0.3;

              // Scanlines
              float scan = sin(vWorldPos.y * 30.0 + uTime * 2.0) * 0.5 + 0.5;
              col += uColor * scan * 0.1;

              // Neural activity
              float fire = pow(max(0.0,
                sin(vWorldPos.x*1.8+uTime*1.5)*
                sin(vWorldPos.y*2.2+uTime*1.1)*
                sin(vWorldPos.z*2.0+uTime*0.9)), 6.0);
              col += vec3(0.5, 0.8, 1.0) * fire * 4.0;

              float fire2 = pow(max(0.0,
                sin(vWorldPos.x*1.0-uTime*0.8)*
                sin(vWorldPos.y*1.5+uTime*1.3)*
                sin(vWorldPos.z*1.3-uTime*1.1)), 5.0);
              col += vec3(0.8, 0.4, 1.0) * fire2 * 3.0;

              float fire3 = pow(max(0.0,
                sin(vWorldPos.x*2.5+uTime*0.7)*
                sin(vWorldPos.y*0.8-uTime*0.5)*
                sin(vWorldPos.z*1.7+uTime*1.6)), 8.0);
              col += vec3(1.0, 0.6, 0.2) * fire3 * 2.5;

              // Strong Fresnel rim
              col += uFresnelColor * fresnel * 5.0;
              col += vec3(1.0) * pow(fresnel, 4.0) * 2.0;

              // Wireframe-like edge enhancement
              float edge = pow(1.0 - abs(dot(vNormal, viewDir)), 8.0);
              col += vec3(0.3, 0.5, 1.0) * edge * 1.5;

              float alpha = 0.35 + fresnel * 0.65;
              gl_FragColor = vec4(col, alpha);
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
        holoRefs.current.push(child.material)
      }
    })
  }, [groupRef])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    holoRefs.current.forEach(m => {
      if (m.uniforms) m.uniforms.uTime.value = t
    })
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06
    }
  })

  return null
}

useGLTF.preload('/brain.glb')
