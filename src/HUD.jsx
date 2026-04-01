import React from 'react'

const panelStyle = {
  background: 'rgba(5, 10, 30, 0.7)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(68, 136, 255, 0.15)',
  borderRadius: 8,
  padding: '12px 16px',
  color: '#88aadd',
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  fontSize: 11,
}

const glowDot = (color, size = 6) => ({
  width: size, height: size, borderRadius: '50%',
  background: color, boxShadow: `0 0 ${size}px ${color}`,
  display: 'inline-block',
})

export function HUD() {
  return (
    <>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '14px 24px',
        background: 'rgba(2, 2, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(68, 136, 255, 0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={glowDot('#4488ff', 8)} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, color: '#6699ff' }}>
            HGI ORGANISM
          </span>
          <span style={{ fontSize: 10, color: '#334466', letterSpacing: 2, marginLeft: 8 }}>
            NEURAL CORE v3.4
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={glowDot('#00cc88', 5)} />
            <span style={{ fontSize: 10, color: '#448866', letterSpacing: 1 }}>MESH ACTIVE</span>
          </div>
          <div style={{ fontSize: 10, color: '#445566', fontFamily: 'monospace' }}>
            43 AGENTS &middot; 380+ PATHS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 9, color: '#556677', letterSpacing: 1 }}>HEALTH</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#4488ff', textShadow: '0 0 20px rgba(68,136,255,0.5)' }}>87</span>
          </div>
        </div>
      </div>

      {/* Left panel - Agent Clusters */}
      <div style={{
        ...panelStyle,
        position: 'absolute', left: 20, top: 80, width: 180, zIndex: 10,
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#4466aa', marginBottom: 10, fontWeight: 700 }}>
          AGENT CLUSTERS
        </div>
        {[
          { name: 'Intelligence', count: 9, color: '#00e5ff', active: 8 },
          { name: 'Proposal', count: 11, color: '#daa520', active: 9 },
          { name: 'Operations', count: 7, color: '#4ecdc4', active: 7 },
          { name: 'Research', count: 7, color: '#e8834a', active: 6 },
          { name: 'Executive', count: 4, color: '#9b59b6', active: 4 },
          { name: 'Meta', count: 5, color: '#ff6b6b', active: 5 },
        ].map(c => (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={glowDot(c.color, 5)} />
              <span style={{ fontSize: 10, color: '#8899aa' }}>{c.name}</span>
            </div>
            <span style={{ fontSize: 9, color: c.color }}>{c.active}/{c.count}</span>
          </div>
        ))}
      </div>

      {/* Right panel - System Metrics */}
      <div style={{
        ...panelStyle,
        position: 'absolute', right: 20, top: 80, width: 180, zIndex: 10,
      }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: '#4466aa', marginBottom: 10, fontWeight: 700 }}>
          SYSTEM METRICS
        </div>
        {[
          { label: 'Memory Records', value: '5,426', color: '#4488ff' },
          { label: 'Active Pipeline', value: '7', color: '#00cc88' },
          { label: 'Pursuing', value: '3', color: '#daa520' },
          { label: 'Last Cycle', value: '12m ago', color: '#8899aa' },
          { label: 'OPI Range', value: '72-94', color: '#4ecdc4' },
        ].map(m => (
          <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: '#667788' }}>{m.label}</span>
            <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 24px',
        background: 'rgba(2, 2, 16, 0.7)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(68, 136, 255, 0.08)',
        display: 'flex', justifyContent: 'center', gap: 28,
        zIndex: 10,
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
            <div style={glowDot(c.color, 5)} />
            <span style={{ fontSize: 9, color: '#556677' }}>{c.name}</span>
            <span style={{ fontSize: 9, color: '#334455' }}>({c.count})</span>
          </div>
        ))}
      </div>
    </>
  )
}
