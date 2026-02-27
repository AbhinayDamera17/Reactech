import { useState, useEffect } from 'react';
import { onLogChange, getMistakes, clearMistakes, getMistakeStats } from '../mistakes/MistakeLogger';

/**
 * MistakeLog — teacher mode panel showing session mistake history.
 */
export default function MistakeLog({ visible }) {
    const [log, setLog] = useState(getMistakes());

    useEffect(() => {
        const unsub = onLogChange(setLog);
        return unsub;
    }, []);

    if (!visible) return null;

    const stats = getMistakeStats();
    const severityIcon = { danger: '🔴', warning: '⚠️', info: 'ℹ️' };

    return (
        <div className="mistake-log glass-card">
            <div className="mlog-header">
                <h3 className="live-panel-title">📋 Mistake Log</h3>
                <div className="mlog-stats">
                    <span className="mlog-stat">{stats.total} total</span>
                    {stats.danger > 0 && <span className="mlog-stat danger">{stats.danger} danger</span>}
                    {stats.warning > 0 && <span className="mlog-stat warning">{stats.warning} warning</span>}
                </div>
            </div>

            {log.length === 0 ? (
                <p className="mlog-empty">No mistakes recorded yet. ✅</p>
            ) : (
                <div className="mlog-list">
                    {log.slice().reverse().map(entry => (
                        <div key={entry.id} className={`mlog-entry ${entry.severity}`}>
                            <span className="mlog-icon">{severityIcon[entry.severity] || '⚠️'}</span>
                            <div className="mlog-body">
                                <span className="mlog-type">{entry.type.replace(/_/g, ' ')}</span>
                                <span className="mlog-time">{entry.timestamp}</span>
                                <p className="mlog-msg">{entry.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {log.length > 0 && (
                <button className="mlog-clear" onClick={clearMistakes}>Clear Log</button>
            )}
        </div>
    );
}
