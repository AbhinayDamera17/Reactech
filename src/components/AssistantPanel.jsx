// ─────────────────────────────────────────────────────────────────────────────
//  AssistantPanel.jsx  — updated so it stretches to match Lab Workspace height
//
//  KEY FIX: The parent layout must use:
//
//    <div style={{ display:"flex", alignItems:"stretch", gap:24 }}>
//      <div style={{ flex:1, minWidth:0 }}>        ← Lab Workspace
//        <ReactionPanel … />
//      </div>
//      <div style={{ width:380, display:"flex", flexDirection:"column" }}>  ← Assistant
//        <AssistantPanel … />
//      </div>
//    </div>
//
//  AssistantPanel itself uses height:100% + flex-direction:column so it fills
//  whatever height the parent gives it.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, useState } from 'react';
import { QA } from '../chemicals';
import { askGemini, isGeminiConfigured } from '../services/gemini';

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Typing dots animation ────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 0' }}>
            {[0,1,2].map(i => (
                <div key={i} style={{
                    width:7, height:7, borderRadius:'50%',
                    background:'rgba(0,188,212,0.5)',
                    animation:`typing-bounce 1.2s ease-in-out ${i*0.18}s infinite`,
                }}/>
            ))}
        </div>
    );
}

// ── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, isNew }) {
    const isUser = msg.role === 'user';
    return (
        <div style={{
            display:'flex', flexDirection:'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            animation: isNew ? 'bubble-in 0.28s cubic-bezier(0.16,1,0.3,1)' : 'none',
        }}>
            {!isUser && (
                <div style={{
                    fontSize:9, letterSpacing:2, color:'#1a3a40',
                    marginBottom:5, paddingLeft:4,
                    fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase',
                }}>
                    Lab Assistant
                </div>
            )}
            <div style={{
                maxWidth:'88%', padding:'11px 15px', borderRadius: isUser ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                background: isUser
                    ? 'linear-gradient(135deg,rgba(0,188,212,0.18),rgba(0,188,212,0.1))'
                    : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isUser ? 'rgba(0,188,212,0.3)' : 'rgba(255,255,255,0.07)'}`,
                color: isUser ? '#e0f7fa' : '#90a4ae',
                fontSize:13, lineHeight:1.65,
                boxShadow: isUser ? '0 4px 16px rgba(0,188,212,0.12)' : 'none',
            }}>
                <p style={{ margin:0 }} dangerouslySetInnerHTML={{ __html: msg.html }}/>
            </div>
            {isUser && (
                <div style={{ fontSize:9, color:'#1a3a40', marginTop:4, paddingRight:4, fontFamily:"'JetBrains Mono',monospace" }}>
                    you
                </div>
            )}
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AssistantPanel({ messages, setMessages }) {
    const scrollRef  = useRef(null);
    const inputRef   = useRef(null);
    const [loading, setLoading]   = useState(false);
    const [useAI, setUseAI]       = useState(isGeminiConfigured());
    const [inputVal, setInputVal] = useState('');
    const [newCount, setNewCount] = useState(0);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior:'smooth' });
        }
        setNewCount(messages.length);
    }, [messages]);

    async function handleSubmit(e) {
        e.preventDefault();
        const text = inputVal.trim();
        if (!text || loading) return;

        setMessages(prev => [...prev, { role:'user', html: escapeHtml(text), text }]);
        setInputVal('');

        if (useAI && isGeminiConfigured()) {
            setLoading(true);
            try {
                const reply = await askGemini(text, messages);
                setMessages(prev => [...prev, { role:'bot', html: reply, text: reply }]);
            } catch {
                setMessages(prev => [...prev, { role:'bot', html:'❌ Error — please try again.' }]);
            } finally {
                setLoading(false);
            }
        } else {
            const lower = text.toLowerCase();
            const match = QA.find(q => q.keywords.some(k => lower.includes(k)));
            const botReply = match
                ? match.reply
                : `🤔 Try asking about <strong>acids</strong>, <strong>reactivity series</strong>, or <strong>safety</strong>.`;
            setMessages(prev => [...prev, { role:'bot', html: botReply }]);
        }
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap');

                /* ── Animations ── */
                @keyframes bubble-in {
                    from { opacity:0; transform:translateY(10px) scale(0.97); }
                    to   { opacity:1; transform:none; }
                }
                @keyframes typing-bounce {
                    0%,80%,100% { transform:translateY(0); opacity:0.4; }
                    40%         { transform:translateY(-5px); opacity:1; }
                }
                @keyframes spin { to { transform:rotate(360deg); } }
                @keyframes status-pulse {
                    0%,100% { box-shadow:0 0 6px #22c55e; }
                    50%     { box-shadow:0 0 14px #22c55e, 0 0 28px #22c55e44; }
                }

                /* ── Panel shell ── */
                /* 
                   CRITICAL: The PARENT wrapper must be:
                   display:flex; align-items:stretch;
                   and the column containing <AssistantPanel> must have
                   display:flex; flex-direction:column;
                   so this panel grows to match Lab Workspace height.
                */
                .ap-shell {
                    font-family: 'Syne', sans-serif;
                    display: flex;
                    flex-direction: column;
                    height: 100%;           /* ← fills whatever the parent gives */
                    min-height: 0;          /* ← allows flex children to shrink */
                    background: linear-gradient(160deg, #0a1929 0%, #071520 50%, #0a1929 100%);
                    border: 1px solid rgba(0,188,212,0.12);
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
                    position: relative;
                }

                /* Grid background */
                .ap-shell::before {
                    content: '';
                    position: absolute; inset: 0;
                    background-image:
                        linear-gradient(rgba(0,188,212,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,188,212,0.025) 1px, transparent 1px);
                    background-size: 50px 50px;
                    pointer-events: none;
                }

                /* ── Header ── */
                .ap-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(0,188,212,0.1);
                    background: rgba(0,188,212,0.035);
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    flex-shrink: 0;
                    position: relative;
                    z-index: 1;
                }
                .ap-avatar {
                    width: 48px; height: 48px; border-radius: 14px;
                    background: rgba(0,188,212,0.1);
                    border: 1px solid rgba(0,188,212,0.25);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 24px; flex-shrink: 0;
                }
                .ap-title { font-size: 18px; font-weight: 800; color: #e0f7fa; margin: 0; }
                .ap-status {
                    display: flex; align-items: center; gap: 7px;
                    margin-top: 3px;
                }
                .ap-dot {
                    width: 7px; height: 7px; border-radius: 50%;
                    background: #22c55e;
                    animation: status-pulse 2.5s ease-in-out infinite;
                }
                .ap-status-text {
                    font-size: 9px; color: #4ade80; letter-spacing: 2.5px;
                    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
                }

                /* AI toggle */
                .ap-toggle {
                    padding: 5px 12px; border-radius: 10px; cursor: pointer;
                    font-size: 10px; font-weight: 700; letter-spacing: 1px;
                    font-family: 'JetBrains Mono', monospace;
                    transition: all 0.2s;
                }
                .ap-toggle:hover { filter: brightness(1.2); }

                /* ── Quick suggestions ── */
                .ap-suggestions {
                    padding: 10px 16px 0;
                    display: flex; flex-wrap: wrap; gap: 6px;
                    flex-shrink: 0;
                    position: relative; z-index: 1;
                }
                .ap-chip {
                    padding: 5px 12px; border-radius: 20px; font-size: 10px;
                    background: rgba(0,188,212,0.06);
                    border: 1px solid rgba(0,188,212,0.15);
                    color: #37747a; cursor: pointer;
                    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.5px;
                    transition: all 0.15s;
                    white-space: nowrap;
                }
                .ap-chip:hover {
                    background: rgba(0,188,212,0.14);
                    border-color: rgba(0,188,212,0.35);
                    color: #00bcd4;
                }

                /* ── Messages ── */
                .ap-messages {
                    flex: 1;
                    min-height: 0;           /* ← crucial: allows this div to scroll */
                    overflow-y: auto;
                    padding: 18px 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    position: relative;
                    z-index: 1;
                    scroll-behavior: smooth;
                }
                .ap-messages::-webkit-scrollbar { width: 4px; }
                .ap-messages::-webkit-scrollbar-track { background: transparent; }
                .ap-messages::-webkit-scrollbar-thumb {
                    background: rgba(0,188,212,0.2); border-radius: 2px;
                }
                .ap-messages::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,188,212,0.4);
                }

                /* ── Divider when messages start ── */
                .ap-divider {
                    display: flex; align-items: center; gap: 10;
                    font-size: 8px; letter-spacing: 2px; color: #0d2030;
                    font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
                }
                .ap-divider::before, .ap-divider::after {
                    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.04);
                }

                /* ── Input bar ── */
                .ap-inputbar {
                    padding: 16px 20px;
                    border-top: 1px solid rgba(0,188,212,0.1);
                    background: rgba(0,0,0,0.22);
                    position: relative; z-index: 1;
                    flex-shrink: 0;
                }
                .ap-input-wrap {
                    display: flex; gap: 10; align-items: center;
                }
                .ap-input {
                    flex: 1;
                    height: 50px;
                    padding: 0 16px;
                    border-radius: 14px;
                    background: rgba(255,255,255,0.03);
                    border: 1.5px solid rgba(255,255,255,0.07);
                    color: #e0f7fa; font-size: 13px;
                    font-family: 'Syne', sans-serif;
                    outline: none; transition: all 0.2s;
                }
                .ap-input:focus {
                    background: rgba(0,188,212,0.06);
                    border-color: rgba(0,188,212,0.38);
                    box-shadow: 0 0 0 3px rgba(0,188,212,0.08);
                }
                .ap-input::placeholder { color: #263340; }
                .ap-input:disabled { opacity:0.6; cursor:not-allowed; }

                .ap-send {
                    width: 50px; height: 50px; border-radius: 14px; flex-shrink: 0;
                    background: rgba(0,188,212,0.12);
                    border: 1.5px solid rgba(0,188,212,0.35);
                    color: #00bcd4; font-size: 16px; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .ap-send:hover:not(:disabled) {
                    background: rgba(0,188,212,0.22);
                    border-color: rgba(0,188,212,0.6);
                    transform: translateY(-1px);
                    box-shadow: 0 8px 24px rgba(0,188,212,0.2);
                }
                .ap-send:disabled { opacity:0.4; cursor:not-allowed; }

                /* strong/em inside bubbles */
                .ap-messages strong { color: #00bcd4; font-weight: 700; }
                .ap-messages em     { color: #4dd0e1; font-style: italic; }
            `}</style>

            <aside className="ap-shell">

                {/* ── Header ── */}
                <div className="ap-header">
                    <div className="ap-avatar">🤖</div>
                    <div style={{ flex:1 }}>
                        <h3 className="ap-title">Lab Assistant</h3>
                        <div className="ap-status">
                            <div className="ap-dot"/>
                            <span className="ap-status-text">{useAI ? 'AI Powered' : 'Online'}</span>
                        </div>
                    </div>
                    {isGeminiConfigured() && (
                        <button
                            className="ap-toggle"
                            onClick={() => setUseAI(!useAI)}
                            style={{
                                background: useAI ? 'rgba(0,188,212,0.14)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${useAI ? 'rgba(0,188,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: useAI ? '#00bcd4' : '#37474f',
                            }}
                        >
                            {useAI ? '🤖 AI' : '📚 Local'}
                        </button>
                    )}
                </div>

                {/* ── Quick suggestion chips ── */}
                {messages.length <= 1 && (
                    <div className="ap-suggestions">
                        {['What is an acid?','Explain pH','Safety rules','Reactivity series','What is neutralisation?'].map(q => (
                            <button key={q} className="ap-chip"
                                onClick={() => {
                                    setInputVal(q);
                                    setTimeout(() => inputRef.current?.focus(), 50);
                                }}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Messages ── */}
                <div className="ap-messages" ref={scrollRef}>
                    {messages.length > 0 && (
                        <div className="ap-divider">
                            <span>conversation start</span>
                        </div>
                    )}

                    {messages.map((m, i) => (
                        <Bubble key={i} msg={m} isNew={i >= newCount - 1} />
                    ))}

                    {loading && (
                        <div style={{
                            alignSelf:'flex-start',
                            background:'rgba(255,255,255,0.04)',
                            border:'1px solid rgba(255,255,255,0.07)',
                            borderRadius:'4px 14px 14px 14px',
                            padding:'11px 16px',
                            animation:'bubble-in 0.28s ease',
                        }}>
                            <TypingDots/>
                        </div>
                    )}
                </div>

                {/* ── Input bar ── */}
                <form className="ap-inputbar" onSubmit={handleSubmit}>
                    <div className="ap-input-wrap">
                        <input
                            ref={inputRef}
                            className="ap-input"
                            type="text"
                            value={inputVal}
                            onChange={e => setInputVal(e.target.value)}
                            placeholder={useAI ? 'Ask AI anything about chemistry…' : 'Ask me anything about chemistry…'}
                            autoComplete="off"
                            disabled={loading}
                        />
                        <button type="submit" className="ap-send" disabled={loading || !inputVal.trim()}>
                            {loading
                                ? <svg width="18" height="18" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        strokeDasharray="32" strokeLinecap="round" style={{ animation:'spin 0.8s linear infinite' }}/>
                                  </svg>
                                : '➤'}
                        </button>
                    </div>

                    {/* char count hint */}
                    {inputVal.length > 60 && (
                        <div style={{ fontSize:9, color:'#1e3040', marginTop:6, textAlign:'right',
                            fontFamily:"'JetBrains Mono',monospace" }}>
                            {inputVal.length} chars
                        </div>
                    )}
                </form>
            </aside>
        </>
    );
}


// ─────────────────────────────────────────────────────────────────────────────
//  LAYOUT WRAPPER (paste this in your App.jsx / page component)
//  This is what makes both panels the same height.
// ─────────────────────────────────────────────────────────────────────────────
//
//  export function LabLayout({ /* your props */ }) {
//    return (
//      <div style={{
//        display: 'grid',
//        gridTemplateColumns: '1fr 380px',   // Lab Workspace | Assistant
//        gap: 24,
//        alignItems: 'stretch',              // ← KEY: both columns same height
//      }}>
//
//        {/* Lab Workspace — grows naturally */}
//        <ReactionPanel … />
//
//        {/* Assistant — wrapper gives it a flex column so height:100% works */}
//        <div style={{ display:'flex', flexDirection:'column' }}>
//          <AssistantPanel … />
//        </div>
//
//      </div>
//    );
//  }