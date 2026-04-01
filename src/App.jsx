import React, { useEffect, useRef, useState } from 'react'

export default function App() {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(new Date())
  const [thoughtIdx, setThoughtIdx] = useState(0)

  const THOUGHTS = [
    { agent: 'Intelligence Engine', text: 'Scanning DR-4900 Louisiana federal register...', color: '#00e5ff' },
    { agent: 'Proposal Writer', text: 'Drafting Section 3.2 — Technical Approach', color: '#daa520' },
    { agent: 'Competitive Intel', text: 'Civix/CCG confirmed bidding JP SOQ', color: '#e8834a' },
    { agent: 'Self-Awareness', text: 'Mesh health 94%. Proposal output +340%', color: '#ff6b6b' },
    { agent: 'CRM Agent', text: 'Donna Evans — no contact in 14 days', color: '#00e5ff' },
    { agent: 'Red Team', text: 'Weakness: no local office ref in JP SOQ', color: '#daa520' },
    { agent: 'Pipeline Scanner', text: 'JP SOQ deadline: 8 days — escalating', color: '#4ecdc4' },
    { agent: 'Winnability', text: 'NOLA PWIN revised to 88% — incumbent edge', color: '#00e5ff' },
  ]

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    const t2 = setInterval(() => setThoughtIdx(i => (i + 1) % 8), 3500)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`
    const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;

    #define MAX_STEPS 100
    #define MAX_DIST 60.0
    #define SURF_DIST 0.003
    #define PI 3.14159265

    vec3 hash33(vec3 p3){
      p3=fract(p3*vec3(.1031,.1030,.0973));
      p3+=dot(p3,p3.yxz+33.33);
      return fract((p3.xxy+p3.yxx)*p3.zyx);
    }
    float noise(vec3 p){
      vec3 i=floor(p),f=fract(p);
      f=f*f*(3.0-2.0*f);
      return mix(mix(mix(dot(hash33(i+vec3(0,0,0))-.5,f-vec3(0,0,0)),
                        dot(hash33(i+vec3(1,0,0))-.5,f-vec3(1,0,0)),f.x),
                    mix(dot(hash33(i+vec3(0,1,0))-.5,f-vec3(0,1,0)),
                        dot(hash33(i+vec3(1,1,0))-.5,f-vec3(1,1,0)),f.x),f.y),
                mix(mix(dot(hash33(i+vec3(0,0,1))-.5,f-vec3(0,0,1)),
                        dot(hash33(i+vec3(1,0,1))-.5,f-vec3(1,0,1)),f.x),
                    mix(dot(hash33(i+vec3(0,1,1))-.5,f-vec3(0,1,1)),
                        dot(hash33(i+vec3(1,1,1))-.5,f-vec3(1,1,1)),f.x),f.y),f.z);
    }

    float brainSDF(vec3 p){
      float angle = u_time * 0.12;
      float ca=cos(angle),sa=sin(angle);
      p.xz = mat2(ca,-sa,sa,ca) * p.xz;
      vec3 bp = p / vec3(1.55, 0.95, 1.2);
      float base = length(bp) - 1.0;
      if(p.y < -0.35) base += (p.y + 0.35) * 0.6;
      // Frontal lobe bulge
      if(bp.z < -0.3) base -= 0.05;
      // Central fissure - deeper
      base += exp(-p.z*p.z*12.0) * 0.15;
      // Multi-octave folds - sharper
      float folds = noise(p * 2.5 + u_time * 0.04) * 0.18;
      folds += noise(p * 5.0 + u_time * 0.025) * 0.09;
      folds += noise(p * 10.0 + u_time * 0.015) * 0.045;
      folds += noise(p * 20.0 + u_time * 0.01) * 0.02;
      // Lateral fissures
      float lat = exp(-(p.y+0.05)*(p.y+0.05)*8.0) * exp(-(abs(p.z)-0.55)*(abs(p.z)-0.55)*4.0) * 0.1;
      return base + folds - lat;
    }

    vec3 getNormal(vec3 p){
      float e=0.001;
      return normalize(vec3(
        brainSDF(p+vec3(e,0,0))-brainSDF(p-vec3(e,0,0)),
        brainSDF(p+vec3(0,e,0))-brainSDF(p-vec3(0,e,0)),
        brainSDF(p+vec3(0,0,e))-brainSDF(p-vec3(0,0,e))
      ));
    }

    float rayMarch(vec3 ro, vec3 rd){
      float d=0.0;
      for(int i=0;i<MAX_STEPS;i++){
        vec3 p=ro+rd*d;
        float ds=brainSDF(p);
        d+=ds*0.8; // slower stepping for better quality
        if(ds<SURF_DIST||d>MAX_DIST) break;
      }
      return d;
    }

    // VOLUMETRIC BRAIN - the core visual
    vec3 volumetricBrain(vec3 ro, vec3 rd){
      vec3 glow = vec3(0.0);
      for(int i=0;i<60;i++){
        float t = float(i) * 0.12;
        vec3 p = ro + rd * t;
        float dist = brainSDF(p);
        
        if(dist < 0.8){
          float density = exp(-dist * 4.0) * 0.035;
          
          // Rich blue-purple base
          float h = (p.y + 1.0) / 2.0;
          vec3 col = mix(
            vec3(0.08, 0.1, 0.6),   // deep indigo
            vec3(0.5, 0.15, 0.7),    // rich purple
            h
          );
          // Add magenta on edges
          col = mix(col, vec3(0.7, 0.1, 0.5), smoothstep(0.0, 0.4, dist));
          
          // NEURAL FIRES - multiple frequencies, bright
          float fire1 = pow(max(0.0,
            sin(p.x*2.5+u_time*2.5)*
            sin(p.y*3.0+u_time*1.8)*
            sin(p.z*2.8+u_time*1.3)), 3.0);
          float fire2 = pow(max(0.0,
            sin(p.x*1.5-u_time*1.0)*
            sin(p.y*2.0+u_time*2.0)*
            sin(p.z*1.8-u_time*1.5)), 3.0);
          float fire3 = pow(max(0.0,
            sin(p.x*3.5+u_time*1.2)*
            sin(p.y*1.2-u_time*0.8)*
            sin(p.z*2.2+u_time*2.2)), 4.0);
          
          // Bright cyan neural pulses
          col += vec3(0.2, 0.8, 1.0) * fire1 * 6.0;
          // Hot white-pink sparks
          col += vec3(1.0, 0.6, 0.8) * fire2 * 5.0;
          // Orange-gold hotspots
          col += vec3(1.0, 0.5, 0.1) * fire3 * 4.0;
          
          // Internal neural pathways - thin bright lines
          float paths = pow(abs(sin(p.x*8.0+p.y*5.0+u_time*0.5)*sin(p.z*7.0-u_time*0.3)), 12.0);
          col += vec3(0.5, 0.9, 1.0) * paths * 3.0;
          
          // Holographic scanlines
          float scan = sin(p.y * 25.0 + u_time * 3.0) * 0.5 + 0.5;
          col *= 0.6 + scan * 0.4;
          
          glow += col * density;
        }
        if(t > 10.0) break;
      }
      return glow;
    }

    // ENERGY BEAM - dramatic
    vec3 energyBeam(vec3 ro, vec3 rd){
      vec3 beam = vec3(0.0);
      for(float t=0.0;t<12.0;t+=0.15){
        vec3 p = ro + rd * t;
        float r = length(p.xz);
        float y = p.y;
        if(y > -3.5 && y < 2.5){
          // Core beam
          float core = exp(-r * 30.0) * 0.06;
          float scroll = sin(y * 20.0 - u_time * 6.0) * 0.5 + 0.5;
          core *= (0.3 + scroll * 0.7);
          beam += vec3(0.4, 0.7, 1.0) * core;
          beam += vec3(1.0, 1.0, 1.0) * exp(-r * 60.0) * 0.03 * scroll;
          
          // Wide glow
          float wide = exp(-r * 5.0) * 0.008;
          beam += vec3(0.15, 0.3, 0.8) * wide;
          
          // Spiraling energy
          float spiral = sin(atan(p.z, p.x) * 3.0 + y * 4.0 - u_time * 3.0);
          beam += vec3(0.2, 0.5, 1.0) * exp(-r * 12.0) * max(0.0, spiral) * 0.02;
        }
      }
      return beam;
    }

    // PLATFORM - bright rings, rotating elements
    vec3 platformGlow(vec3 ro, vec3 rd){
      vec3 glow = vec3(0.0);
      float t = (-3.0 - ro.y) / rd.y;
      if(t > 0.0){
        vec3 p = ro + rd * t;
        float r = length(p.xz);
        float angle = atan(p.z, p.x);
        
        // Bright concentric rings
        for(float i=0.0;i<8.0;i++){
          float ri = i * 0.6 + 1.2;
          float ringDist = abs(r - ri);
          float intensity = exp(-ringDist * 60.0) * (0.5 - i * 0.04);
          vec3 col = mix(vec3(0.0, 0.7, 1.0), vec3(0.4, 0.2, 0.9), i/8.0);
          // Pulse each ring
          float pulse = sin(u_time * 1.5 + i * 0.5) * 0.3 + 0.7;
          glow += col * intensity * pulse;
        }
        
        // Grid
        float gx = step(0.96, fract(p.x * 2.5));
        float gz = step(0.96, fract(p.z * 2.5));
        glow += vec3(0.05, 0.15, 0.35) * (gx + gz) * exp(-r * 0.1) * 0.5;
        
        // Radial lines
        float radial = step(0.985, fract(angle * 12.0 / (2.0 * PI)));
        glow += vec3(0.08, 0.2, 0.4) * radial * exp(-r * 0.06) * 0.8;
        
        // Rotating scan beam
        float scanAngle = mod(u_time * 0.4, 2.0 * PI);
        float scanDist = abs(mod(angle - scanAngle + PI, 2.0*PI) - PI);
        glow += vec3(0.15, 0.4, 0.8) * exp(-scanDist * 4.0) * exp(-r * 0.05) * 0.6;
        
        // Inner bright disc
        glow += vec3(0.1, 0.25, 0.5) * exp(-r * 0.8) * 0.3;
        
        // Outer fade
        glow *= smoothstep(6.0, 4.0, r);
      }
      return glow;
    }

    // FLOATING PARTICLES
    vec3 particles(vec3 ro, vec3 rd){
      vec3 col = vec3(0.0);
      for(int i=0;i<30;i++){
        vec3 ppos = hash33(vec3(float(i)*1.23, float(i)*2.45, float(i)*3.67)) * 12.0 - 6.0;
        ppos.y += sin(u_time * 0.3 + float(i)) * 1.5;
        ppos.x += cos(u_time * 0.2 + float(i) * 0.7) * 0.8;
        
        // Distance from ray to particle
        vec3 op = ppos - ro;
        float t = dot(op, rd);
        if(t < 0.0) continue;
        vec3 closest = ro + rd * t;
        float dist = length(closest - ppos);
        
        if(dist < 0.15){
          float brightness = exp(-dist * 30.0) * 0.3;
          vec3 pcol = (float(i % 3) == 0.0) ? vec3(1.0, 0.5, 0.2) :
                      (float(i % 3) == 1.0) ? vec3(0.3, 0.7, 1.0) :
                                               vec3(0.7, 0.3, 1.0);
          col += pcol * brightness;
        }
      }
      return col;
    }

    // Stars
    vec3 stars(vec3 rd){
      float star = pow(max(0.0, noise(rd * 200.0)), 25.0) * 0.4;
      return vec3(0.5, 0.6, 0.9) * star;
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
      
      float camDist = 5.0;
      float camY = 0.6 + sin(u_time * 0.08) * 0.3;
      vec3 ro = vec3(sin(u_time*0.06)*camDist, camY, cos(u_time*0.06)*camDist);
      vec3 target = vec3(0.0, -0.2, 0.0);
      
      vec3 f = normalize(target - ro);
      vec3 r = normalize(cross(vec3(0,1,0), f));
      vec3 u = cross(f, r);
      vec3 rd = normalize(f + uv.x * r + uv.y * u);
      
      // Background
      vec3 col = vec3(0.005, 0.005, 0.025);
      col += stars(rd);
      
      // Volumetric brain
      col += volumetricBrain(ro, rd);
      
      // Surface fresnel
      float d = rayMarch(ro, rd);
      if(d < MAX_DIST){
        vec3 p = ro + rd * d;
        if(brainSDF(p) < SURF_DIST * 2.0){
          vec3 n = getNormal(p);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 2.5);
          // Blue-purple fresnel
          col += vec3(0.3, 0.4, 1.0) * fresnel * 3.0;
          col += vec3(0.7, 0.3, 0.9) * pow(fresnel, 3.0) * 2.0;
          col += vec3(1.0) * pow(fresnel, 8.0) * 1.5;
        }
      }
      
      // Platform
      col += platformGlow(ro, rd);
      
      // Energy beam
      col += energyBeam(ro, rd);
      
      // Particles
      col += particles(ro, rd);
      
      // Vignette
      vec2 vuv = gl_FragCoord.xy / u_resolution.xy;
      col *= 1.0 - 0.5 * pow(length(vuv - 0.5), 2.0);
      
      // Subtle scanlines
      col *= 0.96 + 0.04 * sin(gl_FragCoord.y * 1.2);
      
      // Tone mapping + gamma
      col = col / (0.8 + col);
      col = pow(col, vec3(0.9));
      
      gl_FragColor = vec4(col, 1.0);
    }`

    function compileShader(src, type) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(s))
        return null
      }
      return s
    }

    const vShader = compileShader(vs, gl.VERTEX_SHADER)
    const fShader = compileShader(fs, gl.FRAGMENT_SHADER)
    if (!vShader || !fShader) { console.error('Shader compilation failed'); return }

    const prog = gl.createProgram()
    gl.attachShader(prog, vShader)
    gl.attachShader(prog, fShader)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error('Link error:', gl.getProgramInfoLog(prog)); return }
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pLoc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(pLoc)
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')

    const startTime = Date.now()
    let animId
    function render() {
      gl.uniform1f(uTime, (Date.now() - startTime) / 1000)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }
    render()

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  const t = THOUGHTS[thoughtIdx]
  const prev = THOUGHTS[(thoughtIdx - 1 + THOUGHTS.length) % THOUGHTS.length]

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* TOP BAR */}
        <div style={{ padding: '14px 24px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4488ff', boxShadow: '0 0 15px #4488ff, 0 0 30px #4488ff44' }} />
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
              <span style={{ fontSize: 26, fontWeight: 800, color: '#4488ff', textShadow: '0 0 30px rgba(68,136,255,0.6)' }}>87</span>
            </div>
          </div>
        </div>

        {/* LEFT - CLUSTERS */}
        <div style={{ position: 'absolute', left: 16, top: 75, width: 195, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>AGENT CLUSTERS</div>
          {[
            { name: 'Intelligence', count: 9, active: 8, color: '#00e5ff' },
            { name: 'Proposal', count: 11, active: 9, color: '#daa520' },
            { name: 'Operations', count: 7, active: 7, color: '#4ecdc4' },
            { name: 'Research', count: 7, active: 6, color: '#e8834a' },
            { name: 'Executive', count: 4, active: 4, color: '#9b59b6' },
            { name: 'Meta', count: 5, active: 5, color: '#ff6b6b' },
          ].map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                <span style={{ fontSize: 10, color: '#7788aa' }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 30, height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${(c.active/c.count)*100}%`, height: '100%', background: c.color, borderRadius: 2, boxShadow: `0 0 4px ${c.color}` }} />
                </div>
                <span style={{ fontSize: 9, color: c.color, fontWeight: 600 }}>{c.active}/{c.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT - METRICS */}
        <div style={{ position: 'absolute', right: 16, top: 75, width: 195, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>SYSTEM METRICS</div>
          {[
            { label: 'Memory Records', value: '5,426', color: '#4488ff' },
            { label: 'Active Pipeline', value: '7 opps', color: '#00cc88' },
            { label: 'Pursuing', value: '3', color: '#daa520' },
            { label: 'Last Cycle', value: '12m ago', color: '#7788aa' },
            { label: 'OPI Range', value: '72 — 94', color: '#4ecdc4' },
            { label: 'Proposals Gen', value: '4', color: '#daa520' },
            { label: 'API Cost', value: '$0.42/day', color: '#7788aa' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#556677' }}>{m.label}</span>
              <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* BOTTOM LEFT - THOUGHT STREAM */}
        <div style={{ position: 'absolute', left: 16, bottom: 45, width: 340, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            <span>LIVE THOUGHT STREAM</span>
            <span style={{ color: '#ff4444', animation: 'blink 1s step-end infinite' }}>● LIVE</span>
          </div>
          <div style={{ opacity: 0.35, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: prev.color, fontWeight: 600 }}>{prev.agent}</div>
            <div style={{ fontSize: 10, color: '#667788', lineHeight: 1.4 }}>{prev.text}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: t.color, fontWeight: 600 }}>{t.agent}</div>
            <div style={{ fontSize: 10, color: '#99aabb', lineHeight: 1.4 }}>{t.text}</div>
          </div>
        </div>

        {/* BOTTOM RIGHT - PIPELINE */}
        <div style={{ position: 'absolute', right: 16, bottom: 45, width: 250, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
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
                <span style={{ fontSize: 9, color: p.color, letterSpacing: 0.5 }}>{p.stage}</span>
                <span style={{ fontSize: 11, color: '#4488ff', fontWeight: 700 }}>{p.opi}</span>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM LEGEND */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 28px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', justifyContent: 'center', gap: 24 }}>
          {[
            { name: 'Intelligence', color: '#00e5ff' },
            { name: 'Proposal', color: '#daa520' },
            { name: 'Operations', color: '#4ecdc4' },
            { name: 'Research', color: '#e8834a' },
            { name: 'Executive', color: '#9b59b6' },
            { name: 'Meta', color: '#ff6b6b' },
          ].map(c => (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: `0 0 4px ${c.color}` }} />
              <span style={{ fontSize: 9, color: '#445566' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  )
}
