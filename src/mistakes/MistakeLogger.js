/**
 * MistakeLogger — session-based mistake history.
 */

let log = [];
let listeners = [];

/** Add a mistake to the session log */
export function logMistake(entry) {
    const record = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        ...entry,
    };
    log.push(record);
    // Cap at 50 entries
    if (log.length > 50) log.shift();
    listeners.forEach(fn => fn([...log]));
    return record;
}

/** Get all logged mistakes */
export function getMistakes() { return [...log]; }

/** Clear the session log */
export function clearMistakes() { log = []; listeners.forEach(fn => fn([])); }

/** Subscribe to log changes */
export function onLogChange(fn) {
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
}

/** Get mistake summary stats */
export function getMistakeStats() {
    const counts = { warning: 0, danger: 0, info: 0 };
    log.forEach(m => { counts[m.severity] = (counts[m.severity] || 0) + 1; });
    return { total: log.length, ...counts };
}
