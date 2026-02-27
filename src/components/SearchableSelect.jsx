import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * SearchableSelect - A dropdown with search/filter capability
 */
export default function SearchableSelect({ value, onChange, options, placeholder = '— Select —', label }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [dropdownStyle, setDropdownStyle] = useState({});
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Filter options based on search
    const filtered = options.filter(opt => 
        opt.name.toLowerCase().includes(search.toLowerCase()) ||
        opt.formula.toLowerCase().includes(search.toLowerCase())
    );

    // Group by category
    const grouped = filtered.reduce((acc, opt) => {
        const cat = opt.category || 'Other';
        acc[cat] = acc[cat] || [];
        acc[cat].push(opt);
        return acc;
    }, {});

    // Get selected option
    const selected = options.find(opt => opt.id === value);

    // Update dropdown position
    const updatePosition = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: 'fixed',
                top: `${rect.bottom + 6}px`,
                left: `${rect.left}px`,
                width: `${rect.width}px`,
                zIndex: 99999,
            });
        }
    };

    // Update position when opening
    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                const dropdown = document.getElementById('searchable-dropdown');
                if (dropdown && !dropdown.contains(e.target)) {
                    setIsOpen(false);
                    setSearch('');
                }
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Focus input when opening
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSelect = (optionId) => {
        onChange(optionId);
        setIsOpen(false);
        setSearch('');
    };

    const handleToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (!isOpen) setSearch('');
    };

    const getCatColor = (cat) => {
        const colors = {
            Acid: "#ff7043", Base: "#42a5f5", Oxidizer: "#ab47bc",
            Metal: "#78909c", Salt: "#66bb6a", Solvent: "#26c6da", Catalyst: "#ffa726",
        };
        return colors[cat] || "#90a4ae";
    };

    const dropdownContent = isOpen ? (
        <div 
            id="searchable-dropdown"
            style={{
                ...dropdownStyle,
                background: "#0a1929", 
                border: "1px solid rgba(0,188,212,0.25)",
                borderRadius: 12, 
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,188,212,0.15)",
                maxHeight: "400px",
                display: "flex", 
                flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div style={{ padding: "10px 12px", borderBottom: "1px solid rgba(0,188,212,0.1)", background: "rgba(0,188,212,0.03)", flexShrink: 0 }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search..."
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,188,212,0.2)",
                        borderRadius: 7, padding: "8px 12px", color: "#cfd8dc", fontSize: 12,
                        outline: "none", fontFamily: "'Syne', sans-serif",
                    }}
                />
            </div>
            
            <div style={{ 
                overflowY: "auto", 
                overflowX: "hidden",
                flex: 1, 
                background: "#071520",
                maxHeight: "340px"
            }}>
                {filtered.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: "#546e7a", fontSize: 12 }}>No chemicals found</div>
                ) : (
                    Object.entries(grouped).map(([cat, items]) => (
                        <div key={cat}>
                            <div style={{
                                padding: "6px 14px 3px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase",
                                color: getCatColor(cat), borderBottom: `1px solid ${getCatColor(cat)}18`,
                                background: `${getCatColor(cat)}08`, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                                position: "sticky", top: 0, zIndex: 1
                            }}>
                                {cat}
                            </div>
                            {items.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSelect(opt.id);
                                    }}
                                    style={{
                                        width: "100%", padding: "9px 14px", display: "flex", alignItems: "center",
                                        gap: 10, background: value === opt.id ? "rgba(0,188,212,0.12)" : "transparent",
                                        border: "none", cursor: "pointer", textAlign: "left",
                                        borderLeft: value === opt.id ? "2px solid #00bcd4" : "2px solid transparent",
                                        transition: "all 0.15s", fontFamily: "'Syne', sans-serif",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,188,212,0.08)"}
                                    onMouseLeave={e => e.currentTarget.style.background = value === opt.id ? "rgba(0,188,212,0.12)" : "transparent"}
                                >
                                    <div style={{
                                        width: 8, height: 8, borderRadius: "50%", background: getCatColor(cat), flexShrink: 0,
                                    }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e0f7fa", minWidth: 52, fontFamily: "'JetBrains Mono', monospace" }}>{opt.formula}</span>
                                    <span style={{ fontSize: 11, color: "#90a4ae", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt.name}</span>
                                </button>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </div>
    ) : null;

    return (
        <>
            <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
                {label && (
                    <div style={{ fontSize: 10, letterSpacing: 2, color: "#546e7a", marginBottom: 6, textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
                        {label}
                    </div>
                )}
                
                <button
                    type="button"
                    onClick={handleToggle}
                    style={{
                        width: "100%", padding: "12px 16px", borderRadius: 10,
                        background: value ? "rgba(0,188,212,0.06)" : "rgba(255,255,255,0.03)",
                        border: `1.5px solid ${value ? "rgba(0,188,212,0.35)" : "rgba(255,255,255,0.08)"}`,
                        color: value ? "#e0f7fa" : "#546e7a", textAlign: "left", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, transition: "all 0.2s",
                        fontFamily: "'Syne', sans-serif", fontSize: "0.88rem",
                    }}
                >
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selected ? (
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#00bcd4", fontFamily: "'JetBrains Mono', monospace" }}>{selected.formula}</span>
                                <span style={{ fontSize: 11, color: "#90a4ae" }}>{selected.name}</span>
                            </span>
                        ) : placeholder}
                    </span>
                    <span style={{ fontSize: 10, color: isOpen ? "#00bcd4" : "#546e7a" }}>{isOpen ? "▲" : "▼"}</span>
                </button>
            </div>

            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    );
}
