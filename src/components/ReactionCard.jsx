import { useState } from 'react';
import RiskBadge from './RiskBadge';

export default function ReactionCard({ reaction }) {
    const [expanded, setExpanded] = useState(false);
    const { chem1, chem2, risk, type, short, equation, safety, teacher_notes } = reaction;

    return (
        <div className={`reaction-card glass-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
            <div className="rc-header">
                <div className="rc-chemicals">
                    <span className="rc-chem">{chem1}</span>
                    <span className="rc-plus">+</span>
                    <span className="rc-chem">{chem2}</span>
                </div>
                <div className="rc-meta">
                    <RiskBadge risk={risk} />
                    <span className="rc-type">{type}</span>
                </div>
            </div>
            <p className="rc-short">{short}</p>

            {expanded && (
                <div className="rc-details">
                    {equation && (
                        <div className="rc-detail-block">
                            <span className="rc-detail-label">⚗️ Equation</span>
                            <div className="rc-equation">{equation}</div>
                        </div>
                    )}
                    {safety && (
                        <div className="rc-detail-block">
                            <span className="rc-detail-label">🛡️ Safety Precautions</span>
                            <p className="rc-detail-text">{safety}</p>
                        </div>
                    )}
                    {teacher_notes && (
                        <div className="rc-detail-block teacher">
                            <span className="rc-detail-label">📚 Teacher Notes</span>
                            <p className="rc-detail-text">{teacher_notes}</p>
                        </div>
                    )}
                    <span className="rc-collapse-hint">Click to collapse ▲</span>
                </div>
            )}
            {!expanded && <span className="rc-expand-hint">Click to expand ▼</span>}
        </div>
    );
}
