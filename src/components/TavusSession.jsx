/**
 * TavusSession.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Live video-call session with an AI Chemistry Tutor powered by Tavus CVI.
 *
 * HOW TAVUS WORKS (Conversational Video Interface):
 *   1. Your server (or directly from the browser) calls:
 *        POST https://tavusapi.com/v2/conversations
 *        Headers: { x-api-key: YOUR_TAVUS_API_KEY }
 *        Body:    { replica_id, persona_id, conversation_name, conversational_context }
 *   2. Tavus returns a { conversation_url } — a Daily.co room URL
 *   3. Embed that URL in an <iframe> (or use @daily-co/daily-js SDK)
 *   4. The user is now in a live video call with the AI persona
 *
 * SETUP:
 *   1. Sign up at https://platform.tavus.io
 *   2. Create a Replica (your AI tutor's face/voice)
 *   3. Create a Persona (the tutor's personality + system prompt)
 *   4. Add to your .env:
 *        VITE_TAVUS_API_KEY=your_tavus_api_key
 *        VITE_TAVUS_REPLICA_ID=r_xxxxxxxx
 *        VITE_TAVUS_PERSONA_ID=p_xxxxxxxx   ← optional, can omit
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useRef, useEffect } from 'react';

// ── Constants ──────────────────────────────────────────────────────────────────
const TAVUS_API   = 'https://tavusapi.com/v2/conversations';
const API_KEY     = import.meta.env.VITE_TAVUS_API_KEY     || '';
const REPLICA_ID  = import.meta.env.VITE_TAVUS_REPLICA_ID  || '';
const PERSONA_ID  = import.meta.env.VITE_TAVUS_PERSONA_ID  || '';

// The system context sent to the Tavus persona
const TUTOR_CONTEXT = `You are Dr. Nova, an enthusiastic and friendly AI chemistry tutor 
for high-school and university students. You are currently inside Reactech — a virtual 
chemistry lab application. Help students understand chemical reactions, safety rules, 
the periodic table, and lab techniques. Be encouraging, clear, and use simple analogies. 
Always remind students about safety when discussing dangerous reactions. 
Keep your answers concise and engaging for a video call format.`;

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
  idle:       { color: '#37474f', label: 'OFFLINE',     dot: '#263340' },
  loading:    { color: '#fbbf24', label: 'CONNECTING…', dot: '#fbbf24' },
  live:       { color: '#22c55e', label: 'LIVE',        dot: '#22c55e' },
  ending:     { color: '#ef4444', label: 'ENDING…',     dot: '#ef4444' },
  error:      { color: '#ef4444', label: 'ERROR',       dot: '#ef4444' },
};

// ── Helper: call Tavus API ─────────────────────────────────────────────────────
async function createTavusConversation({ topic = '' } = {}) {
  if (!API_KEY || !REPLICA_ID) {
    throw new Error('MISSING_CONFIG');
  }

  const body = {
    replica_id:              REPLICA_ID,
    conversation_name:       `Reactech Session — ${new Date().toLocaleTimeString()}`,
    conversational_context:  TUTOR_CONTEXT + (topic ? `\n\nThe student wants to discuss: ${topic}` : ''),
    properties: {
      max_call_duration:     1800,     // 30 min max
      participant_left_timeout: 60,    // end 60s after student leaves
      enable_recording:      false,
    },
  };

  if (PERSONA_ID) body.persona_id = PERSONA_ID;

  const res = await fetch(TAVUS_API, {
    method:  'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Tavus API ${res.status}`);
  }

  return res.json(); // { conversation_id, conversation_url, status, … }
}

// ── End a conversation ─────────────────────────────────────────────────────────
async function endTavusConversation(conversationId) {
  if (!conversationId || !API_KEY) return;
  await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
    method:  'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
  }).catch(() => {}); // fire-and-forget
}

// ── Topic suggestions ──────────────────────────────────────────────────────────
const TOPICS = [
  '⚗️ Explain a recent reaction I ran',
  '🔥 Acid and base chemistry',
  '⚡ Electrochemistry basics',
  '🧪 Lab safety rules',
  '📊 Reading the periodic table',
  '💧 Solubility and precipitation',
  '🌡️ Enthalpy and thermodynamics',
  '🔬 Organic chemistry intro',
];

// ══════════════════════════════════════════════════════════════════════════════
//  Main Component
// ══════════════════════════════════════════════════════════════════════════════
export default function TavusSession() {
  const [status,         setStatus]         = useState('idle');
  const [conversationId, setConversationId] = useState(null);
  const [callUrl,        setCallUrl]        = useState('');
  const [error,          setError]          = useState('');
  const [topic,          setTopic]          = useState('');
  const [elapsed,        setElapsed]        = useState(0);
  const [isMuted,        setIsMuted]        = useState(false);
  const [isCamOff,       setIsCamOff]       = useState(false);
  const timerRef = useRef(null);
  const iframeRef = useRef(null);

  // Timer while live
  useEffect(() => {
    if (status === 'live') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (status !== 'live') setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationId) endTavusConversation(conversationId);
      clearInterval(timerRef.current);
    };
  }, [conversationId]);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Start session ──────────────────────────────────────────────────────────
  const startSession = async () => {
    setError('');
    setStatus('loading');
    try {
      const data = await createTavusConversation({ topic });
      setConversationId(data.conversation_id);
      setCallUrl(data.conversation_url);
      setStatus('live');
    } catch (err) {
      if (err.message === 'MISSING_CONFIG') {
        setError('Add VITE_TAVUS_API_KEY and VITE_TAVUS_REPLICA_ID to your .env file.');
      } else {
        setError(err.message || 'Failed to start session. Check your API key.');
      }
      setStatus('error');
    }
  };

  // ── End session ────────────────────────────────────────────────────────────
  const endSession = async () => {
    setStatus('ending');
    await endTavusConversation(conversationId);
    setConversationId(null);
    setCallUrl('');
    setStatus('idle');
    setTopic('');
  };

  const cfg = STATUS[status];
  const isConfigured = API_KEY && REPLICA_ID;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes tv-fade-in  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        @keyframes tv-pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes tv-spin     { to{transform:rotate(360deg)} }
        @keyframes tv-dot-live { 0%,100%{box-shadow:0 0 6px #22c55e} 50%{box-shadow:0 0 16px #22c55e,0 0 28px #22c55e55} }
        @keyframes tv-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }

        .tv-shell {
          font-family: 'Syne', sans-serif;
          background: linear-gradient(155deg,#0a1929 0%,#071520 55%,#0a1929 100%);
          border: 1px solid rgba(0,188,212,0.12);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
          position: relative;
          animation: tv-fade-in 0.4s ease;
        }
        .tv-shell::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image: linear-gradient(rgba(0,188,212,0.025) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(0,188,212,0.025) 1px,transparent 1px);
          background-size: 50px 50px;
        }

        /* ── Header ── */
        .tv-header {
          padding: 20px 28px;
          border-bottom: 1px solid rgba(0,188,212,0.1);
          background: rgba(0,188,212,0.03);
          display: flex; align-items: center; gap: 16px;
          position: relative; z-index:1;
        }
        .tv-avatar {
          width:52px; height:52px; border-radius:16px; font-size:26px;
          background:rgba(0,188,212,0.1); border:1px solid rgba(0,188,212,0.25);
          display:flex; align-items:center; justify-content:center; flex-shrink:0;
        }
        .tv-title { font-size:20px; font-weight:800; color:#e0f7fa; }
        .tv-sub   { font-size:10px; color:#263340; letter-spacing:2.5px; margin-top:2px; font-family:'JetBrains Mono',monospace; }
        .tv-status-pill {
          margin-left:auto; display:flex; align-items:center; gap:8px;
          padding:6px 16px; border-radius:20px;
          background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.05);
        }
        .tv-status-dot {
          width:8px; height:8px; border-radius:50%; flex-shrink:0;
          transition: all 0.4s;
        }
        .tv-status-dot.live { animation: tv-dot-live 2s ease-in-out infinite; }
        .tv-status-label {
          font-size:9px; letter-spacing:2.5px; font-family:'JetBrains Mono',monospace;
          transition: color 0.4s;
        }
        .tv-timer {
          font-size:11px; font-family:'JetBrains Mono',monospace; color:#00bcd4; letter-spacing:2px;
          padding:4px 12px; border-radius:10px;
          background:rgba(0,188,212,0.1); border:1px solid rgba(0,188,212,0.2);
        }

        /* ── Body ── */
        .tv-body { padding:28px; position:relative; z-index:1; }

        /* ── Idle state: setup card ── */
        .tv-setup {
          display:flex; flex-direction:column; gap:24px;
        }
        .tv-tutor-card {
          display:flex; align-items:center; gap:20px;
          padding:20px 24px; border-radius:18px;
          background:rgba(0,188,212,0.05); border:1px solid rgba(0,188,212,0.15);
        }
        .tv-tutor-avatar {
          width:72px; height:72px; border-radius:20px; font-size:38px; flex-shrink:0;
          background:linear-gradient(135deg,rgba(0,188,212,0.15),rgba(0,188,212,0.05));
          border:1px solid rgba(0,188,212,0.25);
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 0 30px rgba(0,188,212,0.12);
        }
        .tv-tutor-name  { font-size:18px; font-weight:800; color:#e0f7fa; }
        .tv-tutor-role  { font-size:11px; color:#37474f; margin-top:3px; }
        .tv-tutor-caps  { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .tv-cap {
          font-size:9px; padding:3px 10px; border-radius:10px; letter-spacing:1px;
          background:rgba(0,188,212,0.08); border:1px solid rgba(0,188,212,0.18);
          color:#00bcd4; font-family:'JetBrains Mono',monospace;
        }

        /* Topic input */
        .tv-label {
          font-size:10px; letter-spacing:2px; color:#37474f; margin-bottom:8px;
          text-transform:uppercase; font-family:'JetBrains Mono',monospace;
        }
        .tv-topic-input {
          width:100%; height:50px; padding:0 16px; border-radius:14px;
          background:rgba(255,255,255,0.03); border:1.5px solid rgba(255,255,255,0.07);
          color:#e0f7fa; font-size:13px; font-family:'Syne',sans-serif; outline:none;
          transition:all 0.2s;
        }
        .tv-topic-input:focus {
          background:rgba(0,188,212,0.06); border-color:rgba(0,188,212,0.38);
          box-shadow:0 0 0 3px rgba(0,188,212,0.08);
        }
        .tv-topic-input::placeholder { color:#263340; }

        /* Topic chips */
        .tv-chips {
          display:flex; flex-wrap:wrap; gap:7px; margin-top:10px;
        }
        .tv-chip {
          padding:6px 14px; border-radius:20px; font-size:11px; cursor:pointer;
          background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07);
          color:#37474f; font-family:'Syne',sans-serif; transition:all 0.15s;
          white-space:nowrap;
        }
        .tv-chip:hover, .tv-chip.active {
          background:rgba(0,188,212,0.1); border-color:rgba(0,188,212,0.3); color:#00bcd4;
        }

        /* Warning banner */
        .tv-config-warn {
          padding:14px 18px; border-radius:12px;
          background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.2);
          color:#78716c;
        }
        .tv-config-warn code {
          font-family:'JetBrains Mono',monospace; font-size:11px;
          color:#fbbf24; background:rgba(251,191,36,0.1);
          padding:1px 6px; border-radius:4px;
        }

        /* Error */
        .tv-error {
          padding:14px 18px; border-radius:12px; margin-bottom:16px;
          background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.25);
          color:#fca5a5; font-size:12px; line-height:1.6;
        }

        /* Start button */
        .tv-start-btn {
          width:100%; height:58px; border-radius:16px; cursor:pointer;
          background:rgba(0,188,212,0.12); border:1.5px solid rgba(0,188,212,0.38);
          color:#00bcd4; font-size:16px; font-weight:700; letter-spacing:0.5px;
          display:flex; align-items:center; justify-content:center; gap:12px;
          font-family:'Syne',sans-serif; transition:all 0.22s;
          margin-top:4px;
        }
        .tv-start-btn:hover:not(:disabled) {
          background:rgba(0,188,212,0.22); border-color:rgba(0,188,212,0.6);
          transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,188,212,0.2);
        }
        .tv-start-btn:disabled { opacity:0.4; cursor:not-allowed; }

        /* ── Loading state ── */
        .tv-loading {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; gap:16px; padding:60px 0; text-align:center;
        }
        .tv-spin-ring {
          width:52px; height:52px;
          border:3px solid rgba(0,188,212,0.12);
          border-top-color:#00bcd4; border-radius:50%;
          animation:tv-spin 0.9s linear infinite;
        }
        .tv-loading-text { font-size:14px; color:#37474f; }
        .tv-loading-sub  { font-size:10px; color:#1e3040; letter-spacing:1.5px; font-family:'JetBrains Mono',monospace; }

        /* ── Live state: iframe + controls ── */
        .tv-live-wrap {
          display:flex; flex-direction:column; gap:16px;
        }
        .tv-iframe-container {
          position:relative; border-radius:18px; overflow:hidden;
          background:#000; aspect-ratio:16/9;
          border:1px solid rgba(0,188,212,0.2);
          box-shadow:0 0 40px rgba(0,188,212,0.1);
        }
        .tv-iframe {
          width:100%; height:100%; border:none; display:block;
        }
        /* Live indicator overlay on iframe */
        .tv-live-badge {
          position:absolute; top:14px; left:14px; z-index:2;
          display:flex; align-items:center; gap:7px;
          padding:5px 12px; border-radius:20px;
          background:rgba(0,0,0,0.65); backdrop-filter:blur(8px);
          border:1px solid rgba(239,68,68,0.3);
        }
        .tv-live-badge-dot {
          width:7px; height:7px; border-radius:50%; background:#ef4444;
          animation:tv-pulse 1s ease-in-out infinite;
        }
        .tv-live-badge-text {
          font-size:9px; font-weight:700; color:#fca5a5; letter-spacing:2px;
          font-family:'JetBrains Mono',monospace;
        }

        /* Controls bar */
        .tv-controls {
          display:flex; align-items:center; gap:10px;
        }
        .tv-ctrl-btn {
          width:46px; height:46px; border-radius:14px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; font-size:18px;
          background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
          transition:all 0.18s; position:relative;
        }
        .tv-ctrl-btn:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.16); }
        .tv-ctrl-btn.off {
          background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3);
        }
        .tv-ctrl-btn.off::after {
          content:''; position:absolute; top:12px; left:50%; width:2px; height:22px;
          background:#ef4444; transform:translateX(-50%) rotate(45deg);
          border-radius:1px;
        }
        .tv-end-btn {
          margin-left:auto; height:46px; padding:0 22px; border-radius:14px; cursor:pointer;
          background:rgba(239,68,68,0.1); border:1.5px solid rgba(239,68,68,0.3);
          color:#ef4444; font-size:13px; font-weight:700; letter-spacing:0.5px;
          display:flex; align-items:center; gap:8px;
          font-family:'Syne',sans-serif; transition:all 0.18s;
        }
        .tv-end-btn:hover { background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.5); transform:translateY(-1px); }

        /* Tips strip */
        .tv-tips {
          display:flex; gap:8px; flex-wrap:wrap;
        }
        .tv-tip {
          display:flex; align-items:center; gap:6px; font-size:10px; color:#1e3040;
        }
        .tv-tip span:first-child { font-size:12px; }
      `}</style>

      <div className="tv-shell">

        {/* ── Header ── */}
        <div className="tv-header">
          <div className="tv-avatar">🧑‍🔬</div>
          <div>
            <div className="tv-title">Expert Session</div>
            <div className="tv-sub">LIVE VIDEO TUTOR · POWERED BY TAVUS</div>
          </div>

          <div className="tv-status-pill">
            <div
              className={`tv-status-dot${status === 'live' ? ' live' : ''}`}
              style={{ background: cfg.dot }}
            />
            <span className="tv-status-label" style={{ color: cfg.color }}>{cfg.label}</span>
          </div>

          {status === 'live' && (
            <div className="tv-timer">{formatTime(elapsed)}</div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="tv-body">

          {/* ──── IDLE: setup ──── */}
          {(status === 'idle' || status === 'error') && (
            <div className="tv-setup">

              {/* Tutor intro card */}
              <div className="tv-tutor-card">
                <div className="tv-tutor-avatar">👩‍🔬</div>
                <div>
                  <div className="tv-tutor-name">Dr. Nova</div>
                  <div className="tv-tutor-role">AI Chemistry Tutor — available 24/7</div>
                  <div className="tv-tutor-caps">
                    {['Reactions','Safety','Equations','Lab Technique','Periodic Table','Organic Chem'].map(c => (
                      <span key={c} className="tv-cap">{c}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Config warning */}
              {!isConfigured && (
                <div className="tv-config-warn" style={{ fontSize:12, lineHeight:1.8 }}>
                  ⚠️ <strong style={{color:'#fbbf24'}}>Setup required</strong> — add these to your <code>.env</code> file:<br/>
                  <code>VITE_TAVUS_API_KEY=your_api_key</code><br/>
                  <code>VITE_TAVUS_REPLICA_ID=r_xxxxxxxx</code><br/>
                  <span style={{fontSize:10,color:'#44403c',display:'block',marginTop:6}}>
                    Get your keys at <strong style={{color:'#fbbf24'}}>platform.tavus.io</strong> → Create Replica → Copy IDs
                  </span>
                </div>
              )}

              {/* Error */}
              {status === 'error' && error && (
                <div className="tv-error">⚠️ {error}</div>
              )}

              {/* Topic picker */}
              <div>
                <div className="tv-label">What do you want to discuss? (optional)</div>
                <input
                  className="tv-topic-input"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g. I don't understand neutralisation reactions…"
                />
                <div className="tv-chips">
                  {TOPICS.map(t => (
                    <button
                      key={t}
                      className={`tv-chip${topic === t ? ' active' : ''}`}
                      onClick={() => setTopic(topic === t ? '' : t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start button */}
              <button
                className="tv-start-btn"
                onClick={startSession}
                disabled={!isConfigured}
              >
                <span>📹</span>
                Start Video Session with Dr. Nova
              </button>

              {/* Tips */}
              <div className="tv-tips">
                {[
                  ['🎤','Allow microphone access when prompted'],
                  ['📷','Camera is optional — audio-only works too'],
                  ['⏱','Sessions auto-end after 30 minutes'],
                  ['🔒','Conversations are not recorded'],
                ].map(([icon, tip]) => (
                  <div key={tip} className="tv-tip">
                    <span>{icon}</span><span>{tip}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ──── LOADING ──── */}
          {status === 'loading' && (
            <div className="tv-loading">
              <div className="tv-spin-ring" />
              <div className="tv-loading-text">Connecting you to Dr. Nova…</div>
              <div className="tv-loading-sub">SETTING UP SECURE VIDEO ROOM</div>
            </div>
          )}

          {/* ──── LIVE: embedded Tavus call ──── */}
          {(status === 'live' || status === 'ending') && callUrl && (
            <div className="tv-live-wrap">

              {/* Iframe */}
              <div className="tv-iframe-container">
                <div className="tv-live-badge">
                  <div className="tv-live-badge-dot" />
                  <span className="tv-live-badge-text">LIVE</span>
                </div>
                <iframe
                  ref={iframeRef}
                  className="tv-iframe"
                  src={callUrl}
                  allow="camera; microphone; autoplay; display-capture; fullscreen"
                  title="Tavus Video Session"
                />
              </div>

              {/* Controls */}
              <div className="tv-controls">
                {/* Mute toggle — note: actual mute goes through Daily.co inside iframe */}
                <button
                  className={`tv-ctrl-btn${isMuted ? ' off' : ''}`}
                  onClick={() => setIsMuted(m => !m)}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  🎤
                </button>
                <button
                  className={`tv-ctrl-btn${isCamOff ? ' off' : ''}`}
                  onClick={() => setIsCamOff(c => !c)}
                  title={isCamOff ? 'Turn camera on' : 'Turn camera off'}
                >
                  📷
                </button>
                <div style={{flex:1, fontSize:11, color:'#1e3040', fontFamily:"'JetBrains Mono',monospace", letterSpacing:1}}>
                  Session with <span style={{color:'#00bcd4'}}>Dr. Nova</span>
                </div>
                <button className="tv-end-btn" onClick={endSession} disabled={status === 'ending'}>
                  {status === 'ending'
                    ? <><span style={{animation:'tv-spin 1s linear infinite',display:'inline-block'}}>↻</span> Ending…</>
                    : <>📵 End Session</>
                  }
                </button>
              </div>

              {/* Session tips */}
              <div style={{
                padding:'12px 16px', borderRadius:12,
                background:'rgba(0,188,212,0.04)', border:'1px solid rgba(0,188,212,0.1)',
                fontSize:11, color:'#1e3040', lineHeight:2,
              }}>
                💡 <strong style={{color:'#00bcd488'}}>Tips:</strong> Ask Dr. Nova to explain any reaction you just ran in the Lab tab.
                You can share your screen to show her the beaker results.
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}