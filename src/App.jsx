import React, { useState, useEffect, useRef } from 'react'

const MODELS = {
  'Hologram Brain': '09d686a1a1f745cba6b2385d0c831214',
  'Animated Hologram': '18e8505582aa46879acc9da891958677',
  'Neural Networks': 'fa48173d4532407c9c2a4ba06a9bcd2d',
  'Brain Lab': 'ebb30c663b1441799b0992aa497c7fe6',
  'Neural Network Viz': '6f36938d754746d9831e755f0e0460fd',
  'Neuron Cell': '01d20ef702ee41478a8bc1da8082e504',
  'Human Brain HD': '7a27c17fd6c0488bb31ab093236a47fb',
  'Brain HD 100K': 'c9c9d4d671b94345952d012cc2ea7a24',
}

const CLUSTERS = [
  { name: 'Intelligence', count: 9, active: 8, color: '#00e5ff' },
  { name: 'Proposal', count: 11, active: 9, color: '#daa520' },
  { name: 'Operations', count: 7, active: 7, color: '#4ecdc4' },
  { name: 'Research', count: 7, active: 6, color: '#e8834a' },
  { name: 'Executive', count: 4, active: 4, color: '#9b59b6' },
  { name: 'Meta', count: 5, active: 5, color: '#ff6b6b' },
]

const THOUGHTS = [
  { agent: 'Intelligence Engine', text: 'Scanning DR-4900 Louisiana federal register updates...', color: '#00e5ff' },
  { agent: 'Financial Agent', text: 'Recalculating NOLA pricing model against FEMA PA benchmarks', color: '#00e5ff' },
  { agent: 'Proposal Writer', text: 'Drafting Section 3.2 — Technical Approach for St. Mary Parish', color: '#daa520' },
  { agent: 'Red Team', text: 'Identified weakness: no local office reference in JP SOQ', color: '#daa520' },
  { agent: 'CRM Agent', text: 'Donna Evans (JP Purchasing) — no contact in 14 days', color: '#00e5ff' },
  { agent: 'Pipeline Scanner', text: 'JP SOQ 26-005 deadline: 8 days — escalating priority', color: '#4ecdc4' },
  { agent: 'Competitive Intel', text: 'Civix/CCG confirmed bidding JP SOQ — Go Grants platform threat', color: '#e8834a' },
  { agent: 'Self-Awareness', text: 'Mesh health: 94%. Proposal cluster output +340% this cycle.', color: '#ff6b6b' },
  { agent: 'Discovery', text: 'New FEMA DR-4912 declared — monitoring for HGI vertical match', color: '#00e5ff' },
  { agent: 'Winnability', text: 'NOLA PWIN revised to 88% — incumbent advantage confirmed', color: '#00e5ff' },
  { agent: 'Quality Gate', text: 'St. George proposal: 3 compliance gaps remaining', color: '#4ecdc4' },
  { agent: 'KB Agent', text: 'Road Home case study chunks matched to 4 active pursuits', color: '#e8834a' },
]

export default function App() {
  const [model, setModel] = useState('Hologram Brain')
  const [thoughtIdx, setThoughtIdx] = useState(0)
  const [health, setHealth] = useState(87)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t1 = setInterval(() => setThoughtIdx(i => (i + 1) % THOUGHTS.length), 3000)
    const t2 = setInterval(() => setTime(new Date()), 1000)
    const t3 = setInterval(() => setHealth(h => Math.max(80, Math.min(95, h + (Math.random() - 0.45) * 2))), 5000)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [])

  const embedUrl = `https://sketchfab.com/models/${MODELS[model]}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&transparent=1&camera=0`

  const currentThought = THOUGHTS[thoughtIdx]
  const prevThought = THOUGHTS[(thoughtIdx - 1 + THOUGHTS.length) % THOUGHTS.length]

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
      
      {/* === BACKGROUND GRADIENT === */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 55%, #080828 0%, #030310 40%, #000000 100%)', zIndex: 0 }} />

      {/* === SCANLINE OVERLAY === */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', background: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)', mixBlendMode: 'multiply' }} />

      {/* === HORIZONTAL SCAN SWEEP === */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 51, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(68,136,255,0.08), transparent)', animation: 'scanSweep 4s linear infinite' }} />
      </div>

      {/* === DATA STREAMS RADIATING === */}
      {Array.from({ length: 40 }, (_, i) => {
        const angle = i * 9 + Math.random() * 4
        const colors = ['#4488ff', '#6644ff', '#ff7744', '#00ccaa', '#8844ff']
        return <div key={`ds-${i}`} style={{
          position: 'absolute', top: '48%', left: '50%',
          width: 100 + Math.random() * 250, height: 1,
          background: `linear-gradient(90deg, ${colors[i % 5]}33, transparent)`,
          transform: `rotate(${angle}deg)`, transformOrigin: '0 0',
          animation: `streamPulse ${3 + Math.random() * 3}s ${Math.random() * 3}s ease-in-out infinite`,
          zIndex: 1, pointerEvents: 'none',
        }} />
      })}

      {/* === PLATFORM RINGS === */}
      {[140, 200, 280, 380, 500, 640, 800].map((r, i) => (
        <div key={`ring-${i}`} style={{
          position: 'absolute', bottom: '10%', left: '50%',
          transform: 'translateX(-50%) perspective(900px) rotateX(78deg)',
          width: r, height: r, borderRadius: '50%',
          border: `${i === 0 ? 2 : 1}px solid ${i % 2 === 0 ? 'rgba(0,136,255,0.3)' : 'rgba(68,68,204,0.2)'}`,
          boxShadow: i < 3 ? `0 0 20px rgba(0,136,255,0.15), inset 0 0 20px rgba(0,136,255,0.1)` : 'none',
          animation: `pulseRing ${3 + i * 0.5}s ${i * 0.2}s ease-in-out infinite`,
          zIndex: 2, pointerEvents: 'none',
        }} />
      ))}

      {/* === ROTATING RING === */}
      <div style={{
        position: 'absolute', bottom: '10%', left: '50%',
        transform: 'translateX(-50%) perspective(900px) rotateX(78deg)',
        width: 320, height: 320, borderRadius: '50%',
        border: '1px dashed rgba(0,170,255,0.2)',
        animation: 'spinRing 20s linear infinite',
        zIndex: 2, pointerEvents: 'none',
      }} />

      {/* === ENERGY BEAM === */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 2, height: '42%', background: 'linear-gradient(to top, #00aaff00, #00aaff66 20%, #00aaffcc 40%, #ffffff 50%, #00aaffcc 60%, #00aaff66 80%, #00aaff00)', boxShadow: '0 0 30px #00aaff55, 0 0 60px #00aaff33, 0 0 100px #00aaff22', zIndex: 3, pointerEvents: 'none', animation: 'beamPulse 2s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 50, height: '42%', background: 'linear-gradient(to top, transparent, rgba(0,100,255,0.04) 30%, rgba(0,100,255,0.08) 50%, rgba(0,100,255,0.04) 70%, transparent)', zIndex: 2, pointerEvents: 'none' }} />

      {/* === FLOATING PARTICLES === */}
      {Array.from({ length: 80 }, (_, i) => {
        const colors = ['#4488ff', '#8844ff', '#ff8844', '#00ccaa', '#ffffff']
        return <div key={`p-${i}`} style={{
          position: 'absolute', left: `${5 + Math.random() * 90}%`, bottom: '-3%',
          width: 1 + Math.random() * 3, height: 1 + Math.random() * 3,
          borderRadius: '50%', background: colors[i % 5],
          boxShadow: `0 0 ${4 + Math.random() * 6}px ${colors[i % 5]}`,
          opacity: 0.15 + Math.random() * 0.35,
          animation: `floatUp ${5 + Math.random() * 10}s ${Math.random() * 8}s linear infinite`,
          zIndex: 4, pointerEvents: 'none',
        }} />
      })}

      {/* === SKETCHFAB BRAIN (centerpiece) === */}
      <div style={{ position: 'absolute', top: '3%', left: '8%', width: '84%', height: '72%', zIndex: 10 }}>
        <iframe title="HGI Brain" src={embedUrl} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent' }} allow="autoplay; fullscreen; xr-spatial-tracking" allowFullScreen />
      </div>

      {/* === HUD TOP BAR === */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '14px 24px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4488ff', boxShadow: '0 0 15px #4488ff, 0 0 5px #88aaff', animation: 'statusPulse 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 6, color: '#6699ff', textShadow: '0 0 25px rgba(68,136,255,0.5)' }}>HGI ORGANISM</span>
          <span style={{ fontSize: 10, color: '#223355', letterSpacing: 2 }}>NEURAL CORE v3.4</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88' }} />
            <span style={{ fontSize: 10, color: '#33aa66' }}>MESH ACTIVE</span>
          </div>
          <span style={{ fontSize: 10, color: '#334455' }}>43 AGENTS · 380+ PATHS</span>
          <span style={{ fontSize: 10, color: '#334455' }}>{time.toLocaleTimeString()}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: '#445566', letterSpacing: 1 }}>HEALTH</span>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#4488ff', textShadow: '0 0 30px rgba(68,136,255,0.6)' }}>{Math.round(health)}</span>
          </div>
        </div>
      </div>

      {/* === LEFT PANEL — AGENT CLUSTERS === */}
      <div style={{ position: 'absolute', left: 16, top: 75, width: 195, zIndex: 30, background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>AGENT CLUSTERS</div>
        {CLUSTERS.map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
              <span style={{ fontSize: 10, color: '#7788aa' }}>{c.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 30, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(c.active / c.count) * 100}%`, height: '100%', background: c.color, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 9, color: c.color, fontWeight: 600, minWidth: 24, textAlign: 'right' }}>{c.active}/{c.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* === RIGHT PANEL — SYSTEM METRICS === */}
      <div style={{ position: 'absolute', right: 16, top: 75, width: 195, zIndex: 30, background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>SYSTEM METRICS</div>
        {[
          { label: 'Memory Records', value: '5,426', color: '#4488ff' },
          { label: 'Active Pipeline', value: '7 opps', color: '#00cc88' },
          { label: 'Pursuing', value: '3', color: '#daa520' },
          { label: 'Last Cycle', value: '12m ago', color: '#7788aa' },
          { label: 'OPI Range', value: '72 — 94', color: '#4ecdc4' },
          { label: 'API Cost', value: '$0.42/day', color: '#7788aa' },
          { label: 'Proposals Gen', value: '4', color: '#daa520' },
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#556677' }}>{m.label}</span>
            <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* === LEFT BOTTOM — LIVE THOUGHT STREAM === */}
      <div style={{ position: 'absolute', left: 16, bottom: 50, width: 320, zIndex: 30, background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
          <span>LIVE THOUGHT STREAM</span>
          <span style={{ color: '#ff4444', animation: 'blink 1s step-end infinite' }}>● LIVE</span>
        </div>
        {[prevThought, currentThought].map((t, i) => (
          <div key={i} style={{ marginBottom: 8, opacity: i === 0 ? 0.4 : 1, transition: 'opacity 0.5s' }}>
            <div style={{ fontSize: 9, color: t.color, fontWeight: 600, marginBottom: 2 }}>{t.agent}</div>
            <div style={{ fontSize: 10, color: '#8899aa', lineHeight: 1.4 }}>{t.text}</div>
          </div>
        ))}
      </div>

      {/* === RIGHT BOTTOM — PIPELINE SNAPSHOT === */}
      <div style={{ position: 'absolute', right: 16, bottom: 50, width: 240, zIndex: 30, background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>ACTIVE PIPELINE</div>
        {[
          { name: 'NOLA Water', opi: 94, stage: 'pursuing', color: '#00ff88' },
          { name: 'DR-4900 LA', opi: 92, stage: 'identified', color: '#4488ff' },
          { name: 'St. George', opi: 85, stage: 'watching', color: '#daa520' },
          { name: 'St. Mary', opi: 83, stage: 'pursuing', color: '#00ff88' },
          { name: 'JP SOQ', opi: 72, stage: 'pursuing', color: '#ff6644' },
        ].map(p => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: '#7788aa' }}>{p.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, color: p.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.stage}</span>
              <span style={{ fontSize: 11, color: '#4488ff', fontWeight: 700 }}>{p.opi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* === MODEL SWITCHER === */}
      <div style={{ position: 'absolute', top: 75, left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 500 }}>
        {Object.keys(MODELS).map(key => (
          <button key={key} onClick={() => setModel(key)} style={{
            padding: '4px 10px', background: model === key ? 'rgba(68,136,255,0.25)' : 'rgba(3,6,20,0.6)',
            border: `1px solid ${model === key ? 'rgba(68,136,255,0.5)' : 'rgba(68,136,255,0.08)'}`,
            borderRadius: 5, color: model === key ? '#88aaff' : '#334455',
            fontSize: 9, letterSpacing: 0.5, cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}>{key}</button>
        ))}
      </div>

      {/* === BOTTOM LEGEND === */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 28px', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', display: 'flex', justifyContent: 'center', gap: 24, zIndex: 30 }}>
        {CLUSTERS.map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 4px ${c.color}50` }} />
            <span style={{ fontSize: 9, color: '#445566' }}>{c.name}</span>
            <span style={{ fontSize: 9, color: '#223344' }}>({c.count})</span>
          </div>
        ))}
      </div>

      {/* === CSS ANIMATIONS === */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          5% { opacity: 0.3; }
          95% { opacity: 0.3; }
          100% { transform: translateY(-105vh); opacity: 0; }
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes streamPulse {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.2; }
        }
        @keyframes statusPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes beamPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes scanSweep {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes spinRing {
          0% { transform: translateX(-50%) perspective(900px) rotateX(78deg) rotate(0deg); }
          100% { transform: translateX(-50%) perspective(900px) rotateX(78deg) rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
