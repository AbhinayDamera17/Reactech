import { useState, useCallback } from 'react';
import ReactionPanel from './components/ReactionPanel';
import SmokeEffect from './components/SmokeEffect';
import ExplosionEffect from './components/ExplosionEffect';
import AssistantPanel from './components/AssistantPanel';
import GuidePage from './components/GuidePage';
import LiveLabPage from './components/LiveLabPage';
import { mixChemicals } from './api';
import { REACTIONS, reactionKey, CHEMICALS } from './chemicals';
import { validateSelection, suggestPartners } from './mistakes/ReactionValidator';
import { logMistake } from './mistakes/MistakeLogger';
import './App.css';

const WELCOME = { role: 'bot', html: 'Welcome to <strong>Reactech</strong>! 👋 Select two chemicals and press <em>Mix</em> to begin. I\'ll explain every reaction in detail.' };

const TABS = [
  { id: 'lab', label: '🧪 Lab', icon: '🧪' },
  { id: 'guide', label: '📖 Reaction Guide', icon: '📖' },
  { id: 'live', label: '🔬 Live Lab', icon: '🔬' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('lab');
  const [chemA, setChemA] = useState('');
  const [chemB, setChemB] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [teacherMode, setTeacherMode] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [showExplosion, setShowExplosion] = useState(false);

  const getName = useCallback((id) => {
    const c = CHEMICALS.find(c => c.id === id);
    return c ? c.formula : id;
  }, []);

  const handleMix = useCallback(async () => {
    // Mistake detection for manual lab
    const validation = validateSelection(chemA, chemB);
    if (!validation.valid) {
      validation.errors.forEach(err => {
        let msg = `⚠️ ${err.message}`;
        if (err.suggestions && err.suggestions.length > 0) {
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
      const key = reactionKey(chemA, chemB);
      const local = REACTIONS[key];
      if (local) {
        data = local;
      } else {
        setLoading(false);
        setMessages(prev => [...prev, { role: 'bot', html: `🔍 No known reaction between <strong>${getName(chemA)}</strong> and <strong>${getName(chemB)}</strong>.` }]);
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

  return (
    <>
      {/* Background particles */}
      <div className="particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${6 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 12}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      {/* Effects */}
      <ExplosionEffect visible={showExplosion} />
      <SmokeEffect visible={result?.risk === 'moderate' && activeTab === 'lab'} />

      {/* Header */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">
            <span className="logo-icon">⚗️</span>
            <span className="logo-text">React<span className="accent">ech</span></span>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="topbar-right">
          <label className="teacher-toggle">
            <input type="checkbox" checked={teacherMode} onChange={e => setTeacherMode(e.target.checked)} />
            <span className="toggle-slider" />
            <span className="toggle-label">🎓 Teacher Mode</span>
          </label>
        </div>
      </header>

      {/* Page content */}
      <div className="page-content">
        {activeTab === 'lab' && (
          <main className="main-grid">
            <ReactionPanel
              chemA={chemA}
              chemB={chemB}
              onChemAChange={setChemA}
              onChemBChange={setChemB}
              onMix={handleMix}
              result={result}
              loading={loading}
              teacherMode={teacherMode}
            />
            <AssistantPanel messages={messages} setMessages={setMessages} />
          </main>
        )}

        {activeTab === 'guide' && (
          <GuidePage />
        )}

        {activeTab === 'live' && (
          <LiveLabPage teacherMode={teacherMode} messages={messages} setMessages={setMessages} />
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <span>© 2026 Reactech — Virtual Chemistry Lab</span>
      </footer>
    </>
  );
}
