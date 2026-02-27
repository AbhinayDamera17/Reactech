import { useState, useEffect, useMemo } from 'react';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import ReactionCard from './ReactionCard';
import { REACTIONS, CHEMICALS } from '../chemicals';

const API_URL = 'http://localhost:8000/reaction-guide';

// Convert REACTIONS object to array format for the guide
function getLocalReactions() {
    const reactions = [];
    const getChemName = (id) => CHEMICALS.find(c => c.id === id)?.name || id;
    
    Object.entries(REACTIONS).forEach(([key, data]) => {
        const [chem1Id, chem2Id] = key.split('+');
        reactions.push({
            chem1: getChemName(chem1Id),
            chem2: getChemName(chem2Id),
            risk: data.risk,
            type: data.type,
            short: data.message,
            equation: data.equation,
            safety: data.message,
            teacher_notes: data.teacher_notes || '',
        });
    });
    
    return reactions;
}

export default function GuidePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    // Fetch from API or fallback
    useEffect(() => {
        setLoading(true);
        fetch(API_URL)
            .then(res => { if (!res.ok) throw new Error(); return res.json(); })
            .then(d => { setData(d); setLoading(false); })
            .catch(() => { setData(getLocalReactions()); setLoading(false); });
    }, []);

    // Filter + search
    const filtered = useMemo(() => {
        let items = data;
        if (filter !== 'all') items = items.filter(r => r.risk === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            items = items.filter(r =>
                r.chem1.toLowerCase().includes(q) ||
                r.chem2.toLowerCase().includes(q) ||
                r.type.toLowerCase().includes(q) ||
                r.short.toLowerCase().includes(q) ||
                (r.equation && r.equation.toLowerCase().includes(q))
            );
        }
        return items;
    }, [data, filter, search]);

    const counts = useMemo(() => ({
        all: data.length,
        safe: data.filter(r => r.risk === 'safe').length,
        moderate: data.filter(r => r.risk === 'moderate').length,
        danger: data.filter(r => r.risk === 'danger').length,
    }), [data]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;800&family=JetBrains+Mono:wght@400;600&display=swap');
                
                .guide-page {
                    font-family: 'Syne', sans-serif;
                    background: linear-gradient(160deg, #0a1929 0%, #071520 50%, #0a1929 100%);
                    min-height: 100vh;
                    padding: 40px 20px;
                    position: relative;
                }
                
                .guide-page::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: linear-gradient(rgba(0,188,212,0.03) 1px, transparent 1px), 
                                      linear-gradient(90deg, rgba(0,188,212,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    pointer-events: none;
                }
                
                .guide-hero {
                    max-width: 1200px;
                    margin: 0 auto 40px;
                    text-align: center;
                    position: relative;
                    z-index: 1;
                }
                
                .guide-title {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #e0f7fa;
                    margin: 0 0 12px;
                    letter-spacing: 0.5px;
                }
                
                .guide-subtitle {
                    font-size: 1rem;
                    color: #546e7a;
                    margin: 0 0 32px;
                    letter-spacing: 0.3px;
                }
                
                .guide-stats {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .guide-stat {
                    padding: 16px 28px;
                    background: rgba(0,188,212,0.08);
                    border: 1px solid rgba(0,188,212,0.2);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    min-width: 100px;
                    transition: all 0.3s ease;
                }
                
                .guide-stat:hover {
                    background: rgba(0,188,212,0.12);
                    border-color: rgba(0,188,212,0.35);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,188,212,0.15);
                }
                
                .guide-stat.safe {
                    background: rgba(34,197,94,0.08);
                    border-color: rgba(34,197,94,0.2);
                }
                
                .guide-stat.safe:hover {
                    background: rgba(34,197,94,0.12);
                    border-color: rgba(34,197,94,0.35);
                    box-shadow: 0 8px 24px rgba(34,197,94,0.15);
                }
                
                .guide-stat.moderate {
                    background: rgba(255,152,0,0.08);
                    border-color: rgba(255,152,0,0.2);
                }
                
                .guide-stat.moderate:hover {
                    background: rgba(255,152,0,0.12);
                    border-color: rgba(255,152,0,0.35);
                    box-shadow: 0 8px 24px rgba(255,152,0,0.15);
                }
                
                .guide-stat.danger {
                    background: rgba(239,68,68,0.08);
                    border-color: rgba(239,68,68,0.2);
                }
                
                .guide-stat.danger:hover {
                    background: rgba(239,68,68,0.12);
                    border-color: rgba(239,68,68,0.35);
                    box-shadow: 0 8px 24px rgba(239,68,68,0.15);
                }
                
                .stat-num {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #00bcd4;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .guide-stat.safe .stat-num {
                    color: #22c55e;
                }
                
                .guide-stat.moderate .stat-num {
                    color: #ff9800;
                }
                
                .guide-stat.danger .stat-num {
                    color: #ef4444;
                }
                
                .stat-label {
                    font-size: 0.7rem;
                    color: #546e7a;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .guide-toolbar {
                    max-width: 1200px;
                    margin: 0 auto 32px;
                    display: flex;
                    gap: 16px;
                    position: relative;
                    z-index: 1;
                }
                
                .guide-grid {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                    position: relative;
                    z-index: 1;
                }
                
                .guide-loading, .guide-empty {
                    max-width: 1200px;
                    margin: 60px auto;
                    text-align: center;
                    color: #546e7a;
                    position: relative;
                    z-index: 1;
                }
                
                .spinner {
                    width: 40px;
                    height: 40px;
                    margin: 0 auto 16px;
                    border: 3px solid rgba(0,188,212,0.1);
                    border-top-color: #00bcd4;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
            
            <div className="guide-page">
            <div className="guide-hero">
                <h1 className="guide-title">📖 Reaction Guide</h1>
                <p className="guide-subtitle">Explore our AI-powered chemistry safety knowledge base</p>
                <div className="guide-stats">
                    <div className="guide-stat"><span className="stat-num">{counts.all}</span><span className="stat-label">Total</span></div>
                    <div className="guide-stat safe"><span className="stat-num">{counts.safe}</span><span className="stat-label">Safe</span></div>
                    <div className="guide-stat moderate"><span className="stat-num">{counts.moderate}</span><span className="stat-label">Moderate</span></div>
                    <div className="guide-stat danger"><span className="stat-num">{counts.danger}</span><span className="stat-label">Danger</span></div>
                </div>
            </div>

            <div className="guide-toolbar">
                <SearchBar value={search} onChange={setSearch} />
                <FilterDropdown value={filter} onChange={setFilter} />
            </div>

            {loading ? (
                <div className="guide-loading">
                    <div className="spinner" />
                    <p>Loading reaction database…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="guide-empty">
                    <p>🔍 No reactions match your search.</p>
                </div>
            ) : (
                <div className="guide-grid">
                    {filtered.map((r, i) => <ReactionCard key={i} reaction={r} />)}
                </div>
            )}
            </div>
        </>
    );
}
