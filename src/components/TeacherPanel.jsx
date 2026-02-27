export default function TeacherPanel({ result, visible }) {
    if (!visible || !result) return null;

    return (
        <div className="teacher-panel">
            <h4>📚 Teacher Notes</h4>

            {result.equation && (
                <div className="teacher-equation">
                    <span className="teacher-eq-label">Equation</span>
                    <span className="teacher-eq-value">{result.equation}</span>
                </div>
            )}

            <div className="teacher-risk-breakdown">
                <span className="teacher-eq-label">Risk Level</span>
                <span className={`risk-pill ${result.risk}`}>{result.risk}</span>
            </div>

            {result.type && (
                <div className="teacher-risk-breakdown">
                    <span className="teacher-eq-label">Reaction Type</span>
                    <span className="teacher-eq-value">{result.type}</span>
                </div>
            )}

            <p className="teacher-notes-text">{result.teacher_notes}</p>
        </div>
    );
}
