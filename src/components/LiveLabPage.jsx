import { useState, useRef, useCallback, useMemo } from 'react';
import CameraFeed from './CameraFeed';
import HandTracker from './HandTracker';
import ChemicalOverlay from './ChemicalOverlay';
import GestureReactionEngine from './GestureReactionEngine';
import ReactionEffects3D from './ReactionEffects3D';
import MistakeOverlay from './MistakeOverlay';
import MistakeLog from './MistakeLog';
import { CHEMICALS } from '../chemicals';
import { detectMistakes, logIfNew, recordDangerTrigger } from '../mistakes/MistakeDetector';
import '../LiveLab.css';

export default function LiveLabPage({ teacherMode, messages, setMessages }) {
    const canvasRef = useRef(null);
    const [videoEl, setVideoEl] = useState(null);
    const [hands, setHands] = useState([]);
    const [chemLeft, setChemLeft] = useState('');
    const [chemRight, setChemRight] = useState('');
    const [status, setStatus] = useState('waiting');
    const [result, setResult] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [debugInfo, setDebugInfo] = useState(null);
    const [gestureDebug, setGestureDebug] = useState(null);

    const handleVideoReady = useCallback((el) => setVideoEl(el), []);
    const handleHands = useCallback((h) => setHands(h), []);
    const handleDebugInfo = useCallback((d) => setDebugInfo(d), []);
    const handleGestureDebug = useCallback((d) => setGestureDebug(d), []);

    // Mistake detection
    const mistakeResult = useMemo(
        () => detectMistakes({ chemLeft, chemRight, hands, status }),
        [chemLeft, chemRight, hands, status]
    );

    // Log new mistakes
    useMemo(() => {
        mistakeResult.mistakes.forEach(m => logIfNew(m));
    }, [mistakeResult]);

    const handleReaction = useCallback((data) => {
        // Track danger triggers
        if (data.risk === 'danger') recordDangerTrigger();

        setResult(data);
        setShowResult(true);
        if (data.explanation && setMessages) {
            setMessages(prev => [...prev, { role: 'bot', html: data.explanation }]);
        }
        setTimeout(() => setShowResult(false), 4000);
    }, [setMessages]);

    const handleStatusChange = useCallback((s) => setStatus(s), []);

    const leftQuality = hands.find(h => h.side === 'left')?.quality || null;
    const rightQuality = hands.find(h => h.side === 'right')?.quality || null;

    return (
        <div className="live-lab">
            {/* Camera + Canvas */}
            <div className="live-camera-frame">
                <CameraFeed onVideoReady={handleVideoReady} />
                <canvas ref={canvasRef} className="hand-canvas" />
                <ChemicalOverlay hands={hands} chemLeft={chemLeft} chemRight={chemRight} />

                {/* Always mounted — pass blocked as prop to preserve ref state */}
                <GestureReactionEngine
                    hands={hands}
                    chemLeft={chemLeft}
                    chemRight={chemRight}
                    onReaction={handleReaction}
                    onStatusChange={handleStatusChange}
                    onGestureDebug={handleGestureDebug}
                    blocked={mistakeResult.blocked}
                />

                <ReactionEffects3D result={result} visible={showResult} hands={hands} />

                {/* Mistake overlay */}
                <MistakeOverlay mistakes={mistakeResult.mistakes} />

                {/* HUD Overlay */}
                <div className="hud-top">
                    <div className="hud-badge">🔬 LIVE LAB</div>
                    <div className={`hud-status ${mistakeResult.blocked ? 'blocked' : status}`}>
                        <span className="hud-status-dot" />
                        {mistakeResult.blocked ? '🛑 Blocked' :
                            status === 'waiting' ? 'Waiting for hands…' :
                                status === 'ready' ? '🟡 Ready to React' :
                                    '🔴 Reaction Triggered!'}
                    </div>
                </div>

                <div className="hud-lighting-hint">
                    💡 Ensure good lighting and keep hands fully visible
                </div>

                {hands.length >= 2 && status === 'waiting' && !mistakeResult.blocked && (
                    <div className="hud-hint">
                        <span>👐</span> Bring hands closer to mix chemicals
                    </div>
                )}

                {/* Debug overlay */}
                {debugMode && debugInfo && (
                    <div className="debug-panel">
                        <div className="debug-title">🐛 DEBUG</div>
                        <div className="debug-row"><span>FPS</span><span className={debugInfo.fps >= 25 ? 'debug-good' : debugInfo.fps >= 15 ? 'debug-warn' : 'debug-bad'}>{debugInfo.fps}</span></div>
                        <div className="debug-row"><span>Hands</span><span>{debugInfo.handsDetected}/2</span></div>
                        <div className="debug-row"><span>L Conf</span><span>{debugInfo.leftConf}</span></div>
                        <div className="debug-row"><span>R Conf</span><span>{debugInfo.rightConf}</span></div>
                        <div className="debug-row"><span>L State</span><span className={`debug-q debug-q-${debugInfo.leftQuality}`}>{debugInfo.leftQuality}</span></div>
                        <div className="debug-row"><span>R State</span><span className={`debug-q debug-q-${debugInfo.rightQuality}`}>{debugInfo.rightQuality}</span></div>
                        <div className="debug-row"><span>Distance</span><span>{debugInfo.distance}</span></div>
                        <div className="debug-row"><span>Blocked</span><span className={mistakeResult.blocked ? 'debug-bad' : 'debug-good'}>{mistakeResult.blocked ? 'YES' : 'NO'}</span></div>
                        <div className="debug-row"><span>Mistakes</span><span>{mistakeResult.mistakes.length}</span></div>
                        {gestureDebug && (
                            <>
                                <div className="debug-title" style={{ marginTop: 6 }}>🎯 GESTURE</div>
                                <div className="debug-row"><span>Dist px</span><span>{gestureDebug.distance ?? '—'}</span></div>
                                <div className="debug-row"><span>Thresh</span><span>{gestureDebug.threshold}px</span></div>
                                <div className="debug-row"><span>Lock</span><span className={gestureDebug.locked ? 'debug-warn' : 'debug-good'}>{gestureDebug.locked ? 'LOCKED' : 'FREE'}</span></div>
                                <div className="debug-row"><span>API</span><span className={gestureDebug.apiStatus === 'loading' ? 'debug-warn' : 'debug-good'}>{gestureDebug.apiStatus}</span></div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Side panels */}
            <div className="live-sidebar">
                <div className="live-panel glass-card">
                    <h3 className="live-panel-title">🫲 Left Hand {leftQuality && <span className={`quality-dot q-${leftQuality}`} />}</h3>
                    <select value={chemLeft} onChange={e => setChemLeft(e.target.value)} className="live-select">
                        <option value="">— Assign Chemical —</option>
                        {CHEMICALS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="live-panel glass-card">
                    <h3 className="live-panel-title">🫱 Right Hand {rightQuality && <span className={`quality-dot q-${rightQuality}`} />}</h3>
                    <select value={chemRight} onChange={e => setChemRight(e.target.value)} className="live-select">
                        <option value="">— Assign Chemical —</option>
                        {CHEMICALS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="live-panel glass-card">
                    <h3 className="live-panel-title">📊 Status</h3>
                    <div className="status-grid">
                        <div className="status-item"><span className="status-label">Hands</span><span className="status-value">{hands.length}/2</span></div>
                        <div className="status-item"><span className="status-label">State</span><span className={`status-value state-${status}`}>{status === 'waiting' ? 'Waiting' : status === 'ready' ? 'Ready' : 'Triggered'}</span></div>
                        {result && (
                            <>
                                <div className="status-item"><span className="status-label">Reaction</span><span className="status-value">{result.type || result.effect}</span></div>
                                <div className="status-item"><span className="status-label">Risk</span><span className={`risk-badge ${result.risk}`}>{result.risk}</span></div>
                            </>
                        )}
                    </div>
                </div>

                <div className="live-panel glass-card">
                    <label className="debug-toggle">
                        <input type="checkbox" checked={debugMode} onChange={e => setDebugMode(e.target.checked)} />
                        <span className="toggle-slider" /><span className="toggle-label">🐛 Debug Mode</span>
                    </label>
                </div>

                {result && (
                    <div className={`live-panel glass-card live-result glow-${result.risk}`}>
                        <h3 className="live-panel-title">{result.risk === 'safe' ? '✅' : result.risk === 'moderate' ? '⚠️' : '🔴'} Result</h3>
                        {result.equation && <div className="live-equation">{result.equation}</div>}
                        <p className="live-message">{result.message}</p>
                        {teacherMode && result.teacher_notes && (
                            <div className="live-teacher"><span className="live-teacher-label">📚 Teacher Notes</span><p>{result.teacher_notes}</p></div>
                        )}
                    </div>
                )}

                {/* Mistake Log (teacher mode) */}
                <MistakeLog visible={teacherMode} />
            </div>

            <HandTracker videoEl={videoEl} canvasRef={canvasRef} onHandsDetected={handleHands} debugMode={debugMode} onDebugInfo={handleDebugInfo} />
        </div>
    );
}
