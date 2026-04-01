import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'
import { Brain } from './Brain'
import { Platform } from './Platform'
import { Particles } from './Particles'
import { EnergyBeam } from './EnergyBeam'
import { DataStreams } from './DataStreams'
import { HUD } from './HUD'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#010108', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 15, 40], fov: 50, near: 0.1, far: 500 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#010108']} />
        <fog attach="fog" args={['#010108', 40, 120]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.06} color="#0a0a2a" />
          <pointLight position={[0, 25, 0]} intensity={1.0} color="#4488ff" distance={80} />
          <pointLight position={[0, -8, 0]} intensity={2.0} color="#00aaff" distance={40} />
          <pointLight position={[20, 15, 15]} intensity={0.4} color="#ff6644" distance={50} />
          <pointLight position={[-20, 15, -15]} intensity={0.4} color="#8844ff" distance={50} />
          <pointLight position={[0, 10, 20]} intensity={0.3} color="#00ffaa" distance={40} />

          <Brain />
          <Platform />
          <EnergyBeam />
          <DataStreams />
          <Particles />

          <EffectComposer>
            <Bloom intensity={2.5} luminanceThreshold={0.08} luminanceSmoothing={0.95} radius={0.9} mipmapBlur levels={8} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} radialModulation modulationOffset={0.4} />
            <Vignette eskil={false} offset={0.3} darkness={0.8} />
          </EffectComposer>
        </Suspense>
        <OrbitControls
          enablePan={false} enableZoom={true}
          minDistance={20} maxDistance={70}
          autoRotate autoRotateSpeed={0.3}
          target={[0, 6, 0]}
          maxPolarAngle={Math.PI * 0.8} minPolarAngle={Math.PI * 0.1}
        />
      </Canvas>
      <HUD />
    </div>
  )
}
