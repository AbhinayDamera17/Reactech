import { useMemo } from 'react';
import { CHEMICALS } from '../chemicals';

/**
 * TestTube component - renders a test tube with chemical liquid
 * Positioned over a tracked hand
 */
export default function TestTube({ hand, chemicalId }) {
    const chemical = useMemo(() => {
        return CHEMICALS.find(c => c.id === chemicalId);
    }, [chemicalId]);

    if (!hand || !chemical) return null;

    // Position test tube at hand center
    const x = hand.cx * 100;
    const y = hand.cy * 100;

    // Chemical colors
    const colorMap = {
        hcl: '#ffeb3b',
        naoh: '#e3f2fd',
        h2so4: '#ff9800',
        na: '#9e9e9e',
        h2o: '#2196f3',
        nahco3: '#ffffff',
        ch3cooh: '#ffc107',
        h2o2: '#b3e5fc',
        kno3: '#f5f5f5',
        agno3: '#e0e0e0',
        nacl: '#ffffff',
        fe: '#795548',
        cuso4: '#2196f3',
        mg: '#bdbdbd',
        zn: '#9e9e9e',
        ca: '#e0e0e0',
        al: '#cfd8dc',
        cu: '#d84315',
        pb: '#616161',
        hno3: '#ffeb3b',
        koh: '#e3f2fd',
        nh3: '#b3e5fc',
        caco3: '#ffffff',
        mno2: '#424242',
        kcl: '#ffffff',
        baco3: '#f5f5f5',
        fecl3: '#ff6f00',
        na2co3: '#ffffff',
        cacl2: '#ffffff',
        pbno3: '#e0e0e0',
        ki: '#fff9c4',
        ba: '#e0e0e0',
        k: '#9e9e9e',
        c: '#212121',
        o2: '#b3e5fc',
    };

    const liquidColor = colorMap[chemicalId] || '#64b5f6';

    return (
        <div
            className="test-tube-container"
            style={{
                left: `${x}%`,
                top: `${y}%`,
            }}
        >
            <div className="test-tube">
                {/* Glass tube */}
                <div className="tube-glass">
                    {/* Liquid inside */}
                    <div 
                        className="tube-liquid"
                        style={{ 
                            backgroundColor: liquidColor,
                            boxShadow: `0 0 20px ${liquidColor}88`
                        }}
                    />
                    {/* Shine effect */}
                    <div className="tube-shine" />
                </div>
                
                {/* Cork/stopper */}
                <div className="tube-cork" />
                
                {/* Label */}
                <div className="tube-label">
                    <div className="tube-label-text">{chemical.formula}</div>
                </div>
            </div>
            
            {/* Hand indicator */}
            <div className="hand-indicator" style={{ color: hand.color }}>
                {hand.side === 'left' ? '🫲' : '🫱'}
            </div>
        </div>
    );
}
