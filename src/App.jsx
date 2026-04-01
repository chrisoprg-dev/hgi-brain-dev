import React, { useState, useEffect, useRef } from 'react'

const FONT = "'JetBrains Mono','SF Mono','Fira Code',monospace"

// Sketchfab brain models - best candidates
const BRAIN_MODELS = {
  hologram: '09d686a1a1f745cba6b2385d0c831214',      // Brain Hologram (117 likes)
  hologramAnim: '18e8505582aa46879acc9da891958677',   // Brain Hologram Animated
  brainLab: 'ebb30c663b1441799b0992aa497c7fe6',      // Brain Lab (82 likes)
  vrBrain: '285bbd0d6b9b4bb7bb988f8320cd4d30',       // VR Brain UI (211 likes)
  pointCloud: 'c427ea0aee214141a78eba37bf9b76bb',    // Brain Point Cloud (228 likes)
  fibreTracts: 'a7690bea66ba49239d58cd37c5ce76c9',   // Brain Fibre Tracts (103 likes)
}

// Using Brain Hologram as default
const BRAIN_ID = BRAIN_MODELS.hologram

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
  { agent: 'Intelligence Engine', text: 'Scanning DR-4900 Louisiana updates...', color: '#00e5ff' },
  { agent: 'Proposal Writer', text: '44K chars generated for JP SOQ', color: '#daa520' },
  { agent: 'CRM Agent', text: 'Donna Evans \u2014 JP Purchasing Director', color: '#00e5ff' },
  { agent: 'Red Team', text: 'St. George: FEMA PA methodology gap', color: '#e8834a' },
  { agent: 'Competitive Intel', text: 'Civix/CCG confirmed bidding JP SOQ', color: '#00e5ff' },
  { agent: 'Self-Awareness', text: '714 memories in 24h. Mesh at 94%.', color: '#ff6b6b' },
  { agent: 'Discovery', text: '3 new disaster declarations in service area', color: '#4ecdc4' },
  { agent: 'Financial Agent', text: 'DR-4900 comparable: $2.1M-$4.8M range', color: '#4ecdc4' },
  { agent: 'Staffing Plan', text: 'St. Mary requires 4 new positions', color: '#4ecdc4' },
  { agent: 'KB Agent', text: 'LOCD funding data indexed \u2014 7 new chunks', color: '#e8834a' },
]

const CLUSTERS = [
  { label: 'INTELLIGENCE', count: 9, color: '#00e5ff' },
  { label: 'PROPOSAL', count: 11, color: '#daa520' },
  { label: 'OPERATIONS', count: 7, color: '#4ecdc4' },
  { label: 'RESEARCH', count: 7, color: '#e8834a' },
  { label: 'EXECUTIVE', count: 4, color: '#9b59b6' },
  { label: 'META', count: 5, color: '#ff6b6b' },
]

function opiColor(o) {
  return o >= 90 ? '#00ff88' : o >= 80 ? '#00ccff' : o >= 70 ? '#daa520' : '#ff6b6b'
}

// Animated traces canvas overlay
function TracesOverlay() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext('2d')
    let running = true
    let spawnCD = 0

    const cx = () => canvas.width / 2
    const cy = () => canvas.height * 0.42

    // Cluster node screen positions (around the brain)
    const nodePositions = () => {
      const w = canvas.width, h = canvas.height
      const r = Math.min(w, h) * 0.35
      const c = { x: w/2, y: h * 0.42 }
      return [
        { x: c.x - r*0.75, y: c.y - r*0.55, color: '#00e5ff', label: 'INTELLIGENCE' },
        { x: c.x + r*0.75, y: c.y - r*0.55, color: '#daa520', label: 'PROPOSAL' },
        { x: c.x - r*0.85, y: c.y + r*0.35, color: '#4ecdc4', label: 'OPERATIONS' },
        { x: c.x + r*0.85, y: c.y + r*0.35, color: '#e8834a', label: 'RESEARCH' },
        { x: c.x, y: c.y + r*0.75, color: '#9b59b6', label: 'EXECUTIVE' },
        { x: c.x, y: c.y - r*0.75, color: '#ff6b6b', label: 'META' },
      ]
    }

    const animate = () => {
      if (!running) return
      const frame = ++frameRef.current
      const particles = particlesRef.current
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodePositions()
      const centerX = cx(), centerY = cy()

      // Draw traces from each node to center
      nodes.forEach((n, idx) => {
        const cpx = n.x + (centerX - n.x) * 0.5 + Math.sin(frame * 0.01 + idx) * 20
        const cpy = n.y + (centerY - n.y) * 0.5 + Math.cos(frame * 0.012 + idx) * 15

        // Wide glow
        ctx.globalAlpha = 0.06
        ctx.strokeStyle = n.color
        ctx.lineWidth = 16
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(n.x, n.y)
        ctx.quadraticCurveTo(cpx, cpy, centerX, centerY)
        ctx.stroke()

        // Medium
        ctx.globalAlpha = 0.15
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(n.x, n.y)
        ctx.quadraticCurveTo(cpx, cpy, centerX, centerY)
        ctx.stroke()

        // Core
        ctx.globalAlpha = 0.4
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(n.x, n.y)
        ctx.quadraticCurveTo(cpx, cpy, centerX, centerY)
        ctx.stroke()

        // Energy pulse on trace
        const pt = (frame * 0.004 + idx * 0.17) % 1
        const it = 1 - pt
        const px = it*it*n.x + 2*it*pt*cpx + pt*pt*centerX
        const py = it*it*n.y + 2*it*pt*cpy + pt*pt*centerY
        ctx.globalAlpha = 0.7
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 8)
        pg.addColorStop(0, '#ffffff')
        pg.addColorStop(0.4, n.color)
        pg.addColorStop(1, 'transparent')
        ctx.fillStyle = pg
        ctx.beginPath()
        ctx.arc(px, py, 8, 0, Math.PI * 2)
        ctx.fill()

        // Return pulse
        const p2 = (frame * 0.003 + idx * 0.17 + 0.5) % 1
        const p2x = p2*p2*n.x + 2*p2*(1-p2)*cpx + (1-p2)*(1-p2)*centerX
        const p2y = p2*p2*n.y + 2*p2*(1-p2)*cpy + (1-p2)*(1-p2)*centerY
        ctx.globalAlpha = 0.35
        const pg2 = ctx.createRadialGradient(p2x, p2y, 0, p2x, p2y, 5)
        pg2.addColorStop(0, n.color)
        pg2.addColorStop(1, 'transparent')
        ctx.fillStyle = pg2
        ctx.beginPath()
        ctx.arc(p2x, p2y, 5, 0, Math.PI * 2)
        ctx.fill()

        // Draw cluster node orb
        const breathe = 1 + Math.sin(frame * 0.02 + idx * 2) * 0.08
        const nr = 20 * breathe

        ctx.globalAlpha = 0.1
        const h = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, nr * 2.5)
        h.addColorStop(0, n.color)
        h.addColorStop(1, 'transparent')
        ctx.fillStyle = h
        ctx.beginPath()
        ctx.arc(n.x, n.y, nr * 2.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = 0.7
        const g = ctx.createRadialGradient(n.x - nr*0.2, n.y - nr*0.25, nr*0.1, n.x, n.y, nr)
        g.addColorStop(0, '#ffffff')
        g.addColorStop(0.35, n.color)
        g.addColorStop(0.8, n.color + 'aa')
        g.addColorStop(1, n.color + '44')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(n.x, n.y, nr, 0, Math.PI * 2)
        ctx.fill()

        // Ring
        ctx.globalAlpha = 0.35
        ctx.strokeStyle = n.color
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(n.x, n.y, nr + 4, 0, Math.PI * 2)
        ctx.stroke()

        // Label
        ctx.globalAlpha = 0.6
        ctx.fillStyle = n.color
        ctx.font = 'bold 10px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(n.label, n.x, n.y + nr + 18)
      })

      // Spawn free particles
      if (++spawnCD > 4) {
        spawnCD = 0
        const n = nodes[Math.floor(Math.random() * nodes.length)]
        const toCenter = Math.random() > 0.3
        const gold = Math.random() > 0.6
        particles.push({
          fx: toCenter ? n.x : centerX, fy: toCenter ? n.y : centerY,
          tx: toCenter ? centerX : n.x, ty: toCenter ? centerY : n.y,
          cpx: n.x + (centerX - n.x) * 0.5 + Math.sin(Math.random() * 6) * 25,
          cpy: n.y + (centerY - n.y) * 0.5 + Math.cos(Math.random() * 6) * 20,
          t: 0, speed: 0.004 + Math.random() * 0.007,
          color: gold ? '#daa520' : n.color,
          size: gold ? 3 : 2,
        })
      }

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.t += p.speed
        if (p.t >= 1) { particles.splice(i, 1); continue }
        const t = p.t, it2 = 1 - t
        const x = it2*it2*p.fx + 2*it2*t*p.cpx + t*t*p.tx
        const y = it2*it2*p.fy + 2*it2*t*p.cpy + t*t*p.ty
        const a = t < 0.1 ? t/0.1 : t > 0.85 ? (1-t)/0.15 : 1
        ctx.globalAlpha = a * 0.2
        ctx.fillStyle = p.color
        ctx.beginPath(); ctx.arc(x, y, p.size * 4, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = a * 0.9
        ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = a
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(x, y, p.size * 0.35, 0, Math.PI * 2); ctx.fill()
      }

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }
    animate()
    return () => { running = false; window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
    />
  )
}

export default function App() {
  const [time, setTime] = useState(new Date())
  const [feedIdx, setFeedIdx] = useState(0)
  const [brainModel, setBrainModel] = useState('hologram')

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    const t2 = setInterval(() => setFeedIdx(i => (i + 1) % FEED.length), 3000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const P = {
    background: 'rgba(4,7,20,0.82)',
    border: '1px solid rgba(68,136,255,0.1)',
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  }

  const brainId = BRAIN_MODELS[brainModel]
  const embedUrl = `https://sketchfab.com/models/${brainId}/embed?autostart=1&transparent=1&ui_animations=0&ui_infos=0&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0&preload=1&camera=0&ui_controls=0&ui_fadeout=0&dnt=1`

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#030510', overflow: 'hidden', position: 'relative', fontFamily: FONT, color: '#c0ccdd' }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&display=swap" rel="stylesheet" />
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>

      {/* Sketchfab brain - centered, contained */}
      <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%, -50%)', width: '55vmin', height: '55vmin', zIndex: 1 }}>
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
      {/* Dark vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 50% 42%, transparent 15%, rgba(3,5,16,0.5) 35%, rgba(3,5,16,0.95) 60%)',
      }} />

      {/* Animated traces + cluster nodes */}
      <TracesOverlay />

      {/* Header */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(3,5,16,0.9), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 12px #00ff88' }} />
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 5, color: '#7788aa' }}>HGI ORGANISM</span>
          <span style={{ fontSize: 9, color: '#334455', letterSpacing: 2 }}>NEURAL OPERATIONS HUB</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Brain model switcher */}
          <select
            value={brainModel}
            onChange={e => setBrainModel(e.target.value)}
            style={{ background: 'rgba(4,7,20,0.8)', border: '1px solid rgba(68,136,255,0.15)', borderRadius: 4, color: '#4488ff', fontSize: 8, padding: '2px 6px', fontFamily: FONT, cursor: 'pointer' }}
          >
            <option value="hologram">Brain: Hologram</option>
            <option value="hologramAnim">Brain: Hologram Animated</option>
            <option value="brainLab">Brain: Lab</option>
            <option value="vrBrain">Brain: VR Interface</option>
            <option value="pointCloud">Brain: Point Cloud</option>
            <option value="fibreTracts">Brain: Fibre Tracts</option>
          </select>
          <span style={{ fontSize: 10, color: '#334455' }}>{time.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Left Panel: Pipeline */}
      <div style={{ position: 'absolute', left: 12, top: 50, width: 190, zIndex: 10, ...P, padding: 10, maxHeight: '50%', overflowY: 'auto' }}>
        <div style={{ fontSize: 8, letterSpacing: 2, color: '#4466aa', fontWeight: 700, marginBottom: 8 }}>ACTIVE PIPELINE</div>
        {PIPELINE.map((p, i) => {
          const urgent = p.due === 'Apr 9'
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, padding: '5px 6px', borderRadius: 5, background: 'rgba(255,255,255,0.02)', border: urgent ? '1px solid rgba(255,68,68,0.15)' : '1px solid transparent', cursor: 'pointer' }}>
              <span style={{ background: opiColor(p.opi), color: '#000', fontWeight: 800, fontSize: 9, padding: '1px 5px', borderRadius: 3, minWidth: 22, textAlign: 'center' }}>{p.opi}</span>
              <div>
                <div style={{ fontSize: 9, color: '#8899aa', fontWeight: 600 }}>{p.short}</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span style={{ fontSize: 7, color: p.stage === 'pursuing' ? '#00ccff' : p.stage === 'submitted' ? '#9b59b6' : '#667788', textTransform: 'uppercase', letterSpacing: 1 }}>{p.stage}</span>
                  {p.due && <span style={{ fontSize: 7, color: urgent ? '#ff4444' : '#556677' }}>{p.due}</span>}
                  {p.tag && <span style={{ fontSize: 7, color: p.tag === 'URGENT' ? '#ff4444' : p.tag === 'INCUMBENT' ? '#00ff88' : '#9b59b6', fontWeight: 700 }}>{p.tag}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right Panel: Thought Stream */}
      <div style={{ position: 'absolute', right: 12, top: 50, width: 210, zIndex: 10, ...P, padding: 10, maxHeight: '55%', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 8, letterSpacing: 2, color: '#4466aa', fontWeight: 700 }}>THOUGHT STREAM</span>
          <span style={{ fontSize: 8, color: '#ff3333', animation: 'blink 1s step-end infinite' }}>\u25cf LIVE</span>
        </div>
        {[...Array(7)].map((_, i) => {
          const f = FEED[(feedIdx + i) % FEED.length]
          return (
            <div key={i} style={{ marginBottom: 10, opacity: 1 - i * 0.1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: f.color }} />
                <span style={{ fontSize: 8, color: f.color, fontWeight: 600 }}>{f.agent}</span>
              </div>
              <div style={{ fontSize: 8, color: '#667788', lineHeight: 1.5, paddingLeft: 8 }}>{f.text}</div>
            </div>
          )
        })}
      </div>

      {/* Bottom: Stats + Legend */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '8px 20px', background: 'linear-gradient(to top, rgba(3,5,16,0.9), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {CLUSTERS.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color, boxShadow: '0 0 4px ' + c.color }} />
              <span style={{ fontSize: 8, color: '#556677' }}>{c.label} <span style={{ color: c.color }}>({c.count})</span></span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ fontSize: 8, color: '#334455' }}>Memories: <span style={{ color: '#4488ff' }}>5,546</span></span>
          <span style={{ fontSize: 8, color: '#334455' }}>24h: <span style={{ color: '#00ff88' }}>714</span></span>
          <span style={{ fontSize: 8, color: '#334455' }}>Rivals: <span style={{ color: '#e8834a' }}>47</span></span>
          <span style={{ fontSize: 8, color: '#334455' }}>Next: <span style={{ color: '#ff4444' }}>JP SOQ Apr 9</span></span>
        </div>
      </div>
    </div>
  )
}
