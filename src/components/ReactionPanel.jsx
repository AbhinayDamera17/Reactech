import { useState, useEffect, useRef } from "react";
import LitmusPaper from "./LitmusPaper";

// ── Data ───────────────────────────────────────────────────────────────
const CHEMICALS = [
  { id:"hcl",     formula:"HCl",      name:"Hydrochloric Acid",     category:"Acid",     hazard:3 },
  { id:"h2so4",   formula:"H₂SO₄",   name:"Sulfuric Acid",         category:"Acid",     hazard:4 },
  { id:"naoh",    formula:"NaOH",     name:"Sodium Hydroxide",      category:"Base",     hazard:3 },
  { id:"nh3",     formula:"NH₃",      name:"Ammonia",               category:"Base",     hazard:3 },
  { id:"h2o2",    formula:"H₂O₂",    name:"Hydrogen Peroxide",     category:"Oxidizer", hazard:3 },
  { id:"na",      formula:"Na",       name:"Sodium Metal",          category:"Metal",    hazard:4 },
  { id:"mg",      formula:"Mg",       name:"Magnesium",             category:"Metal",    hazard:2 },
  { id:"zn",      formula:"Zn",       name:"Zinc",                  category:"Metal",    hazard:1 },
  { id:"cu",      formula:"Cu",       name:"Copper",                category:"Metal",    hazard:1 },
  { id:"fe",      formula:"Fe",       name:"Iron",                  category:"Metal",    hazard:1 },
  { id:"nacl",    formula:"NaCl",     name:"Sodium Chloride",       category:"Salt",     hazard:0 },
  { id:"cuso4",   formula:"CuSO₄",   name:"Copper Sulfate",        category:"Salt",     hazard:2 },
  { id:"agno3",   formula:"AgNO₃",   name:"Silver Nitrate",        category:"Salt",     hazard:2 },
  { id:"nahco3",  formula:"NaHCO₃",  name:"Baking Soda",           category:"Salt",     hazard:0 },
  { id:"caco3",   formula:"CaCO₃",   name:"Calcium Carbonate",     category:"Salt",     hazard:0 },
  { id:"h2o",     formula:"H₂O",     name:"Distilled Water",       category:"Solvent",  hazard:0 },
  { id:"ch3cooh", formula:"CH₃COOH", name:"Acetic Acid",           category:"Acid",     hazard:1 },
  { id:"kno3",    formula:"KNO₃",    name:"Potassium Nitrate",     category:"Salt",     hazard:2 },
  { id:"mno2",    formula:"MnO₂",    name:"Manganese Dioxide",     category:"Catalyst", hazard:2 },
  { id:"k",       formula:"K",       name:"Potassium Metal",       category:"Metal",    hazard:4 },
];

const SOLIDS = new Set(["na","mg","zn","ca","al","cu","pb","fe","k","ba","c","nahco3","caco3","mno2","baco3"]);
const isSolid = id => SOLIDS.has(id);

const CHEM_COLORS = {
  hcl:"#e8f5e9", naoh:"#bbdefb", h2so4:"#fff9c4", na:"#cfd8dc",
  h2o2:"#e1f5fe", mg:"#eceff1", zn:"#b0bec5", cu:"#ff7043",
  fe:"#a1887f", nacl:"#f5f5f5", cuso4:"#1e88e5", agno3:"#eeeeee",
  nahco3:"#fafafa", caco3:"#fafafa", h2o:"#29b6f6", ch3cooh:"#fff8e1",
  kno3:"#f5f5f5", mno2:"#616161", k:"#bdbdbd", nh3:"#c8e6c9",
  hno3:"#fff9c4", koh:"#e3f2fd", fecl3:"#ef6c00",
};
const chemColor = id => CHEM_COLORS[id] || "#90caf9";

const CAT_COLORS = {
  Acid:"#ff6b6b", Base:"#4fc3f7", Oxidizer:"#ce93d8",
  Metal:"#90a4ae", Salt:"#80cbc4", Solvent:"#4dd0e1", Catalyst:"#ffcc02", Other:"#78909c",
};
const catColor = cat => CAT_COLORS[cat] || "#78909c";

const RISK_CONFIG = {
  safe:     { icon:"✓", label:"SAFE",    color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.25)" },
  moderate: { icon:"!", label:"CAUTION", color:"#eab308", bg:"rgba(234,179,8,0.08)", border:"rgba(234,179,8,0.25)" },
  danger:   { icon:"✕", label:"DANGER",  color:"#ef4444", bg:"rgba(239,68,68,0.08)", border:"rgba(239,68,68,0.3)"  },
};

// ── Mini vial SVG ──────────────────────────────────────────────────────
function Vial({ color, size = 32 }) {
  const w = size * 0.55, h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 14 26" fill="none" style={{ flexShrink: 0 }}>
      <rect x="1" y="4" width="12" height="20" rx="3" fill={color+"18"} stroke={color+"55"} strokeWidth="1"/>
      <rect x="2" y="12" width="10" height="12" rx="2" fill={color+"cc"}/>
      <rect x="3.5" y="4" width="2" height="22" rx="1" fill="rgba(255,255,255,0.22)"/>
      <rect x="3" y="1" width="8" height="5" rx="2" fill={color+"44"} stroke={color+"66"} strokeWidth="0.8"/>
    </svg>
  );
}

// ── SearchableSelect ───────────────────────────────────────────────────
function SearchableSelect({ value, onChange, options, placeholder, label }) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(-1);
  const ref      = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find(o => o.id === value);
  const filtered = query
    ? options.filter(o =>
        o.formula.toLowerCase().includes(query.toLowerCase()) ||
        o.name.toLowerCase().includes(query.toLowerCase()))
    : options;

  const grouped = filtered.reduce((a, o) => {
    const c = o.category || "Other";
    (a[c] = a[c] || []).push(o); return a;
  }, {});

  const flat = filtered;

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery(""); }};
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const pick = id => { onChange(id); setOpen(false); setQuery(""); setCursor(-1); };
  const toggle = () => { setOpen(o => !o); setQuery(""); setCursor(-1); };

  const onKey = e => {
    if (!open) { if (["Enter"," ","ArrowDown"].includes(e.key)) { e.preventDefault(); toggle(); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor(c => Math.min(c+1, flat.length-1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setCursor(c => Math.max(c-1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (cursor >= 0 && flat[cursor]) pick(flat[cursor].id); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  const pos = () => {
    if (!ref.current) return {};
    const r = ref.current.getBoundingClientRect();
    return { position:"fixed", left:r.left, top:r.bottom+6, width:r.width, zIndex:9999 };
  };

  let gi = 0;

  return (
    <div ref={ref} style={{ position:"relative", width:"100%" }} onKeyDown={onKey}>
      {label && <div style={{ fontSize:11, letterSpacing:2, color: open?"#00bcd4":"#37474f", marginBottom:8, textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", transition:"color 0.2s" }}>{label}</div>}

      <button onClick={toggle} style={{
        width:"100%", height:62, padding:"0 18px", borderRadius:14,
        background: value ? "rgba(0,188,212,0.06)" : "rgba(255,255,255,0.025)",
        border:`1.5px solid ${value ? "rgba(0,188,212,0.3)" : "rgba(255,255,255,0.07)"}`,
        color:"#e0f7fa", textAlign:"left", cursor:"pointer",
        display:"flex", alignItems:"center", gap:12, fontFamily:"inherit",
        transition:"all 0.18s",
        boxShadow: open ? "0 0 0 3px rgba(0,188,212,0.15)" : "none",
      }}>
        {selected ? (
          <>
            <Vial color={chemColor(selected.id)} size={34} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:17, fontWeight:700, color:"#e0f7fa", fontFamily:"'JetBrains Mono',monospace", letterSpacing:0.5 }}>{selected.formula}</div>
              <div style={{ fontSize:11, color:"#37474f", marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{selected.name}</div>
            </div>
            <div style={{ fontSize:9, padding:"3px 10px", borderRadius:10, background:catColor(selected.category)+"18", color:catColor(selected.category), border:`1px solid ${catColor(selected.category)}33`, letterSpacing:1.5, fontFamily:"'JetBrains Mono',monospace" }}>
              {selected.category}
            </div>
            <span onClick={e=>{e.stopPropagation();onChange("");}} style={{ fontSize:11, color:"#263340", padding:"4px 7px", borderRadius:6, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.background="rgba(239,68,68,0.12)";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#263340";e.currentTarget.style.background="rgba(255,255,255,0.04)";}}>✕</span>
          </>
        ) : (
          <>
            <div style={{ width:34, height:34, borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(0,188,212,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, opacity:0.4 }}>⚗</div>
            <span style={{ fontSize:13, color:"#263340", fontStyle:"italic" }}>{placeholder}</span>
          </>
        )}
        <div style={{ marginLeft:"auto", flexShrink:0, color: open?"#00bcd4":"#263340", fontSize:10, transform: open?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</div>
      </button>

      {open && (
        <div style={{
          ...pos(),
          background:"linear-gradient(160deg,#0b1e2e,#071520)",
          border:"1px solid rgba(0,188,212,0.22)",
          borderRadius:16, overflow:"hidden",
          boxShadow:"0 28px 70px rgba(0,0,0,0.8),0 0 0 1px rgba(0,188,212,0.08)",
          display:"flex", flexDirection:"column", maxHeight:420,
          animation:"ss-in 0.18s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <style>{`@keyframes ss-in{from{opacity:0;transform:translateY(-8px) scale(0.98)}to{opacity:1;transform:none}}`}</style>

          <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(0,188,212,0.08)", background:"rgba(0,0,0,0.2)", flexShrink:0 }}>
            <div style={{ position:"relative" }}>
              <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"#263340", pointerEvents:"none" }}>⌕</span>
              <input ref={inputRef} value={query} onChange={e=>{setQuery(e.target.value);setCursor(-1);}}
                placeholder="Search formula or name…" onClick={e=>e.stopPropagation()}
                style={{ width:"100%", height:40, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:9, padding:"0 12px 0 34px", color:"#cfd8dc", fontSize:13, outline:"none", fontFamily:"'JetBrains Mono',monospace" }} />
            </div>
            <div style={{ fontSize:9, letterSpacing:1.5, color:"#1e3040", marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>
              {filtered.length === options.length ? `${options.length} CHEMICALS` : `${filtered.length} / ${options.length} MATCHING`}
            </div>
          </div>

          <div style={{ overflowY:"auto", flex:1 }}>
            {filtered.length === 0
              ? <div style={{ padding:"32px", textAlign:"center", color:"#1e3040", fontSize:13 }}>🔬 No results for "{query}"</div>
              : Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div style={{ padding:"7px 16px 5px", background:`${catColor(cat)}10`, borderBottom:`1px solid ${catColor(cat)}18`, display:"flex", alignItems:"center", gap:8, position:"sticky", top:0, zIndex:2 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:catColor(cat), boxShadow:`0 0 6px ${catColor(cat)}` }} />
                    <span style={{ fontSize:9, letterSpacing:2.5, color:catColor(cat), textTransform:"uppercase", fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{cat}</span>
                    <span style={{ marginLeft:"auto", fontSize:9, color:catColor(cat)+"55", fontFamily:"'JetBrains Mono',monospace" }}>{items.length}</span>
                  </div>
                  {items.map(opt => {
                    const idx = gi++; const isSel = value===opt.id; const isCur = cursor===idx;
                    return (
                      <button key={opt.id} onClick={()=>pick(opt.id)} onMouseEnter={()=>setCursor(idx)}
                        style={{ width:"100%", padding:"10px 16px", display:"flex", alignItems:"center", gap:12,
                          background: isSel?"rgba(0,188,212,0.11)":isCur?"rgba(0,188,212,0.06)":"transparent",
                          border:"none", borderLeft:`2px solid ${isSel?"#00bcd4":"transparent"}`,
                          cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"background 0.1s" }}>
                        <Vial color={chemColor(opt.id)} size={28} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:700, color: isSel?"#00bcd4":"#cfd8dc", fontFamily:"'JetBrains Mono',monospace" }}>{opt.formula}</div>
                          <div style={{ fontSize:10, color:"#37474f", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{opt.name}</div>
                        </div>
                        {isSel && <span style={{ fontSize:12, color:"#00bcd4" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              ))
            }
          </div>

          <div style={{ padding:"8px 16px", borderTop:"1px solid rgba(0,188,212,0.06)", background:"rgba(0,0,0,0.2)", flexShrink:0, display:"flex", gap:16 }}>
            {[["↑↓","navigate"],["↵","select"],["Esc","close"]].map(([k,l])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:8, padding:"1px 6px", borderRadius:4, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#37474f", fontFamily:"'JetBrains Mono',monospace" }}>{k}</span>
                <span style={{ fontSize:8, color:"#1e3040" }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Large Animated Beaker ─────────────────────────────────────────────
function BigBeaker({ chemA, chemB, result, mixing }) {
  const hasA = !!chemA, hasB = !!chemB;
  const cA = chemA ? chemColor(chemA) : null;
  const cB = chemB ? chemColor(chemB) : null;
  const sA = chemA && isSolid(chemA);
  const sB = chemB && isSolid(chemB);

  const rk = result ? RISK_CONFIG[result.risk] || RISK_CONFIG.safe : null;
  const glowCol = rk ? rk.color : "#00bcd4";

  const resultFill = result
    ? result.risk === "danger" ? ["#7f1d1d","#ef444466"]
    : result.risk === "moderate" ? ["#713f12","#eab30866"]
    : ["#14532d","#22c55e66"]
    : null;

  return (
    <div style={{ position:"relative", display:"flex", justifyContent:"center", alignItems:"center" }}>
      {/* Ambient glow */}
      {(result || mixing) && (
        <div style={{
          position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)",
          width:220, height:220, borderRadius:"50%",
          background:`radial-gradient(circle,${glowCol}28 0%,transparent 70%)`,
          filter:"blur(30px)", pointerEvents:"none",
          animation:"pulse-halo 2.5s ease-in-out infinite",
        }}/>
      )}

      <svg width="280" height="340" viewBox="0 0 280 340" style={{ position:"relative", zIndex:1 }}>
        <defs>
          <clipPath id="bk-clip">
            <path d="M68 46 L40 310 Q40 325 56 325 L224 325 Q240 325 240 310 L212 46 Z"/>
          </clipPath>
          <linearGradient id="glass-g" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.13)"/>
            <stop offset="45%" stopColor="rgba(255,255,255,0.04)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0.09)"/>
          </linearGradient>
          {cA && <linearGradient id="g-a" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cA} stopOpacity="0.92"/>
            <stop offset="100%" stopColor={cA} stopOpacity="0.55"/>
          </linearGradient>}
          {cB && <linearGradient id="g-b" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={cB} stopOpacity="0.92"/>
            <stop offset="100%" stopColor={cB} stopOpacity="0.55"/>
          </linearGradient>}
          {resultFill && <linearGradient id="g-res" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={resultFill[0]}/>
            <stop offset="100%" stopColor={resultFill[1]}/>
          </linearGradient>}
        </defs>

        {/* Liquids clipped to beaker shape */}
        <g clipPath="url(#bk-clip)">
          {/* Result fill */}
          {result && (
            <rect x="40" y="145" width="200" height="180" fill="url(#g-res)">
              <animate attributeName="y" values="150;145;150" dur="3s" repeatCount="indefinite"/>
            </rect>
          )}
          {/* Chem B bottom */}
          {!result && hasB && !sB && (
            <rect x="40" y={hasA&&!sA ? 230 : 220} width="200" height={hasA&&!sA ? 95 : 105} fill="url(#g-b)">
              <animate attributeName="y" values={`${hasA?233:223};${hasA?228:218};${hasA?233:223}`} dur="2.5s" repeatCount="indefinite"/>
            </rect>
          )}
          {/* Chem A top layer */}
          {!result && hasA && !sA && (
            <rect x="40" y={hasB&&!sB ? 165 : 220} width="200" height={hasB&&!sB ? 65 : 105} fill="url(#g-a)">
              <animate attributeName="y" values={`${hasB?168:223};${hasB?162:218};${hasB?168:223}`} dur="2s" repeatCount="indefinite"/>
            </rect>
          )}
          {/* Separation shimmer */}
          {!result && hasA && hasB && !sA && !sB && (
            <rect x="40" y="229" width="200" height="3" fill="rgba(255,255,255,0.3)" style={{filter:"blur(2px)"}}/>
          )}
          {/* Mixing shimmer */}
          {mixing && (
            <rect x="40" y="100" width="200" height="225" fill="rgba(255,255,255,0.05)">
              <animate attributeName="opacity" values="0;0.2;0" dur="0.45s" repeatCount="indefinite"/>
            </rect>
          )}
        </g>

        {/* Solid particles A */}
        {!result && hasA && sA && [0,1,2,3,4,5,6,7].map(i=>{
          const x=75+(i*18)%130, y=hasB?175+(i*13)%40:230+(i*13)%50;
          return <rect key={i} x={x} y={y} width={8+i%3*3} height={5+i%2*4} fill={chemColor(chemA)} rx="2" opacity="0.85">
            <animate attributeName="y" values={`${y};${y-4};${y}`} dur={`${1.2+i*0.18}s`} repeatCount="indefinite"/>
          </rect>;
        })}
        {/* Solid particles B */}
        {!result && hasB && sB && [0,1,2,3,4,5,6,7].map(i=>{
          const x=70+(i*20)%135, y=248+(i*9)%45;
          return <rect key={i} x={x} y={y} width={7+i%4*3} height={4+i%2*3} fill={chemColor(chemB)} rx="2" opacity="0.85">
            <animate attributeName="y" values={`${y};${y-3};${y}`} dur={`${1.0+i*0.14}s`} repeatCount="indefinite"/>
          </rect>;
        })}

        {/* Bubbles */}
        {(result || mixing) && [0,1,2,3,4,5,6,7,8].map(i=>{
          const x=60+(i*20)%160, r=4+i%5, dur=0.9+i*0.2, delay=i*0.28;
          return <circle key={i} cx={x} cy="318" r={r} fill={glowCol+"44"}>
            <animate attributeName="cy" values="318;80" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.8;0" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"/>
            <animate attributeName="r" values={`${r};${r*0.3}`} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite"/>
          </circle>;
        })}

        {/* Steam */}
        {result && result.risk !== "safe" && [0,1,2,3].map(i=>(
          <ellipse key={i} cx={90+i*28} cy="36" rx="10" ry="5" fill="rgba(255,255,255,0.07)">
            <animate attributeName="cy" values="46;-20" dur={`${1.6+i*0.4}s`} begin={`${i*0.45}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.35;0" dur={`${1.6+i*0.4}s`} begin={`${i*0.45}s`} repeatCount="indefinite"/>
            <animate attributeName="rx" values="10;28" dur={`${1.6+i*0.4}s`} begin={`${i*0.45}s`} repeatCount="indefinite"/>
          </ellipse>
        ))}

        {/* Glass body */}
        <path d="M68 46 L40 310 Q40 325 56 325 L224 325 Q240 325 240 310 L212 46 Z"
          fill="url(#glass-g)"
          stroke={rk ? rk.color+"77" : "rgba(0,188,212,0.22)"}
          strokeWidth="2"
          style={{ transition:"stroke 1s ease", filter: rk ? `drop-shadow(0 0 12px ${rk.color}33)` : "none" }}
        />
        {/* Rim */}
        <rect x="52" y="32" width="176" height="20" rx="6" fill="rgba(255,255,255,0.04)" stroke="rgba(0,188,212,0.18)" strokeWidth="1.5"/>
        {/* Spout */}
        <path d="M204 32 L228 16 L248 16 L248 32" fill="rgba(255,255,255,0.03)" stroke="rgba(0,188,212,0.14)" strokeWidth="1.5"/>
        {/* Highlight */}
        <line x1="84" y1="50" x2="76" y2="314" stroke="rgba(255,255,255,0.12)" strokeWidth="5" strokeLinecap="round"/>
        <line x1="106" y1="50" x2="100" y2="314" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Graduation marks */}
        {[70,140,210].map((off,i)=>(
          <g key={i}>
            <line x1="43" y1={314-off} x2="60" y2={314-off} stroke="rgba(0,188,212,0.22)" strokeWidth="1"/>
            <text x="22" y={318-off} fontSize="10" fill="rgba(0,188,212,0.28)" fontFamily="monospace">{(i+1)*50}</text>
          </g>
        ))}
        {/* Chemical labels */}
        {!result && hasA && (
          <text x="140" y={hasB?195:260} textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.75)" fontFamily="monospace" fontWeight="bold">
            {CHEMICALS.find(c=>c.id===chemA)?.formula}
          </text>
        )}
        {!result && hasB && (
          <text x="140" y="295" textAnchor="middle" fontSize="15" fill="rgba(255,255,255,0.75)" fontFamily="monospace" fontWeight="bold">
            {CHEMICALS.find(c=>c.id===chemB)?.formula}
          </text>
        )}
        {result && (
          <text x="140" y="230" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.5)" fontFamily="monospace">
            mixed
          </text>
        )}
      </svg>
    </div>
  );
}

// ── Main ReactionPanel ─────────────────────────────────────────────────
export default function ReactionPanel({
  chemA, chemB, onChemAChange, onChemBChange,
  onMix, result, loading, teacherMode, onClear,
}) {
  const [mixing, setMixing] = useState(false);

  useEffect(() => { if (result) setMixing(false); }, [result]);

  const handleMix = () => { setMixing(true); onMix?.(); };
  const handleClear = () => { onChemAChange?.(""); onChemBChange?.(""); onClear?.(); setMixing(false); };

  const ready = chemA && chemB;
  const rk = result ? RISK_CONFIG[result.risk] || RISK_CONFIG.safe : null;
  const chemAData = CHEMICALS.find(c=>c.id===chemA);
  const chemBData = CHEMICALS.find(c=>c.id===chemB);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes pulse-halo { 0%,100%{opacity:0.7;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.1)} }
        @keyframes slide-up   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes fade-in    { from{opacity:0} to{opacity:1} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes ready-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} 50%{box-shadow:0 0 20px 4px rgba(34,197,94,0.15)} }
        .rxp-mix-btn { transition:all 0.22s ease; }
        .rxp-mix-btn:not(:disabled):hover { background:rgba(0,188,212,0.2)!important; border-color:rgba(0,188,212,0.6)!important; transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,188,212,0.2)!important; }
        .rxp-mix-btn:disabled { opacity:0.35; cursor:not-allowed; }
        .rxp-clear:hover { background:rgba(239,68,68,0.12)!important; color:#fca5a5!important; border-color:rgba(239,68,68,0.4)!important; }
        .rxp-clear { transition:all 0.18s; }
        .result-slide { animation:slide-up 0.5s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

      <div style={{
        fontFamily:"'Syne',sans-serif",
        background:"linear-gradient(155deg,#0a1929 0%,#071520 55%,#0a1929 100%)",
        border:"1px solid rgba(0,188,212,0.12)",
        borderRadius:24,
        padding:"36px 36px 32px",
        position:"relative", overflow:"hidden",
        boxShadow:"0 40px 100px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.04)",
        animation:"fade-in 0.4s ease",
      }}>

        {/* Grid bg */}
        <div style={{ position:"absolute",inset:0,pointerEvents:"none",
          backgroundImage:"linear-gradient(rgba(0,188,212,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,188,212,0.025) 1px,transparent 1px)",
          backgroundSize:"50px 50px" }}/>
        {/* Corner glow */}
        <div style={{ position:"absolute",top:0,right:0,width:200,height:200,
          background:"radial-gradient(circle at top right,rgba(0,188,212,0.07),transparent 70%)",pointerEvents:"none" }}/>

        {/* ── Header ── */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32 }}>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ width:52,height:52,borderRadius:16,background:"rgba(0,188,212,0.1)",border:"1px solid rgba(0,188,212,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26 }}>⚗️</div>
            <div>
              <div style={{ fontSize:22,fontWeight:800,color:"#e0f7fa",letterSpacing:0.3 }}>Lab Workspace</div>
              <div style={{ fontSize:11,color:"#263340",letterSpacing:2.5,marginTop:2,fontFamily:"'JetBrains Mono',monospace" }}>REACTION SIMULATOR</div>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 18px",borderRadius:24,
            background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.05)",
            animation: ready?"ready-glow 3s ease infinite":"none" }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:ready?"#22c55e":"#263340",
              boxShadow:ready?"0 0 8px #22c55e":"none",transition:"all 0.4s" }}/>
            <span style={{ fontSize:10,letterSpacing:2,fontFamily:"'JetBrains Mono',monospace",color:ready?"#4ade80":"#263340",transition:"color 0.4s" }}>
              {loading?"PROCESSING":ready?"READY":"STANDBY"}
            </span>
          </div>
        </div>

        {/* ── Main 3-column layout ── */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 300px 1fr",gap:24,alignItems:"start",marginBottom:28 }}>

          {/* Reagent A */}
          <div>
            {/* Preview card */}
            <div style={{ padding:"18px 20px",borderRadius:16,marginBottom:14,
              background: chemA ? `${chemColor(chemA)}0c` : "rgba(255,255,255,0.02)",
              border:`1.5px solid ${chemA ? chemColor(chemA)+"30" : "rgba(255,255,255,0.05)"}`,
              minHeight:100,transition:"all 0.4s" }}>
              <div style={{ fontSize:10,letterSpacing:2.5,color:"#00bcd4",marginBottom:10,fontFamily:"'JetBrains Mono',monospace" }}>REAGENT A</div>
              {chemAData ? (
                <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:36,height:56,borderRadius:"4px 4px 12px 12px",flexShrink:0,
                    background:`linear-gradient(180deg,rgba(255,255,255,0.1),${chemColor(chemA)}dd)`,
                    border:"1px solid rgba(255,255,255,0.2)",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",left:"28%",top:0,width:"16%",height:"100%",background:"rgba(255,255,255,0.26)" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:24,fontWeight:800,color:"#e0f7fa",fontFamily:"'JetBrains Mono',monospace",lineHeight:1 }}>{chemAData.formula}</div>
                    <div style={{ fontSize:12,color:"#37474f",marginTop:4 }}>{chemAData.name}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:6 }}>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:catColor(chemAData.category),boxShadow:`0 0 5px ${catColor(chemAData.category)}` }}/>
                      <span style={{ fontSize:9,letterSpacing:1.5,color:catColor(chemAData.category),fontFamily:"'JetBrains Mono',monospace" }}>{chemAData.category}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ height:56,display:"flex",alignItems:"center" }}>
                  <div style={{ width:"100%",height:2,background:"rgba(255,255,255,0.04)",borderRadius:1 }}>
                    <div style={{ height:"100%",width:"45%",background:"linear-gradient(90deg,transparent,rgba(0,188,212,0.25),transparent)",backgroundSize:"200% auto",animation:"shimmer 2s ease infinite",borderRadius:1 }}/>
                  </div>
                </div>
              )}
            </div>
            <SearchableSelect label="Select Chemical A" value={chemA} onChange={onChemAChange} options={CHEMICALS} placeholder="Search or browse…"/>
          </div>

          {/* Center column — plus + beaker */}
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingTop:40 }}>
            <div style={{ width:42,height:42,borderRadius:"50%",marginBottom:20,
              background:"rgba(0,188,212,0.08)",border:"1px solid rgba(0,188,212,0.22)",
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:22,color:"#00bcd4",fontWeight:800 }}>+</div>
            <BigBeaker chemA={chemA} chemB={chemB} result={result} mixing={mixing||loading}/>
          </div>

          {/* Reagent B */}
          <div>
            <div style={{ padding:"18px 20px",borderRadius:16,marginBottom:14,
              background: chemB ? `${chemColor(chemB)}0c` : "rgba(255,255,255,0.02)",
              border:`1.5px solid ${chemB ? chemColor(chemB)+"30" : "rgba(255,255,255,0.05)"}`,
              minHeight:100,transition:"all 0.4s" }}>
              <div style={{ fontSize:10,letterSpacing:2.5,color:"#ff9800",marginBottom:10,fontFamily:"'JetBrains Mono',monospace" }}>REAGENT B</div>
              {chemBData ? (
                <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                  <div style={{ width:36,height:56,borderRadius:"4px 4px 12px 12px",flexShrink:0,
                    background:`linear-gradient(180deg,rgba(255,255,255,0.1),${chemColor(chemB)}dd)`,
                    border:"1px solid rgba(255,255,255,0.2)",position:"relative",overflow:"hidden" }}>
                    <div style={{ position:"absolute",left:"28%",top:0,width:"16%",height:"100%",background:"rgba(255,255,255,0.26)" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:24,fontWeight:800,color:"#e0f7fa",fontFamily:"'JetBrains Mono',monospace",lineHeight:1 }}>{chemBData.formula}</div>
                    <div style={{ fontSize:12,color:"#37474f",marginTop:4 }}>{chemBData.name}</div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:6 }}>
                      <div style={{ width:6,height:6,borderRadius:"50%",background:catColor(chemBData.category),boxShadow:`0 0 5px ${catColor(chemBData.category)}` }}/>
                      <span style={{ fontSize:9,letterSpacing:1.5,color:catColor(chemBData.category),fontFamily:"'JetBrains Mono',monospace" }}>{chemBData.category}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ height:56,display:"flex",alignItems:"center" }}>
                  <div style={{ width:"100%",height:2,background:"rgba(255,255,255,0.04)",borderRadius:1 }}/>
                </div>
              )}
            </div>
            <SearchableSelect label="Select Chemical B" value={chemB} onChange={onChemBChange} options={CHEMICALS} placeholder="Search or browse…"/>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display:"flex",gap:14,marginBottom:24 }}>
          <button className="rxp-mix-btn" onClick={handleMix} disabled={loading||!ready}
            style={{ flex:1,height:60,borderRadius:16,cursor:ready?"pointer":"not-allowed",
              background:"rgba(0,188,212,0.1)",border:"1.5px solid rgba(0,188,212,0.35)",
              color:"#00bcd4",fontSize:16,fontWeight:700,letterSpacing:0.5,
              display:"flex",alignItems:"center",justifyContent:"center",gap:12,
              fontFamily:"'Syne',sans-serif" }}>
            {loading ? (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation:"spin 1s linear infinite" }}>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="32" strokeLinecap="round"/>
                </svg>
                Analyzing Reaction...
              </>
            ) : <>⚗ Initiate Reaction</>}
          </button>
          {(chemA||chemB||result) && (
            <button className="rxp-clear" onClick={handleClear} disabled={loading}
              style={{ height:60,padding:"0 26px",borderRadius:16,cursor:"pointer",
                background:"rgba(255,255,255,0.03)",border:"1.5px solid rgba(255,255,255,0.08)",
                color:"#37474f",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:10,
                fontFamily:"'Syne',sans-serif" }}>
              ↺ Reset
            </button>
          )}
        </div>

        {/* ── Status bar ── */}
        {!result && (
          <div style={{ padding:"14px 20px",borderRadius:14,
            background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.04)",
            display:"flex",alignItems:"center",gap:14 }}>
            <div style={{ width:32,height:32,borderRadius:"50%",flexShrink:0,
              background: ready?"rgba(34,197,94,0.12)":"rgba(0,188,212,0.08)",
              border:`1px solid ${ready?"rgba(34,197,94,0.3)":"rgba(0,188,212,0.15)"}`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
              transition:"all 0.3s" }}>
              {!chemA&&!chemB?"①":chemA&&!chemB?"②":"✓"}
            </div>
            <span style={{ fontSize:13,color:"#37474f" }}>
              {!chemA&&!chemB && "Select both reagents to begin the experiment"}
              {chemA&&!chemB && `${chemAData?.formula} selected — now choose Reagent B`}
              {!chemA&&chemB && `${chemBData?.formula} selected — now choose Reagent A`}
              {ready&&!loading && "Both reagents loaded — press Initiate Reaction"}
              {loading && "Processing reaction data…"}
            </span>
          </div>
        )}

        {/* ── Result card ── */}
        {result && rk && (
          <div className="result-slide" style={{
            borderRadius:18,overflow:"hidden",
            border:`1px solid ${rk.border}`,
            background:rk.bg,
            boxShadow:`0 0 40px ${rk.color}12,inset 0 1px 0 ${rk.color}18`,
          }}>
            {/* Result header */}
            <div style={{ padding:"20px 24px",background:`linear-gradient(135deg,${rk.color}12,transparent)`,
              borderBottom:`1px solid ${rk.border}`,display:"flex",alignItems:"center",gap:16 }}>
              <div style={{ width:48,height:48,borderRadius:14,flexShrink:0,
                background:`${rk.color}18`,border:`1.5px solid ${rk.color}44`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:22,fontWeight:900,color:rk.color,boxShadow:`0 0 16px ${rk.color}40` }}>
                {rk.icon}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:16,fontWeight:700,color:"#e0f7fa" }}>Reaction Result</div>
                <div style={{ fontSize:11,color:"#37474f",marginTop:2,fontFamily:"'JetBrains Mono',monospace" }}>
                  {chemAData?.formula} + {chemBData?.formula}
                </div>
              </div>
              <div style={{ padding:"6px 18px",borderRadius:24,fontSize:11,fontWeight:700,letterSpacing:2.5,
                background:`${rk.color}18`,border:`1px solid ${rk.color}44`,
                color:rk.color,textTransform:"uppercase",fontFamily:"'JetBrains Mono',monospace" }}>
                {rk.label}
              </div>
            </div>

            {/* Equation */}
            {result.equation && (
              <div style={{ padding:"18px 24px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize:9,letterSpacing:2,color:"#263340",marginBottom:10,fontFamily:"'JetBrains Mono',monospace" }}>CHEMICAL EQUATION</div>
                <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:600,color:"#e0f7fa",letterSpacing:0.5,
                  padding:"12px 18px",borderRadius:10,background:"rgba(0,0,0,0.3)",border:"1px solid rgba(255,255,255,0.06)" }}>
                  {result.equation}
                </div>
              </div>
            )}

            {/* Details */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",background:"rgba(0,0,0,0.12)" }}>
              {[
                {label:"Product", value: result.product||result.message},
                {label:"Type",    value: result.type||result.effect},
                {label:"Notes",   value: result.message, full:true},
              ].filter(d=>d.value).map((d,i)=>(
                <div key={i} style={{ padding:"16px 24px",gridColumn:d.full?"1 / -1":undefined,
                  borderTop:"1px solid rgba(255,255,255,0.03)",background:"rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize:9,letterSpacing:2,color:"#263340",marginBottom:7,fontFamily:"'JetBrains Mono',monospace" }}>{d.label.toUpperCase()}</div>
                  <div style={{ fontSize:13,color:"#78909c",lineHeight:1.65 }}>{d.value}</div>
                </div>
              ))}
            </div>

            {/* Teacher panel */}
            {teacherMode && result.teacherNotes && (
              <div style={{ padding:"18px 24px",borderTop:`1px solid ${rk.border}`,background:`${rk.color}07` }}>
                <div style={{ fontSize:9,letterSpacing:2,color:rk.color,marginBottom:10,fontFamily:"'JetBrains Mono',monospace" }}>📚 TEACHER NOTES</div>
                <p style={{ fontSize:13,color:"#546e7a",lineHeight:1.75,margin:0 }}>{result.teacherNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Litmus Paper pH Test ── */}
        <LitmusPaper 
          chemA={chemA} 
          chemB={chemB} 
          result={result} 
          visible={chemA || chemB || result} 
        />
      </div>
    </>
  );
}