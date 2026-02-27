import { useEffect, useState } from 'react';

/**
 * MistakeOverlay — displays warnings and alerts on the camera feed.
 * Orange cards for minor, red modal for danger.
 */
export default function MistakeOverlay({ mistakes, onDismiss }) {
    const [dismissed, setDismissed] = useState(new Set());
    const [shaking, setShaking] = useState(false);

    // Shake on new danger
    useEffect(() => {
        const hasDanger = mistakes.some(m => m.severity === 'danger');
        if (hasDanger) {
            setShaking(true);
            const t = setTimeout(() => setShaking(false), 500);
            return () => clearTimeout(t);
        }
    }, [mistakes]);

    // Filter out dismissed
    const visible = mistakes.filter(m => !dismissed.has(m.type));
    const dangerMistakes = visible.filter(m => m.severity === 'danger');
    const warningMistakes = visible.filter(m => m.severity === 'warning');
    const infoMistakes = visible.filter(m => m.severity === 'info');

    const dismiss = (type) => {
        setDismissed(prev => new Set([...prev, type]));
        if (onDismiss) onDismiss(type);
    };

    // Reset dismissed when mistakes change types
    useEffect(() => {
        const currentTypes = new Set(mistakes.map(m => m.type));
        setDismissed(prev => {
            const next = new Set();
            prev.forEach(t => { if (currentTypes.has(t)) next.add(t); });
            return next;
        });
    }, [mistakes]);

    if (visible.length === 0) return null;

    return (
        <div className={`mistake-overlay ${shaking ? 'mistake-shake' : ''}`}>
            {/* Danger modal */}
            {dangerMistakes.length > 0 && (
                <div className="mistake-modal danger">
                    <div className="mistake-modal-icon">🔴</div>
                    <div className="mistake-modal-content">
                        {dangerMistakes.map((m, i) => (
                            <div key={i} className="mistake-item">
                                <p className="mistake-msg">{m.message}</p>
                                {m.advice && <p className="mistake-advice">{m.advice}</p>}
                            </div>
                        ))}
                    </div>
                    <button className="mistake-dismiss" onClick={() => dangerMistakes.forEach(m => dismiss(m.type))}>✕</button>
                </div>
            )}

            {/* Warning cards */}
            {warningMistakes.map((m, i) => (
                <div key={`w-${i}`} className="mistake-card warning">
                    <span className="mistake-card-icon">⚠️</span>
                    <div className="mistake-card-body">
                        <p className="mistake-msg">{m.message}</p>
                        {m.advice && <p className="mistake-advice">{m.advice}</p>}
                        {m.suggestions && m.suggestions.length > 0 && (
                            <div className="mistake-suggestions">
                                <span className="sugg-label">Try:</span>
                                {m.suggestions.map((s, j) => (
                                    <span key={j} className="sugg-chip">{s.formula || s.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="mistake-dismiss" onClick={() => dismiss(m.type)}>✕</button>
                </div>
            ))}

            {/* Info cards */}
            {infoMistakes.map((m, i) => (
                <div key={`i-${i}`} className="mistake-card info">
                    <span className="mistake-card-icon">ℹ️</span>
                    <div className="mistake-card-body">
                        <p className="mistake-msg">{m.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
