import React, { useEffect, useRef, useState } from 'react'

// CSS-based particles and effects around a Sketchfab-embedded brain
function FloatingParticle({ delay, duration, x, size, color, opacity }) {
  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      bottom: '-5%',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      opacity: opacity,
      boxShadow: `0 0 ${size * 2}px ${color}`,
      animation: `floatUp ${duration}s ${delay}s linear infinite`,
      pointerEvents: 'none',
    }} />
  )
}

function PlatformRing({ radius, delay, color, opacity }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '12%',
      left: '50%',
      transform: 'translateX(-50%) perspective(800px) rotateX(75deg)',
      width: radius,
      height: radius,
      borderRadius: '50%',
      border: `1px solid ${color}`,
      opacity: opacity,
      boxShadow: `0 0 15px ${color}, inset 0 0 15px ${color}`,
      animation: `pulseRing 3s ${delay}s ease-in-out infinite`,
      pointerEvents: 'none',
    }} />
  )
}

function DataStream({ angle, length, delay, color }) {
  return (
    <div style={{
      position: 'absolute',
      top: '45%',
      left: '50%',
      width: length,
      height: '1px',
      background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
      opacity: 0.15,
      transform: `rotate(${angle}deg)`,
      transformOrigin: '0 0',
      animation: `streamPulse 4s ${delay}s ease-in-out infinite`,
      pointerEvents: 'none',
    }} />
  )
}

export default function App() {
  const [model, setModel] = useState('hologram') // 'hologram' or 'animated'
  
  const models = {
    hologram: '09d686a1a1f745cba6b2385d0c831214',
    animated: '18e8505582aa46879acc9da891958677',
  }

  const embedUrl = `https://sketchfab.com/models/${models[model]}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&transparent=1&camera=0`

  // Generate particles
  const particles = Array.from({ length: 60 }, (_, i) => ({
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    x: 10 + Math.random() * 80,
    size: 1 + Math.random() * 3,
    color: Math.random() > 0.6 ? '#ff8844' : Math.random() > 0.4 ? '#8844ff' : '#4488ff',
    opacity: 0.1 + Math.random() * 0.3,
  }))

  const streams = Array.from({ length: 30 }, (_, i) => ({
    angle: i * 12 + Math.random() * 6,
    length: 150 + Math.random() * 300,
    delay: Math.random() * 4,
    color: ['#4488ff', '#8844ff', '#ff8844', '#00ccaa'][Math.floor(Math.random() * 4)],
  }))

  return (
    <div style={{
      width: '100vw', height: '100vh',
      background: 'radial-gradient(ellipse at 50% 60%, #0a0a2a 0%, #020208 50%, #000000 100%)',
      position: 'relative', overflow: 'hidden',
      fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
    }}>
      {/* === SKETCHFAB BRAIN === */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '10%',
        width: '80%',
        height: '75%',
        zIndex: 5,
      }}>
        <iframe
          title="HGI Brain"
          src={embedUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: 'transparent',
          }}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
        />
      </div>

      {/* === DATA STREAMS === */}
      {streams.map((s, i) => <DataStream key={`stream-${i}`} {...s} />)}

      {/* === PLATFORM RINGS === */}
      {[180, 240, 320, 420, 540, 680].map((r, i) => (
        <PlatformRing key={`ring-${i}`} radius={r} delay={i * 0.3} color={i % 2 === 0 ? '#0088ff' : '#4455cc'} opacity={0.2 - i * 0.025} />
      ))}

      {/* === ENERGY BEAM === */}
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 4,
        height: '35%',
        background: 'linear-gradient(to top, #00aaff00, #00aaff44 30%, #00aaff88 50%, #00aaff44 70%, #00aaff00)',
        boxShadow: '0 0 30px #00aaff44, 0 0 60px #00aaff22',
        zIndex: 2,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 40,
        height: '35%',
        background: 'linear-gradient(to top, #0044ff00, #0044ff08 30%, #0044ff15 50%, #0044ff08 70%, #0044ff00)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* === FLOATING PARTICLES === */}
      {particles.map((p, i) => <FloatingParticle key={`p-${i}`} {...p} />)}

      {/* === HUD HEADER === */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '16px 28px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4488ff', boxShadow: '0 0 12px #4488ff, 0 0 4px #88aaff', animation: 'statusPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 5, color: '#6699ff', textShadow: '0 0 20px rgba(68,136,255,0.4)' }}>HGI ORGANISM</span>
          <span style={{ fontSize: 10, color: '#334466', letterSpacing: 2, marginLeft: 8 }}>NEURAL CORE v3.4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00cc88', boxShadow: '0 0 8px #00cc88' }} />
            <span style={{ fontSize: 10, color: '#448866', letterSpacing: 1 }}>MESH ACTIVE</span>
          </div>
          <span style={{ fontSize: 10, color: '#445566' }}>43 AGENTS · 380+ PATHS</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#556677', letterSpacing: 1 }}>HEALTH</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#4488ff', textShadow: '0 0 25px rgba(68,136,255,0.6)' }}>87</span>
          </div>
        </div>
      </div>

      {/* === LEFT PANEL === */}
      <div style={{
        position: 'absolute', left: 20, top: 80, width: 190, zIndex: 20,
        background: 'rgba(5,10,30,0.75)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10,
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#4466aa', marginBottom: 12, fontWeight: 700 }}>AGENT CLUSTERS</div>
        {[
          { name: 'Intelligence', count: 9, active: 8, color: '#00e5ff' },
          { name: 'Proposal', count: 11, active: 9, color: '#daa520' },
          { name: 'Operations', count: 7, active: 7, color: '#4ecdc4' },
          { name: 'Research', count: 7, active: 6, color: '#e8834a' },
          { name: 'Executive', count: 4, active: 4, color: '#9b59b6' },
          { name: 'Meta', count: 5, active: 5, color: '#ff6b6b' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
              <span style={{ fontSize: 11, color: '#8899aa' }}>{c.name}</span>
            </div>
            <span style={{ fontSize: 10, color: c.color, fontWeight: 600 }}>{c.active}/{c.count}</span>
          </div>
        ))}
      </div>

      {/* === RIGHT PANEL === */}
      <div style={{
        position: 'absolute', right: 20, top: 80, width: 190, zIndex: 20,
        background: 'rgba(5,10,30,0.75)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10,
        padding: '14px 18px',
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#4466aa', marginBottom: 12, fontWeight: 700 }}>SYSTEM METRICS</div>
        {[
          { label: 'Memory Records', value: '5,426', color: '#4488ff' },
          { label: 'Active Pipeline', value: '7', color: '#00cc88' },
          { label: 'Pursuing', value: '3', color: '#daa520' },
          { label: 'Last Cycle', value: '12m ago', color: '#8899aa' },
          { label: 'OPI Range', value: '72-94', color: '#4ecdc4' },
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: '#667788' }}>{m.label}</span>
            <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* === MODEL SWITCHER (bottom right) === */}
      <div style={{
        position: 'absolute', right: 20, bottom: 50, zIndex: 20,
        display: 'flex', gap: 8,
      }}>
        {Object.keys(models).map(key => (
          <button key={key} onClick={() => setModel(key)} style={{
            padding: '6px 14px',
            background: model === key ? 'rgba(68,136,255,0.2)' : 'rgba(5,10,30,0.6)',
            border: `1px solid ${model === key ? 'rgba(68,136,255,0.4)' : 'rgba(68,136,255,0.1)'}`,
            borderRadius: 6, color: model === key ? '#6699ff' : '#445566',
            fontSize: 10, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}>
            {key}
          </button>
        ))}
      </div>

      {/* === BOTTOM LEGEND === */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 28px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
        display: 'flex', justifyContent: 'center', gap: 28, zIndex: 20,
      }}>
        {[
          { name: 'Intelligence', count: 9, color: '#00e5ff' },
          { name: 'Proposal', count: 11, color: '#daa520' },
          { name: 'Operations', count: 7, color: '#4ecdc4' },
          { name: 'Research', count: 7, color: '#e8834a' },
          { name: 'Executive', count: 4, color: '#9b59b6' },
          { name: 'Meta', count: 5, color: '#ff6b6b' },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 4px ${c.color}50` }} />
            <span style={{ fontSize: 9, color: '#556677' }}>{c.name}</span>
            <span style={{ fontSize: 9, color: '#334455' }}>({c.count})</span>
          </div>
        ))}
      </div>

      {/* === ANIMATIONS === */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--opacity, 0.2); }
          90% { opacity: var(--opacity, 0.2); }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${20 + Math.random() * 30}px); opacity: 0; }
        }
        @keyframes pulseRing {
          0%, 100% { opacity: var(--base-opacity, 0.15); transform: translateX(-50%) perspective(800px) rotateX(75deg) scale(1); }
          50% { opacity: calc(var(--base-opacity, 0.15) * 1.5); transform: translateX(-50%) perspective(800px) rotateX(75deg) scale(1.03); }
        }
        @keyframes streamPulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.2; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 12px #4488ff, 0 0 4px #88aaff; }
          50% { opacity: 0.6; box-shadow: 0 0 6px #4488ff; }
        }
      `}</style>
    </div>
  )
}
