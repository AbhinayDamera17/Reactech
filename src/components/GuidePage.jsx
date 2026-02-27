import { useState, useEffect, useMemo } from 'react';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import ReactionCard from './ReactionCard';

const API_URL = 'http://localhost:8000/reaction-guide';

// Local fallback data
const FALLBACK_DATA = [
    { chem1: 'Sodium', chem2: 'Water', risk: 'danger', type: 'Explosion', short: 'Violent reaction producing hydrogen gas.', equation: '2Na + 2H₂O → 2NaOH + H₂↑', safety: 'Never mix without controlled lab setup. Use blast shield.', teacher_notes: 'Exothermic reaction producing flammable H₂ gas. Alkali metals increase in reactivity down Group 1.' },
    { chem1: 'HCl', chem2: 'NaOH', risk: 'safe', type: 'Neutralization', short: 'Acid-base neutralization reaction.', equation: 'HCl + NaOH → NaCl + H₂O', safety: 'Wear gloves and goggles.', teacher_notes: 'Classic neutralization. pH at equivalence = 7. ΔH ≈ −57.3 kJ/mol.' },
    { chem1: 'H₂SO₄', chem2: 'NaOH', risk: 'moderate', type: 'Heat Release', short: 'Highly exothermic neutralization. Handle with care.', equation: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', safety: 'Always add acid to base. Wear full PPE.', teacher_notes: 'Diprotic acid. 2:1 mole ratio required. Significant heat released.' },
    { chem1: 'Vinegar', chem2: 'Baking Soda', risk: 'safe', type: 'Gas Evolution', short: 'Famous fizzing reaction producing CO₂.', equation: 'CH₃COOH + NaHCO₃ → CH₃COONa + H₂O + CO₂↑', safety: 'Safe for demonstrations.', teacher_notes: 'Sodium acetate product can create "hot ice" supersaturation demos.' },
    { chem1: 'HCl', chem2: 'NaHCO₃', risk: 'safe', type: 'Gas Evolution', short: 'Produces effervescent CO₂ gas bubbles.', equation: 'HCl + NaHCO₃ → NaCl + H₂O + CO₂↑', safety: 'Use in ventilated area.', teacher_notes: 'CO₂ can be tested with limewater (turns milky).' },
    { chem1: 'Na', chem2: 'H₂SO₄', risk: 'danger', type: 'Explosion', short: 'Extremely dangerous! Violent exothermic reaction.', equation: '2Na + H₂SO₄ → Na₂SO₄ + H₂↑', safety: 'Never attempt in school lab. Simulation only.', teacher_notes: 'More dangerous than Na + water. Concentrated acid adds thermal energy.' },
    { chem1: 'AgNO₃', chem2: 'NaCl', risk: 'safe', type: 'Precipitation', short: 'White curdy precipitate of silver chloride.', equation: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', safety: 'AgNO₃ stains skin. Wear gloves.', teacher_notes: 'AgCl is photosensitive — basis of photography. Teaches solubility rules and Ksp.' },
    { chem1: 'Fe', chem2: 'CuSO₄', risk: 'safe', type: 'Displacement', short: 'Iron displaces copper. Solution turns green.', equation: 'Fe + CuSO₄ → FeSO₄ + Cu', safety: 'Standard lab safety.', teacher_notes: 'Demonstrates reactivity series. Copper coats iron nail in ~30 min.' },
    { chem1: 'Mg', chem2: 'HCl', risk: 'moderate', type: 'Gas Evolution', short: 'Vigorous reaction producing hydrogen gas.', equation: 'Mg + 2HCl → MgCl₂ + H₂↑', safety: 'Use dilute acid. Keep away from flames.', teacher_notes: 'Great for rate-of-reaction experiments. "Squeaky pop" test for H₂.' },
    { chem1: 'Zn', chem2: 'HCl', risk: 'moderate', type: 'Gas Evolution', short: 'Moderate reaction speed with H₂ evolution.', equation: 'Zn + 2HCl → ZnCl₂ + H₂↑', safety: 'Wear goggles. Use dilute acid.', teacher_notes: 'Slower than Mg+HCl — illustrates reactivity trends.' },
    { chem1: 'Zn', chem2: 'CuSO₄', risk: 'safe', type: 'Displacement', short: 'Zinc displaces copper. Solution decolorizes.', equation: 'Zn + CuSO₄ → ZnSO₄ + Cu', safety: 'Standard lab safety.', teacher_notes: 'Compare with Fe + CuSO₄ to teach electrochemistry.' },
    { chem1: 'H₂O₂', chem2: 'KNO₃', risk: 'moderate', type: 'Decomposition', short: 'Catalyzed decomposition producing oxygen gas.', equation: '2H₂O₂ → 2H₂O + O₂↑', safety: 'Keep O₂ away from flames.', teacher_notes: 'Test O₂ with glowing splint (relights). Compare with MnO₂ catalyst.' },
    { chem1: 'Mg', chem2: 'H₂O', risk: 'moderate', type: 'Displacement', short: 'Slow at room temp. Reacts well with steam.', equation: 'Mg + 2H₂O → Mg(OH)₂ + H₂↑', safety: 'Handle with care if using steam.', teacher_notes: 'Mg(OH)₂ is "milk of magnesia" — an antacid.' },
    { chem1: 'Zn', chem2: 'H₂SO₄', risk: 'moderate', type: 'Gas Evolution', short: 'Steady evolution of hydrogen gas.', equation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑', safety: 'Use dilute acid only!', teacher_notes: 'Concentrated H₂SO₄ produces SO₂ instead of H₂ — important distinction.' },
];

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
            .catch(() => { setData(FALLBACK_DATA); setLoading(false); });
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
    );
}
