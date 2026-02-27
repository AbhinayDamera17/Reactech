export default function FilterDropdown({ value, onChange }) {
    return (
        <div className="guide-filter">
            <select value={value} onChange={e => onChange(e.target.value)}>
                <option value="all">All Risk Levels</option>
                <option value="safe">✅ Safe</option>
                <option value="moderate">⚠️ Moderate</option>
                <option value="danger">🔴 Danger</option>
            </select>
        </div>
    );
}
