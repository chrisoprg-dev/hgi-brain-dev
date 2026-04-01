import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Particles() {
  const blueMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime; attribute float aSize; attribute float aRand; varying float vAlpha; varying float vWarm;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.05+aRand*100.0)*2.0;
        p.y += cos(uTime*0.04+aRand*70.0)*1.5;
        p.z += sin(uTime*0.03+aRand*80.0)*2.0;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_Position = projectionMatrix*mv;
        float dist = length(p - vec3(0.0,10.0,0.0));
        gl_PointSize = (25.0+aSize*55.0)*(1.0/-mv.z);
        vAlpha = (0.04+aRand*0.1) * smoothstep(55.0, 5.0, dist);
        vWarm = 0.0;
      }`,
    fragmentShader: `
      varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * vAlpha;
        gl_FragColor = vec4(0.3, 0.6, 1.0, a);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [])

  const warmMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime; attribute float aSize; attribute float aRand; varying float vAlpha;
      void main(){
        vec3 p = position;
        p.x += sin(uTime*0.06+aRand*90.0)*1.5;
        p.y += cos(uTime*0.05+aRand*60.0)*1.0;
        p.z += sin(uTime*0.04+aRand*85.0)*1.5;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_Position = projectionMatrix*mv;
        gl_PointSize = (18.0+aSize*40.0)*(1.0/-mv.z);
        vAlpha = 0.025 + aRand * 0.06;
      }`,
    fragmentShader: `
      varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        gl_FragColor = vec4(1.0, 0.5, 0.15, smoothstep(0.5,0.0,d)*vAlpha);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [])

  const risingMat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime; attribute float aSize; attribute float aRand; varying float vAlpha;
      void main(){
        vec3 p = position;
        p.y = mod(p.y + uTime * (0.5 + aRand * 1.5) + aRand * 30.0, 27.0) - 2.0;
        float angle = uTime * 0.3 * (aRand - 0.5);
        float r = length(p.xz);
        p.x = cos(atan(p.z, p.x) + angle) * r;
        p.z = sin(atan(p.z, p.x) + angle) * r;
        vec4 mv = modelViewMatrix*vec4(p,1.0);
        gl_Position = projectionMatrix*mv;
        gl_PointSize = (15.0+aSize*25.0)*(1.0/-mv.z);
        vAlpha = (0.08 + aRand * 0.15) * smoothstep(25.0, 5.0, p.y);
      }`,
    fragmentShader: `
      varying float vAlpha;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if(d > 0.5) discard;
        gl_FragColor = vec4(0.4, 0.7, 1.0, smoothstep(0.5,0.0,d)*vAlpha);
      }`,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  }), [])

  const blueGeo = useMemo(() => {
    const count = 5000
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const rands = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.pow(Math.random(), 0.4) * 55
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.5 + 5
      pos[i*3+2] = r * Math.cos(phi)
      sizes[i] = Math.random()
      rands[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
    return geo
  }, [])

  const warmGeo = useMemo(() => {
    const count = 2000
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const rands = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.pow(Math.random(), 0.5) * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i*3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta) * 0.4 + 5
      pos[i*3+2] = r * Math.cos(phi)
      sizes[i] = Math.random()
      rands[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
    return geo
  }, [])

  const risingGeo = useMemo(() => {
    const count = 800
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const rands = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 1 + Math.random() * 6
      pos[i*3] = Math.cos(angle) * r
      pos[i*3+1] = Math.random() * 27 - 2
      pos[i*3+2] = Math.sin(angle) * r
      sizes[i] = Math.random()
      rands[i] = Math.random()
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rands, 1))
    return geo
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    blueMat.uniforms.uTime.value = t
    warmMat.uniforms.uTime.value = t
    risingMat.uniforms.uTime.value = t
  })

  return (
    <>
      <points geometry={blueGeo} material={blueMat} />
      <points geometry={warmGeo} material={warmMat} />
      <points geometry={risingGeo} material={risingMat} />
    </>
  )
}
