import { CHEMICALS } from '../chemicals';

export default function ChemicalOverlay({ hands, chemLeft, chemRight }) {
    const getLabel = (id) => {
        const c = CHEMICALS.find(c => c.id === id);
        return c ? c.formula : '—';
    };

    return (
        <div className="chemical-overlay">
            {hands.map((hand, i) => {
                const chemId = hand.side === 'left' ? chemLeft : chemRight;
                const label = chemId ? getLabel(chemId) : 'No chemical';
                return (
                    <div
                        key={i}
                        className={`chem-label ${hand.side} ${chemId ? 'assigned' : ''}`}
                        style={{
                            left: `${hand.topX * 100}%`,
                            top: `${hand.topY * 100 - 6}%`,
                        }}
                    >
                        <span className="chem-label-hand">{hand.side === 'left' ? '🫲' : '🫱'}</span>
                        <span className="chem-label-text">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}
