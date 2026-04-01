import React, { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

function makeBrainShader(baseColor) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(baseColor) },
      uGlowColor: { value: new THREE.Color(0x00ddff) },
    },
    vertexShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      varying vec3 vWorldPos;
      void main(){
        // Subtle breathing deformation
        float n = snoise(position * 0.5 + uTime * 0.1) * 0.08;
        vec3 newPos = position + normal * n;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0);
        vViewPos = mvPos.xyz;
        vWorldPos = (modelMatrix * vec4(newPos, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uBaseColor;
      uniform vec3 uGlowColor;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      varying vec3 vWorldPos;
      void main(){
        vec3 viewDir = normalize(-vViewPos);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.8);
        
        vec3 col = uBaseColor;
        
        // Neural activity pulses
        float fire1 = pow(max(0.0,
          sin(vWorldPos.x*2.0+uTime*1.8)*
          sin(vWorldPos.y*2.5+uTime*1.2)*
          sin(vWorldPos.z*2.2+uTime*0.9)), 8.0);
        float fire2 = pow(max(0.0,
          sin(vWorldPos.x*1.2-uTime*0.7)*
          sin(vWorldPos.y*1.8+uTime*1.5)*
          sin(vWorldPos.z*1.5-uTime*1.1)), 6.0);
        
        col += vec3(0.4, 0.7, 1.0) * fire1 * 3.5;
        col += vec3(1.0, 0.5, 0.8) * fire2 * 2.5;
        
        // Fresnel rim glow - STRONG
        col += uGlowColor * fresnel * 5.0;
        col += vec3(1.0) * pow(fresnel, 4.0) * 2.5;
        
        // Subsurface
        float sss = pow(max(0.0, dot(vNormal, normalize(vec3(0.2,1.0,0.3)))), 2.5) * 0.2;
        col += uGlowColor * sss;
        
        float alpha = 0.65 + fresnel * 0.35;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  })
}

function makeGlowShader(color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main(){
        float n = snoise(position * 0.4 + uTime * 0.08) * 0.1;
        vec3 newPos = position + normal * (n + 0.15);
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(newPos, 1.0);
        vViewPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main(){
        vec3 vd = normalize(-vViewPos);
        float f = pow(1.0 - max(dot(vNormal, vd), 0.0), 2.0);
        gl_FragColor = vec4(uColor * 2.5, f * 0.7);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  })
}

// Lobe colors matching reference images - blue/purple/cyan spectrum
const LOBE_COLORS = {
  'Frontal': 0x3344cc,
  'Parietal': 0x5533aa,
  'Occipital': 0x2255bb,
  'Temporal': 0x4422aa,
  'cerebellum': 0x224488,
}

const LOBE_GLOW = {
  'Frontal': 0x4488ff,
  'Parietal': 0x8844ff,
  'Occipital': 0x3366ff,
  'Temporal': 0x6644ff,
  'cerebellum': 0x3388ff,
}

export function Brain() {
  const { scene } = useGLTF('/brain.glb')
  const groupRef = useRef()
  const materialsRef = useRef([])
  const glowMatsRef = useRef([])

  // Apply custom shaders to each lobe
  useEffect(() => {
    const mats = []
    const glowMats = []
    scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name
        const baseColor = LOBE_COLORS[name] || 0x3344aa
        const glowColor = LOBE_GLOW[name] || 0x4466ff
        
        // Replace material with custom shader
        const shader = makeBrainShader(baseColor)
        child.material = shader
        mats.push(shader)
        
        // Create glow clone
        const glowMesh = child.clone()
        glowMesh.material = makeGlowShader(glowColor)
        glowMesh.scale.multiplyScalar(1.03)
        child.parent.add(glowMesh)
        glowMats.push(glowMesh.material)
      }
    })
    materialsRef.current = mats
    glowMatsRef.current = glowMats
  }, [scene])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    materialsRef.current.forEach(m => { m.uniforms.uTime.value = t })
    glowMatsRef.current.forEach(m => { m.uniforms.uTime.value = t })
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.04
    }
  })

  return (
    <group position={[0, 8, 0]} rotation={[-0.15, 0, 0]}>
      <group ref={groupRef} scale={8}>
        <primitive object={scene} />
      </group>
      
      {/* Outer atmosphere shells */}
      <mesh scale={[12, 9, 10]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshBasicMaterial
          color="#3344aa" transparent opacity={0.04}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>
      <mesh scale={[15, 11, 13]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial
          color="#2233aa" transparent opacity={0.02}
          blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload('/brain.glb')
