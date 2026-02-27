import { CHEMICALS } from '../chemicals';
import TeacherPanel from './TeacherPanel';

export default function ReactionPanel({ chemA, chemB, onChemAChange, onChemBChange, onMix, result, loading, teacherMode }) {
    const riskClass = result ? `glow-${result.risk}` : '';

    return (
        <section className="lab-panel glass-card">
            <h2 className="section-title"><span className="dot green" /> Lab Workspace</h2>

            {/* Chemical Selectors */}
            <div className="selector-row">
                <div className="selector-group">
                    <label htmlFor="chem-a">Chemical A</label>
                    <div className="custom-select">
                        <select id="chem-a" value={chemA} onChange={e => onChemAChange(e.target.value)}>
                            <option value="">— Select —</option>
                            {CHEMICALS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <span className="plus-sign">+</span>
                <div className="selector-group">
                    <label htmlFor="chem-b">Chemical B</label>
                    <div className="custom-select">
                        <select id="chem-b" value={chemB} onChange={e => onChemBChange(e.target.value)}>
                            <option value="">— Select —</option>
                            {CHEMICALS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Mix Button */}
            <button className="mix-btn" onClick={onMix} disabled={loading}>
                <span className="mix-btn-icon">{loading ? '⏳' : '🧪'}</span>
                <span>{loading ? 'Mixing…' : 'Mix Chemicals'}</span>
            </button>

            {/* Beaker */}
            <div className="beaker-area">
                <div className="beaker">
                    <div
                        className="liquid"
                        style={{
                            height: result ? '60%' : '0%',
                            background: result
                                ? result.risk === 'danger' ? 'linear-gradient(to top, #ef4444, #ef444444)'
                                    : result.risk === 'moderate' ? 'linear-gradient(to top, #eab308, #eab30844)'
                                        : 'linear-gradient(to top, #22c55e, #22c55e44)'
                                : undefined
                        }}
                    />
                    {result && (
                        <div className="bubbles">
                            {Array.from({ length: result.risk === 'danger' ? 14 : result.risk === 'moderate' ? 8 : 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bubble"
                                    style={{
                                        left: `${10 + Math.random() * 80}%`,
                                        animationDelay: `${(Math.random() * 1.2).toFixed(2)}s`,
                                        animationDuration: `${(0.8 + Math.random() * 0.8).toFixed(2)}s`,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Result Card */}
            {result && (
                <div className={`result-card ${riskClass}`}>
                    <div className="result-header">
                        <span className="result-icon">
                            {result.risk === 'safe' ? '✅' : result.risk === 'moderate' ? '⚠️' : '🔴'}
                        </span>
                        <h3>Reaction Result</h3>
                        <span className={`risk-badge ${result.risk}`}>{result.risk}</span>
                    </div>
                    <div className="result-body">
                        {result.equation && <div className="result-equation">{result.equation}</div>}
                        <div className="result-details">
                            <div className="detail-item">
                                <span className="detail-label">Product</span>
                                <span className="detail-value">{result.product || result.message}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Type</span>
                                <span className="detail-value">{result.type || result.effect}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Notes</span>
                                <span className="detail-value">{result.message}</span>
                            </div>
                        </div>
                    </div>
                    <TeacherPanel result={result} visible={teacherMode} />
                </div>
            )}
        </section>
    );
}
