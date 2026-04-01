import React, { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function makeParticles(count, spread, yOffset, yScale) {
  const pos = new Float32Array(count*3), sizes = new Float32Array(count), rands = new Float32Array(count)
  for (let i=0;i<count;i++) {
    const r=2+Math.pow(Math.random(),0.4)*spread, t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1)
    pos[i*3]=r*Math.sin(p)*Math.cos(t); pos[i*3+1]=r*Math.sin(p)*Math.sin(t)*yScale+yOffset; pos[i*3+2]=r*Math.cos(p)
    sizes[i]=Math.random(); rands[i]=Math.random()
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3))
  geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1))
  geo.setAttribute('aRand',new THREE.BufferAttribute(rands,1))
  return geo
}

function makeShader(color) {
  return new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`uniform float uTime;attribute float aSize;attribute float aRand;varying float vAlpha;
      void main(){vec3 p=position;p.x+=sin(uTime*0.05+aRand*100.0)*2.0;p.y+=cos(uTime*0.04+aRand*70.0)*1.5;p.z+=sin(uTime*0.03+aRand*80.0)*2.0;
      vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;
      float dist=length(p-vec3(0.0,8.0,0.0));gl_PointSize=(20.0+aSize*50.0)*(1.0/-mv.z);
      vAlpha=(0.03+aRand*0.08)*smoothstep(50.0,3.0,dist);}`,
    fragmentShader:`varying float vAlpha;void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;gl_FragColor=vec4(${color},smoothstep(0.5,0.0,d)*vAlpha);}`,
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
  })
}

export function Particles() {
  const blueGeo = useMemo(()=>makeParticles(6000,55,4,0.5),[])
  const warmGeo = useMemo(()=>makeParticles(2000,40,4,0.4),[])
  const riseGeo = useMemo(()=>{
    const count=1000,pos=new Float32Array(count*3),sizes=new Float32Array(count),rands=new Float32Array(count)
    for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,r=1+Math.random()*5;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.random()*22-3;pos[i*3+2]=Math.sin(a)*r;sizes[i]=Math.random();rands[i]=Math.random()}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geo.setAttribute('aRand',new THREE.BufferAttribute(rands,1));return geo
  },[])
  const blueMat=useMemo(()=>makeShader('0.3,0.6,1.0'),[])
  const warmMat=useMemo(()=>makeShader('1.0,0.5,0.15'),[])
  const riseMat=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uTime:{value:0}},
    vertexShader:`uniform float uTime;attribute float aSize;attribute float aRand;varying float vAlpha;
      void main(){vec3 p=position;p.y=mod(p.y+uTime*(0.8+aRand*2.0)+aRand*30.0,25.0)-3.0;
      vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=(12.0+aSize*22.0)*(1.0/-mv.z);
      vAlpha=(0.06+aRand*0.12)*smoothstep(22.0,5.0,p.y);}`,
    fragmentShader:'varying float vAlpha;void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;gl_FragColor=vec4(0.3,0.7,1.0,smoothstep(0.5,0.0,d)*vAlpha);}',
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false
  }),[])

  useFrame(({clock})=>{const t=clock.getElapsedTime();blueMat.uniforms.uTime.value=t;warmMat.uniforms.uTime.value=t;riseMat.uniforms.uTime.value=t})

  return <><points geometry={blueGeo} material={blueMat} /><points geometry={warmGeo} material={warmMat} /><points geometry={riseGeo} material={riseMat} /></>
}
