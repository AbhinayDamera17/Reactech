export default function RiskBadge({ risk }) {
    return (
        <span className={`risk-badge-guide ${risk}`}>
            {risk === 'danger' && <span className="pulse-dot" />}
            {risk}
        </span>
    );
}
