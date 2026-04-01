import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
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

export function Brain() {
  const brainRef = useRef()
  const glowRef = useRef()

  // Build brain geometry procedurally with proper folds
  const brainGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(8, 6)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const len = Math.sqrt(x*x + y*y + z*z)
      x /= len; y /= len; z /= len
      x *= 1.35; y *= 0.82; z *= 1.08
      if (y < -0.2) y *= 0.55
      if (z > 0.3) z *= 1.0 + (z - 0.3) * 0.15
      pos.setXYZ(i, x * 8, y * 8, z * 8)
    }
    geo.computeVertexNormals()
    return geo
  }, [])

  const brainMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x1a2288) },
      uColor2: { value: new THREE.Color(0x7744cc) },
      uColor3: { value: new THREE.Color(0x00ddff) },
    },
    vertexShader: `
      ${NOISE_GLSL}
      uniform float uTime;
      varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vWorldPos; varying float vDisp;
      void main(){
        float n1 = snoise(position * 0.3 + uTime * 0.04) * 1.4;
        float n2 = snoise(position * 0.65 + uTime * 0.025) * 0.6;
        float n3 = snoise(position * 1.3 + uTime * 0.015) * 0.25;
        float n4 = snoise(position * 2.5 + uTime * 0.01) * 0.12;
        float displacement = n1 + n2 + n3 + n4;
        float fissure = exp(-pow(position.z * 0.7, 2.0) * 3.0) * 0.8;
        displacement -= fissure;
        float lateral = exp(-pow(position.y + 1.0, 2.0) * 2.0) * exp(-pow(abs(position.z) - 3.0, 2.0) * 0.5) * 0.4;
        displacement -= lateral;
        vDisp = displacement;
        vec3 newPos = position + normal * displacement;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(newPos, 1.0);
        vViewPos = mvPos.xyz;
        vWorldPos = (modelMatrix * vec4(newPos, 1.0)).xyz;
        gl_Position = projectionMatrix * mvPos;
      }`,
    fragmentShader: `
      uniform float uTime; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
      varying vec3 vNormal; varying vec3 vViewPos; varying vec3 vWorldPos; varying float vDisp;
      void main(){
        vec3 viewDir = normalize(-vViewPos);
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
        vec3 base = mix(uColor1, uColor2, smoothstep(-0.8, 1.2, vDisp));
        float fire1 = pow(max(0.0, sin(vWorldPos.x*1.5+uTime*1.5)*sin(vWorldPos.y*2.0+uTime*1.1)*sin(vWorldPos.z*1.8+uTime*0.8)), 8.0);
        float fire2 = pow(max(0.0, sin(vWorldPos.x*0.8-uTime*0.6)*sin(vWorldPos.y*1.3+uTime*1.3)*sin(vWorldPos.z*1.6-uTime*1.0)), 6.0);
        float fire3 = pow(max(0.0, sin(vWorldPos.x*2.2+uTime*0.9)*sin(vWorldPos.y*0.9-uTime*0.7)*sin(vWorldPos.z*1.1+uTime*1.4)), 10.0);
        vec3 activity = vec3(0.3,0.6,1.0)*fire1*3.0 + vec3(0.8,0.3,1.0)*fire2*2.5 + vec3(1.0,0.8,0.3)*fire3*2.0;
        base += activity;
        base += uColor3 * fresnel * 4.0;
        base += vec3(1.0) * pow(fresnel, 5.0) * 2.0;
        float sss = pow(max(0.0, dot(vNormal, normalize(vec3(0.3,1.0,0.2)))), 3.0) * 0.3;
        base += uColor3 * sss;
        gl_FragColor = vec4(base, 0.75 + fresnel * 0.25);
      }`,
    transparent: true, side: THREE.DoubleSide,
  }), [])

  const glowMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x4466ff) } },
    vertexShader: `
      ${NOISE_GLSL}
      uniform float uTime; varying vec3 vNormal; varying vec3 vViewPos;
      void main(){
        float n1 = snoise(position * 0.3 + uTime * 0.04) * 1.0;
        float n2 = snoise(position * 0.65 + uTime * 0.025) * 0.4;
        vec3 newPos = position + normal * (n1 + n2 - 0.2);
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(newPos, 1.0);
        vViewPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying vec3 vNormal; varying vec3 vViewPos;
      void main(){
        vec3 vd = normalize(-vViewPos);
        float f = pow(1.0 - max(dot(vNormal, vd), 0.0), 2.0);
        gl_FragColor = vec4(uColor * 2.0, f * 0.6);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
  }), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    brainMat.uniforms.uTime.value = t
    glowMat.uniforms.uTime.value = t
    if (brainRef.current) brainRef.current.rotation.y = t * 0.04
    if (glowRef.current) glowRef.current.rotation.y = t * 0.04
  })

  return (
    <group position={[0, 10, 0]} rotation={[-0.1, 0, 0]}>
      <mesh ref={brainRef} geometry={brainGeo} material={brainMat} />
      <mesh ref={glowRef} geometry={brainGeo.clone()} material={glowMat} scale={1.06} />
      <mesh scale={[1.2, 1.05, 1.12]}>
        <sphereGeometry args={[9, 32, 24]} />
        <meshBasicMaterial color="#3344aa" transparent opacity={0.04} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <mesh scale={[1.45, 1.25, 1.35]}>
        <sphereGeometry args={[9, 24, 16]} />
        <meshBasicMaterial color="#2233aa" transparent opacity={0.02} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
