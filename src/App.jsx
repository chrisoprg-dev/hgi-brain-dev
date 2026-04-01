import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing'
import * as THREE from 'three'

// === BRAIN MODEL ===
function Brain() {
  const { scene } = useGLTF('/brain.glb')
  const brainRef = useRef()
  const matRef = useRef()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(0.15, 0.2, 0.6),
          emissive: new THREE.Color(0.08, 0.12, 0.5),
          emissiveIntensity: 0.8,
          metalness: 0.1,
          roughness: 0.3,
          transparent: true,
          opacity: 0.7,
          transmission: 0.3,
          thickness: 1.5,
          side: THREE.DoubleSide,
        })
        matRef.current = child.material
      }
    })
  }, [scene])

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y += 0.002
    }
    if (matRef.current) {
      const t = state.clock.elapsedTime
      matRef.current.emissiveIntensity = 0.6 + Math.sin(t * 0.8) * 0.3
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <primitive ref={brainRef} object={scene} scale={1.1} />
    </Float>
  )
}

// === PLATFORM RINGS ===
function PlatformRings() {
  const ringsRef = useRef()
  useFrame((state) => {
    if (ringsRef.current) {
      ringsRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })
  return (
    <group ref={ringsRef} position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {[1.2, 1.6, 2.0, 2.5, 3.0].map((r, i) => (
        <mesh key={i}>
          <ringGeometry args={[r - 0.01, r + 0.01, 64]} />
          <meshBasicMaterial
            color={new THREE.Color(0.1, 0.3, 1.0)}
            transparent
            opacity={0.15 - i * 0.02}
          />
        </mesh>
      ))}
    </group>
  )
}

// === CLUSTER NODE ===
function ClusterNode({ position, color, label, count }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(t * 0.8 + position[0]) * 0.05
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5 + position[2]) * 0.15)
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* Core orb */}
      <mesh>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Bright center */}
      <mesh>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.24, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// === TRACE LINE (node to brain center) ===
function TraceLine({ start, color }) {
  const lineRef = useRef()
  const points = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(start[0] * 0.3, start[1] * 0.5 + 0.3, start[2] * 0.3),
      new THREE.Vector3(0, 0, 0)
    )
    return curve.getPoints(40)
  }, [start])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <group>
      {/* Wide glow */}
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.08} linewidth={1} />
      </line>
      {/* Core */}
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.4} linewidth={1} />
      </line>
    </group>
  )
}

// === ENERGY PARTICLES flowing along traces ===
function TraceParticles({ clusters }) {
  const count = 60
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particleData = useRef([])

  useEffect(() => {
    particleData.current = Array.from({ length: count }, () => {
      const ci = Math.floor(Math.random() * clusters.length)
      const cl = clusters[ci]
      return {
        cluster: ci,
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.004,
        toCenter: Math.random() > 0.35,
        color: new THREE.Color(cl.color),
        start: new THREE.Vector3(...cl.position),
      }
    })
  }, [clusters])

  useFrame(() => {
    if (!meshRef.current) return
    particleData.current.forEach((p, i) => {
      p.t += p.speed
      if (p.t > 1) {
        p.t = 0
        p.toCenter = Math.random() > 0.35
        const ci = Math.floor(Math.random() * clusters.length)
        p.cluster = ci
        p.start = new THREE.Vector3(...clusters[ci].position)
        p.color = new THREE.Color(Math.random() > 0.6 ? '#daa520' : clusters[ci].color)
      }

      const t = p.toCenter ? p.t : 1 - p.t
      const mid = p.start.clone().multiplyScalar(0.3).add(new THREE.Vector3(0, 0.3, 0))
      const pos = new THREE.Vector3()
      pos.x = (1-t)*(1-t)*p.start.x + 2*(1-t)*t*mid.x + t*t*0
      pos.y = (1-t)*(1-t)*p.start.y + 2*(1-t)*t*mid.y + t*t*0
      pos.z = (1-t)*(1-t)*p.start.z + 2*(1-t)*t*mid.z + t*t*0

      const alpha = p.t < 0.1 ? p.t / 0.1 : p.t > 0.85 ? (1 - p.t) / 0.15 : 1
      const scale = 0.02 + alpha * 0.03

      dummy.position.copy(pos)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#88ccff" transparent opacity={0.8} />
    </instancedMesh>
  )
}

// === AMBIENT STARS ===
function Stars() {
  const count = 200
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i*3] = (Math.random() - 0.5) * 20
      pos[i*3+1] = (Math.random() - 0.5) * 20
      pos[i*3+2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#334488" size={0.03} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

// === CLUSTER DEFINITIONS ===
const CLUSTERS = [
  { id: 'intel', label: 'INTELLIGENCE', count: 9, color: '#00e5ff', position: [-1.8, 0.8, 0.5] },
  { id: 'proposal', label: 'PROPOSAL', count: 11, color: '#daa520', position: [1.8, 0.8, 0.5] },
  { id: 'ops', label: 'OPERATIONS', count: 7, color: '#4ecdc4', position: [-1.6, -0.6, 0.8] },
  { id: 'research', label: 'RESEARCH', count: 7, color: '#e8834a', position: [1.6, -0.6, 0.8] },
  { id: 'exec', label: 'EXECUTIVE', count: 4, color: '#9b59b6', position: [0, -1.4, 1.0] },
  { id: 'meta', label: 'SELF-AWARE', count: 5, color: '#ff6b6b', position: [0, 1.5, 0.3] },
]

// === SCENE ===
function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 3, 3]} intensity={0.5} color="#4488ff" />
      <pointLight position={[-3, -1, 2]} intensity={0.3} color="#8844ff" />
      <pointLight position={[3, -1, -2]} intensity={0.3} color="#0088ff" />

      <Stars />
      <Brain />
      <PlatformRings />

      {CLUSTERS.map(c => (
        <React.Fragment key={c.id}>
          <ClusterNode position={c.position} color={c.color} label={c.label} count={c.count} />
          <TraceLine start={c.position} color={c.color} />
        </React.Fragment>
      ))}

      <TraceParticles clusters={CLUSTERS} />

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />

      <EffectComposer>
        <Bloom
          intensity={1.2}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
      </EffectComposer>
    </>
  )
}

// === PIPELINE DATA ===
const PIPELINE = [
  { short: 'NOLA Water', opi: 94, stage: 'pursuing', tag: 'INCUMBENT' },
  { short: 'DR-4900 LA', opi: 92, stage: 'identified' },
  { short: 'St. George', opi: 85, stage: 'watching', due: 'Apr 24' },
  { short: 'St. Mary', opi: 83, stage: 'pursuing', due: 'Apr 23' },
  { short: 'DR-4899 MS', opi: 82, stage: 'identified' },
  { short: 'HTHA', opi: 78, stage: 'submitted', tag: 'SUBMITTED' },
  { short: 'JP SOQ', opi: 72, stage: 'pursuing', due: 'Apr 9', tag: 'URGENT' },
]

const FEED = [
  { agent: 'Intelligence', text: 'Scanning DR-4900 updates', color: '#00e5ff' },
  { agent: 'Proposal', text: '44K JP SOQ generated', color: '#daa520' },
  { agent: 'CRM', text: 'Donna Evans — JP Purchasing', color: '#00e5ff' },
  { agent: 'Red Team', text: 'St. George FEMA PA gap', color: '#e8834a' },
  { agent: 'Competitive', text: 'Civix/CCG confirmed JP', color: '#00e5ff' },
  { agent: 'Self-Aware', text: '714 memories/24h', color: '#ff6b6b' },
]

function opiColor(o) { return o >= 90 ? '#00ff88' : o >= 80 ? '#00ccff' : o >= 70 ? '#daa520' : '#ff6b6b' }

// === MAIN APP ===
export default function App() {
  const [time, setTime] = useState(new Date())
  const [feedIdx, setFeedIdx] = useState(0)

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    const t2 = setInterval(() => setFeedIdx(i => (i + 1) % FEED.length), 3000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const F = "'JetBrains Mono','SF Mono','Fira Code',monospace"
  const P = { background: 'rgba(4,7,20,0.82)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 8, backdropFilter: 'blur(10px)' }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030510', position: 'relative', overflow: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet" />

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0.5, 5], fov: 50 }} style={{ position: 'absolute', inset: 0 }}>
        <Scene />
      </Canvas>

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(3,5,16,0.8), transparent)', fontFamily: F }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 12px #00ff88' }} />
          <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 4, color: '#7788aa' }}>HGI ORGANISM</span>
          <span style={{ fontSize: 9, color: '#334455' }}>v3.4 • 47 agents</span>
        </div>
        <span style={{ fontSize: 10, color: '#334455' }}>{time.toLocaleTimeString()}</span>
      </div>

      {/* Left Panel: Pipeline */}
      <div style={{ position: 'absolute', left: 12, top: 44, width: 180, zIndex: 10, ...P, padding: 10, maxHeight: '55%', overflowY: 'auto', fontFamily: F }}>
        <div style={{ fontSize: 8, letterSpacing: 2, color: '#4466aa', fontWeight: 700, marginBottom: 8 }}>ACTIVE PIPELINE</div>
        {PIPELINE.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
            <span style={{ background: opiColor(p.opi), color: '#000', fontWeight: 800, fontSize: 9, padding: '1px 4px', borderRadius: 3, minWidth: 20, textAlign: 'center' }}>{p.opi}</span>
            <div>
              <div style={{ fontSize: 9, color: '#8899aa', fontWeight: 600 }}>{p.short}</div>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 7, color: p.stage === 'pursuing' ? '#00ccff' : p.stage === 'submitted' ? '#9b59b6' : '#667788', textTransform: 'uppercase' }}>{p.stage}</span>
                {p.due && <span style={{ fontSize: 7, color: p.due === 'Apr 9' ? '#ff4444' : '#556677' }}>{p.due}</span>}
                {p.tag && <span style={{ fontSize: 7, color: p.tag === 'URGENT' ? '#ff4444' : p.tag === 'INCUMBENT' ? '#00ff88' : '#9b59b6', fontWeight: 700 }}>{p.tag}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Panel: Thought Stream */}
      <div style={{ position: 'absolute', right: 12, top: 44, width: 190, zIndex: 10, ...P, padding: 10, maxHeight: '50%', overflowY: 'auto', fontFamily: F }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 8, letterSpacing: 2, color: '#4466aa', fontWeight: 700 }}>THOUGHT STREAM</span>
          <span style={{ fontSize: 8, color: '#ff3333' }}>● LIVE</span>
        </div>
        {[...Array(5)].map((_, i) => {
          const f = FEED[(feedIdx + i) % FEED.length]
          return (
            <div key={i} style={{ marginBottom: 8, opacity: 1 - i * 0.15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: f.color }} />
                <span style={{ fontSize: 8, color: f.color, fontWeight: 600 }}>{f.agent}</span>
              </div>
              <div style={{ fontSize: 8, color: '#667788', lineHeight: 1.4, paddingLeft: 8 }}>{f.text}</div>
            </div>
          )
        })}
      </div>

      {/* Bottom: Cluster Legend + Stats */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '8px 20px', background: 'linear-gradient(to top, rgba(3,5,16,0.85), transparent)', fontFamily: F, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {CLUSTERS.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 4px ${c.color}` }} />
              <span style={{ fontSize: 8, color: '#556677' }}>{c.label} <span style={{ color: c.color }}>({c.count})</span></span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 8, color: '#334455' }}>Memories: <span style={{ color: '#4488ff' }}>5,546</span></span>
          <span style={{ fontSize: 8, color: '#334455' }}>Next: <span style={{ color: '#ff4444' }}>JP SOQ Apr 9</span></span>
        </div>
      </div>
    </div>
  )
}
