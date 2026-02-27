import { useMemo } from 'react';

/**
 * LitmusPaper component - Shows pH indicator paper that changes color
 * Red = Acidic, Purple = Neutral, Blue = Basic
 */
export default function LitmusPaper({ chemA, chemB, result, visible }) {
    // Determine pH level of chemicals
    const getPH = useMemo(() => {
        if (result) {
            // After mixing, determine pH from reaction type
            if (result.type === 'Neutralization') return 7; // Neutral
            if (result.product?.includes('NaOH') || result.product?.includes('KOH')) return 13; // Strong base
            if (result.product?.includes('HCl') || result.product?.includes('H₂SO₄')) return 1; // Strong acid
            return 7; // Default neutral
        }

        // Before mixing, check individual chemicals
        const acids = ['hcl', 'h2so4', 'hno3', 'ch3cooh'];
        const strongBases = ['naoh', 'koh'];
        const weakBases = ['nh3', 'nahco3', 'na2co3'];

        let phValues = [];
        
        if (chemA) {
            if (acids.includes(chemA)) phValues.push(chemA === 'ch3cooh' ? 3 : 1);
            else if (strongBases.includes(chemA)) phValues.push(13);
            else if (weakBases.includes(chemA)) phValues.push(9);
            else phValues.push(7);
        }
        
        if (chemB) {
            if (acids.includes(chemB)) phValues.push(chemB === 'ch3cooh' ? 3 : 1);
            else if (strongBases.includes(chemB)) phValues.push(13);
            else if (weakBases.includes(chemB)) phValues.push(9);
            else phValues.push(7);
        }

        if (phValues.length === 0) return null;
        return phValues[phValues.length - 1]; // Use most recent chemical
    }, [chemA, chemB, result]);

    // Get litmus paper color based on pH
    const getLitmusColor = (ph) => {
        if (ph === null) return '#f5e6d3'; // Default paper color
        if (ph < 5) return '#ef4444'; // Red (acidic)
        if (ph < 7) return '#fb923c'; // Orange (weak acid)
        if (ph === 7) return '#a855f7'; // Purple (neutral)
        if (ph < 10) return '#60a5fa'; // Light blue (weak base)
        return '#3b82f6'; // Blue (basic)
    };

    const getPhLabel = (ph) => {
        if (ph === null) return 'No test';
        if (ph < 5) return 'Strong Acid';
        if (ph < 7) return 'Weak Acid';
        if (ph === 7) return 'Neutral';
        if (ph < 10) return 'Weak Base';
        return 'Strong Base';
    };

    if (!visible) return null;

    const litmusColor = getLitmusColor(getPH);
    const phLabel = getPhLabel(getPH);

    return (
        <div className="litmus-container">
            <div className="litmus-label">
                <span className="litmus-icon">🧪</span>
                <span className="litmus-title">pH Test</span>
            </div>
            
            <div className="litmus-paper-holder">
                <div 
                    className="litmus-paper"
                    style={{ 
                        background: `linear-gradient(to bottom, ${litmusColor}, ${litmusColor}dd)`,
                    }}
                >
                    <div className="litmus-texture" />
                    {getPH !== null && (
                        <div className="litmus-result">
                            <span className="ph-value">pH {getPH}</span>
                            <span className="ph-label">{phLabel}</span>
                        </div>
                    )}
                </div>
                
                {getPH === null && (
                    <div className="litmus-instruction">
                        <span>Add chemical to test pH</span>
                    </div>
                )}
            </div>

            {/* pH Scale Reference */}
            <div className="ph-scale">
                <div className="ph-scale-bar">
                    <div className="ph-marker" style={{ left: getPH !== null ? `${(getPH / 14) * 100}%` : '50%' }} />
                </div>
                <div className="ph-scale-labels">
                    <span>0</span>
                    <span className="ph-scale-center">7</span>
                    <span>14</span>
                </div>
                <div className="ph-scale-text">
                    <span>Acidic</span>
                    <span>Neutral</span>
                    <span>Basic</span>
                </div>
            </div>
        </div>
    );
}
