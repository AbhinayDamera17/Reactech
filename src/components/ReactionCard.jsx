import { useState } from 'react';
import RiskBadge from './RiskBadge';

export default function ReactionCard({ reaction }) {
    const [expanded, setExpanded] = useState(false);
    const { chem1, chem2, risk, type, short, equation, safety, teacher_notes } = reaction;

    const riskColors = {
        safe: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', color: '#22c55e' },
        moderate: { bg: 'rgba(255,152,0,0.08)', border: 'rgba(255,152,0,0.25)', color: '#ff9800' },
        danger: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', color: '#ef4444' },
    };

    const rc = riskColors[risk] || riskColors.safe;

    return (
        <div 
            style={{
                background: 'rgba(0,0,0,0.2)',
                border: `1px solid ${rc.border}`,
                borderRadius: 14,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                fontFamily: "'Syne', sans-serif",
            }}
            onClick={() => setExpanded(!expanded)}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = rc.bg;
                e.currentTarget.style.borderColor = rc.color + '44';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${rc.color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                e.currentTarget.style.borderColor = rc.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#e0f7fa' }}>{chem1}</span>
                    <span style={{ fontSize: 14, color: '#00bcd4', fontWeight: 800 }}>+</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#e0f7fa' }}>{chem2}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                        padding: '4px 12px',
                        background: rc.bg,
                        border: `1px solid ${rc.border}`,
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        color: rc.color,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        {risk}
                    </span>
                    <span style={{
                        fontSize: 11,
                        color: '#546e7a',
                        fontFamily: "'JetBrains Mono', monospace",
                    }}>
                        {type}
                    </span>
                </div>
            </div>

            {/* Short description */}
            <p style={{ 
                fontSize: 13, 
                color: '#90a4ae', 
                lineHeight: 1.6, 
                margin: '0 0 12px' 
            }}>
                {short}
            </p>

            {/* Expanded details */}
            {expanded && (
                <div style={{ 
                    marginTop: 16, 
                    paddingTop: 16, 
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    animation: 'fadeIn 0.3s ease',
                }}>
                    {equation && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ 
                                fontSize: 9, 
                                letterSpacing: 2, 
                                color: '#37474f', 
                                marginBottom: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                ⚗️ EQUATION
                            </div>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#e0f7fa',
                                padding: '10px 14px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: 8,
                            }}>
                                {equation}
                            </div>
                        </div>
                    )}
                    
                    {safety && (
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ 
                                fontSize: 9, 
                                letterSpacing: 2, 
                                color: '#37474f', 
                                marginBottom: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                🛡️ SAFETY
                            </div>
                            <p style={{ 
                                fontSize: 12, 
                                color: '#78909c', 
                                lineHeight: 1.6, 
                                margin: 0 
                            }}>
                                {safety}
                            </p>
                        </div>
                    )}
                    
                    {teacher_notes && (
                        <div style={{ 
                            marginBottom: 14,
                            padding: 12,
                            background: 'rgba(0,188,212,0.05)',
                            border: '1px solid rgba(0,188,212,0.15)',
                            borderRadius: 8,
                        }}>
                            <div style={{ 
                                fontSize: 9, 
                                letterSpacing: 2, 
                                color: '#00bcd4', 
                                marginBottom: 6,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}>
                                📚 TEACHER NOTES
                            </div>
                            <p style={{ 
                                fontSize: 12, 
                                color: '#78909c', 
                                lineHeight: 1.6, 
                                margin: 0 
                            }}>
                                {teacher_notes}
                            </p>
                        </div>
                    )}
                    
                    <div style={{ 
                        fontSize: 11, 
                        color: '#37474f', 
                        textAlign: 'center',
                        marginTop: 12,
                    }}>
                        Click to collapse ▲
                    </div>
                </div>
            )}
            
            {!expanded && (
                <div style={{ 
                    fontSize: 11, 
                    color: '#37474f', 
                    textAlign: 'center',
                    marginTop: 8,
                }}>
                    Click to expand ▼
                </div>
            )}
        </div>
    );
}
