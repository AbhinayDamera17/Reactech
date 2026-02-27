export default function SearchBar({ value, onChange }) {
    return (
        <div className="guide-search">
            <span className="search-icon">🔍</span>
            <input
                type="text"
                placeholder="Search chemicals, reactions, or equations…"
                value={value}
                onChange={e => onChange(e.target.value)}
                autoComplete="off"
            />
        </div>
    );
}
