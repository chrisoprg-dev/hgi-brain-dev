import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import { Brain } from './Brain'
import { Platform } from './Platform'
import { Particles } from './Particles'
import { EnergyBeam } from './EnergyBeam'
import { DataStreams } from './DataStreams'
import { Hotspots } from './Hotspots'

export function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.05} color="#1a1a3a" />
      <pointLight position={[0, 30, 0]} intensity={0.5} color="#4488ff" distance={80} />
      <pointLight position={[0, -5, 0]} intensity={0.8} color="#00ccff" distance={40} />
      <pointLight position={[20, 15, 10]} intensity={0.2} color="#ff6644" distance={50} />
      <pointLight position={[-20, 15, -10]} intensity={0.2} color="#aa44ff" distance={50} />

      {/* The Brain */}
      <Brain />

      {/* Neural Hotspots on brain surface */}
      <Hotspots />

      {/* Holographic Platform */}
      <Platform />

      {/* Energy Beam */}
      <EnergyBeam />

      {/* Data Streams */}
      <DataStreams />

      {/* Atmospheric Particles */}
      <Particles />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.9}
          radius={0.85}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0008, 0.0008)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      </EffectComposer>
    </>
  )
}
