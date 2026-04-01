import React, { useEffect, useRef, useState } from 'react'

// Mini brain shader for center panel
function BrainCanvas() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return
    canvas.width = 500; canvas.height = 400
    gl.viewport(0, 0, 500, 400)

    const vs = `attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}`
    const fs = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    vec3 hash33(vec3 p3){p3=fract(p3*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yxx)*p3.zyx);}
    float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(dot(hash33(i)-.5,f),dot(hash33(i+vec3(1,0,0))-.5,f-vec3(1,0,0)),f.x),mix(dot(hash33(i+vec3(0,1,0))-.5,f-vec3(0,1,0)),dot(hash33(i+vec3(1,1,0))-.5,f-vec3(1,1,0)),f.x),f.y),mix(mix(dot(hash33(i+vec3(0,0,1))-.5,f-vec3(0,0,1)),dot(hash33(i+vec3(1,0,1))-.5,f-vec3(1,0,1)),f.x),mix(dot(hash33(i+vec3(0,1,1))-.5,f-vec3(0,1,1)),dot(hash33(i+vec3(1,1,1))-.5,f-vec3(1,1,1)),f.x),f.y),f.z);}
    float brainSDF(vec3 p){
      float a=u_time*0.15;float ca=cos(a),sa=sin(a);p.xz=mat2(ca,-sa,sa,ca)*p.xz;
      vec3 bp=p/vec3(1.5,0.95,1.2);float base=length(bp)-1.0;
      if(p.y<-0.3)base+=(p.y+0.3)*0.5;
      base+=exp(-p.z*p.z*10.0)*0.12;
      base+=noise(p*3.0+u_time*0.05)*0.15+noise(p*6.0+u_time*0.03)*0.07+noise(p*12.0)*0.035;
      return base;
    }
    vec3 getNormal(vec3 p){float e=0.001;return normalize(vec3(brainSDF(p+vec3(e,0,0))-brainSDF(p-vec3(e,0,0)),brainSDF(p+vec3(0,e,0))-brainSDF(p-vec3(0,e,0)),brainSDF(p+vec3(0,0,e))-brainSDF(p-vec3(0,0,e))));}
    void main(){
      vec2 uv=(gl_FragCoord.xy-u_resolution.xy*0.5)/u_resolution.y;
      vec3 ro=vec3(sin(u_time*0.08)*4.5,0.5,cos(u_time*0.08)*4.5);
      vec3 f=normalize(-ro),r=normalize(cross(vec3(0,1,0),f)),u=cross(f,r);
      vec3 rd=normalize(f+uv.x*r+uv.y*u);
      vec3 col=vec3(0.01,0.01,0.03);
      // Volumetric
      for(int i=0;i<35;i++){
        float t=float(i)*0.14;vec3 p=ro+rd*t;float dist=brainSDF(p);
        if(dist<0.6){
          float density=exp(-dist*3.5)*0.045;
          vec3 c=mix(vec3(0.08,0.1,0.55),vec3(0.45,0.12,0.65),(p.y+1.0)/2.0);
          float fire=pow(max(0.0,sin(p.x*2.5+u_time*2.0)*sin(p.y*3.0+u_time*1.5)*sin(p.z*2.8+u_time*1.0)),4.0);
          c+=vec3(0.3,0.7,1.0)*fire*5.0+vec3(1.0,0.5,0.2)*fire*fire*3.0;
          float scan=sin(p.y*20.0+u_time*2.5)*0.5+0.5;c*=0.7+scan*0.3;
          col+=c*density;
        }
        if(t>8.0)break;
      }
      // Surface fresnel
      float d=0.0;for(int i=0;i<60;i++){vec3 p=ro+rd*d;float ds=brainSDF(p);d+=ds*0.8;if(ds<0.003||d>40.0)break;}
      if(d<40.0){vec3 p=ro+rd*d;vec3 n=getNormal(p);float fr=pow(1.0-max(dot(n,-rd),0.0),2.5);col+=vec3(0.3,0.4,1.0)*fr*2.5+vec3(0.6,0.2,0.8)*pow(fr,3.0)*1.5;}
      // Platform rings
      float pt=(-1.8-ro.y)/rd.y;
      if(pt>0.0){vec3 pp=ro+rd*pt;float pr=length(pp.xz);
        for(float i=0.0;i<5.0;i++){float ri=i*0.5+1.0;col+=mix(vec3(0.0,0.5,1.0),vec3(0.3,0.2,0.7),i/5.0)*exp(-abs(pr-ri)*50.0)*(0.4-i*0.06);}
        col+=vec3(0.05,0.12,0.3)*exp(-pr*0.6)*0.4;
      }
      col=col/(0.8+col);col=pow(col,vec3(0.9));
      gl_FragColor=vec4(col,1.0);
    }`

    function cs(src,type){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));return null}return s}
    const v=cs(vs,gl.VERTEX_SHADER),f=cs(fs,gl.FRAGMENT_SHADER);if(!v||!f)return
    const prog=gl.createProgram();gl.attachShader(prog,v);gl.attachShader(prog,f);gl.linkProgram(prog);gl.useProgram(prog)
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
    const pL=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(pL);gl.vertexAttribPointer(pL,2,gl.FLOAT,false,0,0)
    const uT=gl.getUniformLocation(prog,'u_time'),uR=gl.getUniformLocation(prog,'u_resolution')
    const st=Date.now();let aid
    function render(){gl.uniform1f(uT,(Date.now()-st)/1000);gl.uniform2f(uR,500,400);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);aid=requestAnimationFrame(render)}
    render()
    return()=>cancelAnimationFrame(aid)
  },[])
  return <canvas ref={canvasRef} style={{width:'100%',height:'100%',borderRadius:12}} />
}

// Agent node component
function AgentNode({name,role,x,y,color,status,active}) {
  return (
    <div style={{position:'absolute',left:x,top:y,transform:'translate(-50%,-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:4,zIndex:5}}>
      <div style={{width:44,height:44,borderRadius:'50%',background:`radial-gradient(circle at 40% 35%, ${color}44, ${color}22)`,border:`2px solid ${color}66`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 0 15px ${color}33, inset 0 0 10px ${color}22`}}>
        <div style={{width:18,height:18,borderRadius:'50%',background:`${color}`,boxShadow:`0 0 8px ${color}`}} />
      </div>
      <span style={{fontSize:10,fontWeight:700,color:'#aabbcc',letterSpacing:1,textTransform:'uppercase',textShadow:'0 0 8px rgba(0,0,0,0.8)'}}>{name}</span>
      <span style={{fontSize:8,color:'#556677'}}>{role}</span>
    </div>
  )
}

// Connection line between two points
function Connection({x1,y1,x2,y2,color,animated}) {
  const mx=(x1+x2)/2, my=(y1+y2)/2-20
  return (
    <svg style={{position:'absolute',inset:0,zIndex:2,pointerEvents:'none',overflow:'visible'}} viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} fill="none" stroke={color||'#334466'} strokeWidth="0.3" strokeOpacity="0.4" />
      {animated && <circle r="0.6" fill="#00ccff" opacity="0.8">
        <animateMotion dur="3s" repeatCount="indefinite" path={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} />
      </circle>}
    </svg>
  )
}

export default function App() {
  const [time, setTime] = useState(new Date())
  const [tIdx, setTIdx] = useState(0)

  useEffect(() => {
    const t1 = setInterval(() => setTime(new Date()), 1000)
    const t2 = setInterval(() => setTIdx(i => (i + 1) % 6), 3000)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  const thoughts = [
    { agent: 'Intelligence', text: 'Scanning DR-4900 Louisiana updates...', time: '2m ago' },
    { agent: 'Proposal', text: 'Drafting St. Mary technical approach', time: '5m ago' },
    { agent: 'CRM', text: 'Donna Evans contact follow-up needed', time: '8m ago' },
    { agent: 'Red Team', text: 'JP SOQ local office weakness flagged', time: '12m ago' },
    { agent: 'Competitive', text: 'Civix/CCG confirmed JP SOQ bidder', time: '15m ago' },
    { agent: 'Self-Awareness', text: 'Mesh health 94%, output +340%', time: '18m ago' },
  ]

  const P = {bg:'rgba(6,10,28,0.9)',border:'1px solid rgba(68,136,255,0.1)',borderRadius:10,backdropFilter:'blur(12px)'}

  return (
    <div style={{width:'100vw',height:'100vh',background:'linear-gradient(135deg,#050818 0%,#0a0e24 50%,#080c1a 100%)',color:'#c0ccdd',fontFamily:"'SF Mono','Fira Code','Consolas',monospace",overflow:'hidden',display:'flex',flexDirection:'column'}}>

      {/* === HEADER === */}
      <div style={{padding:'12px 20px',borderBottom:'1px solid rgba(68,136,255,0.08)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div>
          <div style={{fontSize:18,fontWeight:800,letterSpacing:4,color:'#8899cc',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#4488ff',boxShadow:'0 0 12px #4488ff'}} />
            NEURAL OPERATIONS HUB
          </div>
          <div style={{fontSize:10,color:'#334455',letterSpacing:2,marginTop:2}}>MULTI-AGENT AI SYSTEM OVERVIEW</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{fontSize:10,color:'#334455'}}>{time.toLocaleTimeString()}</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',boxShadow:'0 0 8px #00ff88'}} />
            <span style={{fontSize:10,color:'#33aa66'}}>PERFORMANCE OPTIMAL</span>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div style={{flex:1,display:'flex',gap:1,padding:'8px',overflow:'hidden'}}>

        {/* === LEFT COLUMN === */}
        <div style={{width:240,display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
          {/* Task Gates */}
          <div style={{...P,padding:'14px 16px',flex:1}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#4466aa',marginBottom:12,fontWeight:700}}>TASK GATES</div>
            {[
              {name:'Intelligence Sweep',status:'complete',color:'#00ff88'},
              {name:'Competitive Analysis',status:'running',color:'#4488ff'},
              {name:'Financial Modeling',status:'running',color:'#4488ff'},
              {name:'Proposal Drafting',status:'queued',color:'#daa520'},
              {name:'Quality Review',status:'pending',color:'#556677'},
              {name:'Red Team Audit',status:'pending',color:'#556677'},
            ].map((t,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,padding:'6px 8px',background:'rgba(255,255,255,0.02)',borderRadius:6,border:'1px solid rgba(255,255,255,0.03)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:t.color,boxShadow:`0 0 6px ${t.color}44`}} />
                  <span style={{fontSize:10,color:'#8899aa'}}>{t.name}</span>
                </div>
                <span style={{fontSize:8,color:t.color,textTransform:'uppercase',letterSpacing:0.5}}>{t.status}</span>
              </div>
            ))}
          </div>

          {/* Task Reasoning */}
          <div style={{...P,padding:'14px 16px'}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#4466aa',marginBottom:10,fontWeight:700}}>REASONING PATHWAY</div>
            {[
              {step:'Analyze RFP Requirements',status:'✓',color:'#00ff88'},
              {step:'Cross-reference KB',status:'✓',color:'#00ff88'},
              {step:'Competitive Position',status:'→',color:'#4488ff'},
              {step:'Draft Response',status:'○',color:'#556677'},
              {step:'Red Team Review',status:'○',color:'#556677'},
            ].map((s,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,color:s.color,width:14,textAlign:'center'}}>{s.status}</span>
                <span style={{fontSize:10,color:s.color==='#556677'?'#556677':'#8899aa'}}>{s.step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === CENTER — BRAIN + AGENTS === */}
        <div style={{flex:1,position:'relative',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minWidth:0}}>
          {/* Brain shader */}
          <div style={{width:'100%',maxWidth:500,aspectRatio:'5/4',position:'relative'}}>
            <BrainCanvas />
            {/* Agent nodes positioned around the brain */}
            <AgentNode name="INTELLIGENCE" role="Research & Discovery" x="15%" y="30%" color="#00e5ff" />
            <AgentNode name="PROPOSAL" role="Content Generation" x="85%" y="30%" color="#daa520" />
            <AgentNode name="ANALYSIS" role="Research & Strategy" x="10%" y="75%" color="#e8834a" />
            <AgentNode name="SELF-AWARE" role="Meta Intelligence" x="50%" y="10%" color="#ff6b6b" />
            <AgentNode name="OPERATIONS" role="Pipeline & Staffing" x="90%" y="75%" color="#4ecdc4" />
          </div>

          {/* Bottom metrics bar */}
          <div style={{display:'flex',gap:16,marginTop:12}}>
            {[
              {label:'AGENTS',value:'43',sub:'active'},
              {label:'MEMORY',value:'5,426',sub:'records'},
              {label:'MESH',value:'94%',sub:'health'},
              {label:'LATENCY',value:'136ms',sub:'avg cycle'},
            ].map(m => (
              <div key={m.label} style={{textAlign:'center',padding:'8px 16px',background:'rgba(6,10,28,0.8)',borderRadius:8,border:'1px solid rgba(68,136,255,0.08)'}}>
                <div style={{fontSize:16,fontWeight:700,color:'#4488ff'}}>{m.value}</div>
                <div style={{fontSize:8,color:'#445566',letterSpacing:1,marginTop:2}}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* === RIGHT COLUMN === */}
        <div style={{width:240,display:'flex',flexDirection:'column',gap:8,flexShrink:0}}>
          {/* System Primitives */}
          <div style={{...P,padding:'14px 16px'}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#4466aa',marginBottom:10,fontWeight:700}}>SYSTEM PRIMITIVES</div>
            {[
              {label:'AI Model Calls',value:'847',color:'#4488ff'},
              {label:'Token Usage',value:'2.4M',color:'#4488ff'},
              {label:'Error Rate',value:'0.3%',color:'#00ff88'},
              {label:'Cost Today',value:'$0.42',color:'#daa520'},
            ].map(m => (
              <div key={m.label} style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:10,color:'#667788'}}>{m.label}</span>
                <span style={{fontSize:10,color:m.color,fontWeight:600}}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Active Agents */}
          <div style={{...P,padding:'14px 16px',flex:1}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#4466aa',marginBottom:10,fontWeight:700}}>ACTIVE AGENTS</div>
            {[
              {name:'Intelligence Engine',status:'scanning',time:'2m',color:'#00e5ff',progress:78},
              {name:'Proposal Writer',status:'drafting',time:'5m',color:'#daa520',progress:45},
              {name:'Financial Agent',status:'modeling',time:'3m',color:'#4ecdc4',progress:62},
              {name:'CRM Agent',status:'monitoring',time:'1m',color:'#00e5ff',progress:90},
              {name:'Red Team',status:'auditing',time:'8m',color:'#e8834a',progress:33},
              {name:'Self-Awareness',status:'evaluating',time:'<1m',color:'#ff6b6b',progress:95},
            ].map((a,i) => (
              <div key={i} style={{marginBottom:10,padding:'8px',background:'rgba(255,255,255,0.02)',borderRadius:6,border:'1px solid rgba(255,255,255,0.03)'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:10,color:'#8899aa',fontWeight:600}}>{a.name}</span>
                  <span style={{fontSize:8,color:a.color}}>{a.time}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <div style={{flex:1,height:3,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}>
                    <div style={{width:`${a.progress}%`,height:'100%',background:a.color,borderRadius:2,boxShadow:`0 0 4px ${a.color}44`}} />
                  </div>
                  <span style={{fontSize:8,color:'#556677',textTransform:'uppercase'}}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Feed */}
          <div style={{...P,padding:'14px 16px'}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#4466aa',marginBottom:10,fontWeight:700,display:'flex',justifyContent:'space-between'}}>
              <span>LIVE FEED</span>
              <span style={{color:'#ff4444',animation:'blink 1s step-end infinite'}}>● LIVE</span>
            </div>
            {thoughts.slice(tIdx, tIdx+3).map((t,i) => (
              <div key={i} style={{marginBottom:6,opacity:1-i*0.25}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:9,color:'#4488ff',fontWeight:600}}>{t.agent}</span>
                  <span style={{fontSize:8,color:'#334455'}}>{t.time}</span>
                </div>
                <div style={{fontSize:9,color:'#667788',marginTop:2}}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === BOTTOM BAR === */}
      <div style={{padding:'8px 20px',borderTop:'1px solid rgba(68,136,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
        <div style={{display:'flex',gap:20}}>
          {[
            {name:'Intelligence',count:9,color:'#00e5ff'},
            {name:'Proposal',count:11,color:'#daa520'},
            {name:'Operations',count:7,color:'#4ecdc4'},
            {name:'Research',count:7,color:'#e8834a'},
            {name:'Executive',count:4,color:'#9b59b6'},
            {name:'Meta',count:5,color:'#ff6b6b'},
          ].map(c => (
            <div key={c.name} style={{display:'flex',alignItems:'center',gap:4}}>
              <div style={{width:5,height:5,borderRadius:'50%',background:c.color,boxShadow:`0 0 4px ${c.color}44`}} />
              <span style={{fontSize:9,color:'#445566'}}>{c.name} ({c.count})</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:16}}>
          {[
            {label:'Pipeline',value:'7 active'},
            {label:'Pursuing',value:'3'},
            {label:'OPI Range',value:'72-94'},
          ].map(m => (
            <span key={m.label} style={{fontSize:9,color:'#334455'}}>{m.label}: <span style={{color:'#4488ff'}}>{m.value}</span></span>
          ))}
        </div>
      </div>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  )
}
