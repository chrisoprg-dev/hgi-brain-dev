import React, { useEffect, useRef, useState } from 'react'

export default function App() {
  const canvasRef = useRef(null)
  const [time, setTime] = useState(new Date())
  const [tIdx, setTIdx] = useState(0)
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
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
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

    // Fullscreen quad
    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`
    const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    #define MAX_STEPS 80
    #define MAX_DIST 50.0
    #define SURF_DIST 0.005
    #define PI 3.14159265

    // Noise functions
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
    float fbm(vec3 p){
      float v=0.0,a=0.5;
      for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
      return v;
    }

    // Brain SDF - ellipsoid with noise displacement for folds
    float brainSDF(vec3 p){
      // Rotate slowly
      float angle = u_time * 0.15;
      float ca=cos(angle),sa=sin(angle);
      p.xz = mat2(ca,-sa,sa,ca) * p.xz;

      // Brain proportions: wide, short, deep
      vec3 bp = p / vec3(1.6, 1.0, 1.2);
      float base = length(bp) - 1.0;
      
      // Flatten bottom
      if(p.y < -0.3) base += (p.y + 0.3) * 0.5;
      
      // Central fissure
      base += exp(-p.z*p.z*8.0) * 0.12;
      
      // Sulci folds via multi-octave noise
      float folds = noise(p * 3.0 + u_time * 0.05) * 0.15;
      folds += noise(p * 6.0 + u_time * 0.03) * 0.07;
      folds += noise(p * 12.0 + u_time * 0.02) * 0.035;
      
      // Lateral fissure
      float lateral = exp(-(p.y+0.1)*(p.y+0.1)*6.0) * exp(-(abs(p.z)-0.6)*(abs(p.z)-0.6)*3.0) * 0.08;
      
      return base + folds - lateral;
    }

    // Platform rings SDF
    float platformSDF(vec3 p){
      p.y += 2.0;
      float d = abs(p.y) - 0.01;
      float r = length(p.xz);
      // Concentric rings
      float rings = 1e10;
      for(float i=1.0;i<7.0;i++){
        float ri = i * 0.5 + 1.0;
        rings = min(rings, abs(r - ri) - 0.015);
      }
      return max(d, rings);
    }

    float sceneSDF(vec3 p){
      return min(brainSDF(p), platformSDF(p));
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
        float ds=sceneSDF(p);
        d+=ds;
        if(ds<SURF_DIST||d>MAX_DIST) break;
      }
      return d;
    }

    // Volumetric glow around the brain
    vec3 volumetricGlow(vec3 ro, vec3 rd){
      vec3 glow = vec3(0.0);
      float t = 0.0;
      for(int i=0;i<40;i++){
        t += 0.15;
        vec3 p = ro + rd * t;
        float dist = brainSDF(p);
        if(dist < 0.5){
          float intensity = exp(-dist * 3.5) * 0.05;
          
          // Neural activity pulses
          float fire = pow(max(0.0,
            sin(p.x*3.0+u_time*2.0)*
            sin(p.y*4.0+u_time*1.5)*
            sin(p.z*3.5+u_time*1.2)), 4.0);
          
          // Color based on position
          vec3 col = mix(
            vec3(0.08, 0.1, 0.6),  // deep blue
            vec3(0.5, 0.15, 0.7),  // purple
            smoothstep(-1.0, 1.0, p.y)
          );
          col += vec3(0.3, 0.7, 1.0) * fire * 5.0; // cyan neural fires
          col += vec3(1.0, 0.5, 0.2) * pow(fire, 2.0) * 3.5; // orange hotspots
          
          // Scanlines
          float scan = sin(p.y * 20.0 + u_time * 2.0) * 0.5 + 0.5;
          col *= 0.7 + scan * 0.3;
          
          glow += col * intensity;
        }
        if(t > 8.0) break;
      }
      return glow;
    }

    // Energy beam
    vec3 energyBeam(vec3 ro, vec3 rd){
      vec3 beam = vec3(0.0);
      for(float t=0.0;t<10.0;t+=0.2){
        vec3 p = ro + rd * t;
        float r = length(p.xz);
        float y = p.y;
        if(y > -2.5 && y < 2.0 && r < 0.3){
          float intensity = exp(-r * 15.0) * 0.03;
          float scroll = sin(y * 15.0 - u_time * 5.0) * 0.5 + 0.5;
          intensity *= (0.3 + scroll * 0.7);
          beam += vec3(0.2, 0.6, 1.0) * intensity;
        }
      }
      return beam;
    }

    // Platform glow
    vec3 platformGlow(vec3 ro, vec3 rd){
      vec3 glow = vec3(0.0);
      // Intersect y=-2 plane
      float t = (-2.0 - ro.y) / rd.y;
      if(t > 0.0){
        vec3 p = ro + rd * t;
        float r = length(p.xz);
        // Concentric rings
        for(float i=1.0;i<7.0;i++){
          float ri = i * 0.5 + 1.0;
          float ringDist = abs(r - ri);
          float intensity = exp(-ringDist * 40.0) * (0.45 - i * 0.04);
          vec3 col = mix(vec3(0.0, 0.6, 1.0), vec3(0.3, 0.3, 0.8), i/7.0);
          glow += col * intensity;
        }
        // Grid pattern
        float grid = step(0.97, fract(p.x * 3.0)) + step(0.97, fract(p.z * 3.0));
        glow += vec3(0.05, 0.15, 0.3) * grid * exp(-r * 0.15) * 0.3;
        // Radial lines
        float angle = atan(p.z, p.x);
        float radial = step(0.98, fract(angle * 8.0 / (2.0 * PI)));
        glow += vec3(0.05, 0.1, 0.2) * radial * exp(-r * 0.1) * 0.5;
        // Rotating scan
        float scanAngle = mod(u_time * 0.3, 2.0 * PI);
        float scanDist = abs(mod(angle - scanAngle + PI, 2.0*PI) - PI);
        glow += vec3(0.1, 0.3, 0.6) * exp(-scanDist * 5.0) * exp(-r * 0.08) * 0.4;
      }
      return glow;
    }

    // Background stars
    vec3 stars(vec3 rd){
      vec3 col = vec3(0.0);
      vec3 p = rd * 100.0;
      float star = pow(max(0.0, noise(p * 2.0)), 20.0) * 0.5;
      col += vec3(0.5, 0.6, 0.8) * star;
      return col;
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy - u_resolution.xy * 0.5) / u_resolution.y;
      
      // Camera
      float camDist = 5.5;
      float camY = 0.5 + sin(u_time * 0.1) * 0.3;
      vec3 ro = vec3(sin(u_time*0.08)*camDist, camY, cos(u_time*0.08)*camDist);
      vec3 target = vec3(0.0, 0.0, 0.0);
      
      vec3 f = normalize(target - ro);
      vec3 r = normalize(cross(vec3(0,1,0), f));
      vec3 u = cross(f, r);
      vec3 rd = normalize(f + uv.x * r + uv.y * u);
      
      // Render
      vec3 col = vec3(0.01, 0.01, 0.04); // deep space
      col += stars(rd);
      
      // Volumetric brain glow (the main visual)
      col += volumetricGlow(ro, rd);
      
      // Surface hit for fresnel
      float d = rayMarch(ro, rd);
      if(d < MAX_DIST){
        vec3 p = ro + rd * d;
        float brain = brainSDF(p);
        if(brain < SURF_DIST * 2.0){
          vec3 n = getNormal(p);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
          col += vec3(0.2, 0.5, 1.0) * fresnel * 3.0;
          col += vec3(1.0) * pow(fresnel, 4.0) * 1.8;
        }
      }
      
      // Platform
      col += platformGlow(ro, rd);
      
      // Energy beam
      col += energyBeam(ro, rd);
      
      // Vignette
      vec2 vuv = gl_FragCoord.xy / u_resolution.xy;
      col *= 1.0 - 0.4 * length(vuv - 0.5);
      
      // Scanline overlay
      col *= 0.95 + 0.05 * sin(gl_FragCoord.y * 1.5);
      
      // Tone mapping
      col = col / (1.0 + col);
      col = pow(col, vec3(0.85));
      
      gl_FragColor = vec4(col, 1.0);
    }`

    function compileShader(src, type) {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s))
        return null
      }
      return s
    }

    const vShader = compileShader(vs, gl.VERTEX_SHADER)
    const fShader = compileShader(fs, gl.FRAGMENT_SHADER)
    if (!vShader || !fShader) return

    const prog = gl.createProgram()
    gl.attachShader(prog, vShader)
    gl.attachShader(prog, fShader)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW)
    const pLoc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(pLoc)
    gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_resolution')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    let mouseX = 0.5, mouseY = 0.5
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth
      mouseY = 1.0 - e.clientY / window.innerHeight
    })

    const startTime = Date.now()
    let animId
    function render() {
      const t = (Date.now() - startTime) / 1000
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform2f(uMouse, mouseX, mouseY)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative', overflow: 'hidden', fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>
      {/* WebGL Canvas - the brain renderer */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1 }} />

      {/* HUD overlays on top */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* Top bar */}
        <div style={{ padding: '14px 24px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4488ff', boxShadow: '0 0 15px #4488ff' }} />
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

        {/* Left panel */}
        <div style={{ position: 'absolute', left: 16, top: 75, width: 195, pointerEvents: 'auto', background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
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
              <span style={{ fontSize: 9, color: c.color, fontWeight: 600 }}>{c.active}/{c.count}</span>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div style={{ position: 'absolute', right: 16, top: 75, width: 195, pointerEvents: 'auto', background: 'rgba(3,6,20,0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.1)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700 }}>SYSTEM METRICS</div>
          {[
            { label: 'Memory Records', value: '5,426', color: '#4488ff' },
            { label: 'Active Pipeline', value: '7', color: '#00cc88' },
            { label: 'Pursuing', value: '3', color: '#daa520' },
            { label: 'Last Cycle', value: '12m ago', color: '#7788aa' },
            { label: 'OPI Range', value: '72-94', color: '#4ecdc4' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#556677' }}>{m.label}</span>
              <span style={{ fontSize: 10, color: m.color, fontWeight: 600 }}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* BOTTOM LEFT - THOUGHT STREAM */}
        <div style={{ position: 'absolute', left: 16, bottom: 40, width: 340, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: '#3355aa', marginBottom: 10, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
            <span>LIVE THOUGHT STREAM</span>
            <span style={{ color: '#ff4444' }}>● LIVE</span>
          </div>
          <div style={{ opacity: 0.35, marginBottom: 8 }}>
            <div style={{ fontSize: 9, color: THOUGHTS[(tIdx-1+8)%8].color, fontWeight: 600 }}>{THOUGHTS[(tIdx-1+8)%8].agent}</div>
            <div style={{ fontSize: 10, color: '#667788', lineHeight: 1.4 }}>{THOUGHTS[(tIdx-1+8)%8].text}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: THOUGHTS[tIdx].color, fontWeight: 600 }}>{THOUGHTS[tIdx].agent}</div>
            <div style={{ fontSize: 10, color: '#99aabb', lineHeight: 1.4 }}>{THOUGHTS[tIdx].text}</div>
          </div>
        </div>

        {/* BOTTOM RIGHT - PIPELINE */}
        <div style={{ position: 'absolute', right: 16, bottom: 40, width: 250, pointerEvents: 'auto', background: 'rgba(3,6,20,0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(68,136,255,0.12)', borderRadius: 10, padding: '14px 16px' }}>
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
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: c.color, boxShadow: '0 0 4px ' + c.color }} />
              <span style={{ fontSize: 9, color: '#445566' }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
