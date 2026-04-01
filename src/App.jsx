import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Scene } from './Scene'
import { HUD } from './HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020210', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 12, 45], fov: 55, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.5 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020210']} />
        <fog attach="fog" args={['#020210', 30, 150]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={25}
          maxDistance={80}
          autoRotate
          autoRotateSpeed={0.4}
          target={[0, 8, 0]}
          maxPolarAngle={Math.PI * 0.75}
          minPolarAngle={Math.PI * 0.15}
        />
      </Canvas>
      <HUD />
    </div>
  )
}
