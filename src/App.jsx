import { useState, useCallback } from 'react';
import ReactionPanel from './components/ReactionPanel';
import SmokeEffect from './components/SmokeEffect';
import ExplosionEffect from './components/ExplosionEffect';
import AssistantPanel from './components/AssistantPanel';
import GuidePage from './components/GuidePage';
import LiveLabPage from './components/LiveLabPage';
import TavusSession from './components/TavusSession';
import { mixChemicals } from './api';
import { REACTIONS, reactionKey, CHEMICALS } from './chemicals';
import { validateSelection } from './mistakes/ReactionValidator';
import { logMistake } from './mistakes/MistakeLogger';
import './App.css';

const WELCOME = {
  role: 'bot',
  html: 'Welcome to <strong>Reactech</strong>! Select two chemicals and press <em>Mix</em> to begin.',
};

const TABS = [
  { id: 'lab',    label: '🧪 Lab' },
  { id: 'guide',  label: '📖 Reaction Guide' },
  { id: 'live',   label: '🔬 Live Lab' },
  { id: 'expert', label: '👩‍🔬 Expert Session' },
];

const TOPBAR_H = 64;
const FOOTER_H = 48;
const PAGE_PAD = 56;

export default function App() {
  const [activeTab,     setActiveTab]     = useState('lab');
  const [chemA,         setChemA]         = useState('');
  const [chemB,         setChemB]         = useState('');
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [teacherMode,   setTeacherMode]   = useState(false);
  const [messages,      setMessages]      = useState([WELCOME]);
  const [showExplosion, setShowExplosion] = useState(false);

  const getName = useCallback((id) => {
    const c = CHEMICALS.find(c => c.id === id);
    return c ? c.formula : id;
  }, []);

  const handleClear = useCallback(() => {
    setResult(null);
    setShowExplosion(false);
  }, []);

  const handleMix = useCallback(async () => {
    const validation = validateSelection(chemA, chemB);
    if (!validation.valid) {
      validation.errors.forEach(err => {
        let msg = `⚠️ ${err.message}`;
        if (err.suggestions?.length) {
          msg += `<br><br>💡 <strong>Try pairing with:</strong> ${err.suggestions.map(s => s.formula).join(', ')}`;
        }
        setMessages(prev => [...prev, { role: 'bot', html: msg }]);
        logMistake({ type: err.type, message: err.message, severity: err.severity });
      });
      return;
    }
    setLoading(true);
    setResult(null);
    setShowExplosion(false);
    let data;
    try {
      data = await mixChemicals(chemA, chemB);
    } catch {
      const key   = reactionKey(chemA, chemB);
      const local = REACTIONS[key];
      if (local) {
        data = local;
      } else {
        setLoading(false);
        setMessages(prev => [...prev, {
          role: 'bot',
          html: `🔍 No known reaction between <strong>${getName(chemA)}</strong> and <strong>${getName(chemB)}</strong>.`,
        }]);
        return;
      }
    }
    setResult(data);
    setLoading(false);
    if (data.risk === 'danger') {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 1600);
    }
    if (data.explanation) {
      setMessages(prev => [...prev, { role: 'bot', html: data.explanation }]);
    }
  }, [chemA, chemB, getName]);

  const gridH = `calc(100vh - ${TOPBAR_H}px - ${PAGE_PAD}px - ${FOOTER_H}px)`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; background: #040e18; color: #cfd8dc; font-family: 'Syne', sans-serif; }
        #root { height: 100%; }
        .particles { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
        .particle  { position:absolute; bottom:-10px; border-radius:50%; background:rgba(0,188,212,0.35); animation:particle-rise linear infinite; }
        @keyframes particle-rise {
          0%   { transform:translateY(0) scale(1); opacity:0; }
          10%  { opacity:0.6; }
          90%  { opacity:0.2; }
          100% { transform:translateY(-100vh) scale(0.4); opacity:0; }
        }
        .app-root { position:relative; z-index:1; height:100vh; display:flex; flex-direction:column; overflow:hidden; }
        .topbar {
          height:${TOPBAR_H}px; flex-shrink:0; padding:0 32px;
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(4,14,24,0.94); border-bottom:1px solid rgba(0,188,212,0.1);
          backdrop-filter:blur(16px); z-index:100;
        }
        .logo { display:flex; align-items:center; gap:10px; }
        .logo-icon { font-size:26px; }
        .logo-text { font-size:22px; font-weight:800; color:#e0f7fa; letter-spacing:-0.5px; }
        .logo-text .accent { color:#00bcd4; }
        .nav-tabs {
          display:flex; gap:4px; background:rgba(0,0,0,0.3); padding:4px;
          border-radius:14px; border:1px solid rgba(255,255,255,0.05);
        }
        .nav-tab {
          padding:8px 18px; border-radius:10px; font-size:13px; font-weight:600;
          background:transparent; border:none; cursor:pointer; color:#37474f;
          font-family:'Syne',sans-serif; transition:all 0.2s; white-space:nowrap;
        }
        .nav-tab:hover:not(.active) { background:rgba(255,255,255,0.04); color:#546e7a; }
        .nav-tab.active { background:rgba(0,188,212,0.14); border:1px solid rgba(0,188,212,0.3); color:#00bcd4; }
        .nav-tab.expert-tab.active { background:rgba(168,85,247,0.14); border:1px solid rgba(168,85,247,0.3); color:#c084fc; }
        .teacher-toggle {
          display:flex; align-items:center; gap:8px; padding:7px 16px; border-radius:20px;
          cursor:pointer; background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06);
          color:#37474f; font-size:11px; font-weight:600; font-family:'JetBrains Mono',monospace; transition:all 0.2s;
        }
        .teacher-toggle.on { background:rgba(250,204,21,0.1); border-color:rgba(250,204,21,0.3); color:#fbbf24; }
        .teacher-dot { width:7px; height:7px; border-radius:50%; background:currentColor; box-shadow:0 0 6px currentColor; }
        .page-content { flex:1; min-height:0; padding:28px 32px; overflow:hidden; display:flex; flex-direction:column; }
        .lab-grid {
          display:grid; grid-template-columns:1fr 400px; gap:24px;
          align-items:stretch; height:${gridH}; min-height:0;
        }
        .lab-col-left { min-width:0; min-height:0; overflow-y:auto; overflow-x:hidden; scrollbar-width:thin; }
        .lab-col-left::-webkit-scrollbar { width:4px; }
        .lab-col-left::-webkit-scrollbar-thumb { background:rgba(0,188,212,0.2); border-radius:2px; }
        .assistant-col { display:flex; flex-direction:column; min-height:0; overflow:hidden; }
        .expert-page {
          height:${gridH}; display:flex; align-items:flex-start; justify-content:center;
          overflow-y:auto; scrollbar-width:thin;
        }
        .expert-page > * { width:100%; max-width:860px; }
        .footer { height:${FOOTER_H}px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:11px; color:#0d1e28; border-top:1px solid rgba(255,255,255,0.03); }
      `}</style>

      <div className="particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${(i * 2.5 + 1) % 100}%`,
            animationDuration: `${7 + (i % 5) * 2}s`,
            animationDelay: `${(i % 12) * 1.1}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
          }} />
        ))}
      </div>

      <ExplosionEffect visible={showExplosion} />
      <SmokeEffect visible={result?.risk === 'moderate' && activeTab === 'lab'} />

      <div className="app-root">
        <header className="topbar">
          <div className="logo">
            <span className="logo-icon">⚗️</span>
            <span className="logo-text">React<span className="accent">ech</span></span>
          </div>
          <nav className="nav-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`nav-tab${activeTab === tab.id ? ' active' : ''}${tab.id === 'expert' ? ' expert-tab' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button className={`teacher-toggle${teacherMode ? ' on' : ''}`} onClick={() => setTeacherMode(m => !m)}>
            <div className="teacher-dot" />
            {teacherMode ? 'TEACHER ON' : 'TEACHER'}
          </button>
        </header>

        <div className="page-content">
          {activeTab === 'lab' && (
            <div className="lab-grid">
              <div className="lab-col-left">
                <ReactionPanel
                  chemA={chemA} chemB={chemB}
                  onChemAChange={setChemA} onChemBChange={setChemB}
                  onMix={handleMix} onClear={handleClear}
                  result={result} loading={loading} teacherMode={teacherMode}
                />
              </div>
              <div className="assistant-col">
                <AssistantPanel messages={messages} setMessages={setMessages} />
              </div>
            </div>
          )}
          {activeTab === 'guide' && <GuidePage />}
          {activeTab === 'live' && (
            <LiveLabPage teacherMode={teacherMode} messages={messages} setMessages={setMessages} />
          )}
          {activeTab === 'expert' && (
            <div className="expert-page">
              <TavusSession />
            </div>
          )}
        </div>

        <footer className="footer">
          <span>© 2026 Reactech — Virtual Chemistry Lab</span>
        </footer>
      </div>
    </>
  );
}