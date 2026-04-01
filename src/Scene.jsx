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
      <ambientLight intensity={0.08} color="#1a1a3a" />
      <pointLight position={[0, 30, 0]} intensity={1.0} color="#4488ff" distance={100} />
      <pointLight position={[0, -5, 0]} intensity={1.5} color="#00ccff" distance={50} />
      <pointLight position={[25, 15, 15]} intensity={0.5} color="#ff6644" distance={60} />
      <pointLight position={[-25, 15, -15]} intensity={0.5} color="#aa44ff" distance={60} />
      <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" distance={30} />

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

      {/* Post-processing — HEAVY bloom for cinematic glow */}
      <EffectComposer>
        <Bloom
          intensity={3.0}
          luminanceThreshold={0.1}
          luminanceSmoothing={0.95}
          radius={0.95}
          mipmapBlur
          levels={8}
        />
        <ChromaticAberration
          offset={new THREE.Vector2(0.0015, 0.0015)}
          radialModulation={true}
          modulationOffset={0.3}
        />
      </EffectComposer>
    </>
  )
}
