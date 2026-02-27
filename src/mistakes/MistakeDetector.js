/**
 * MistakeDetector — orchestrates all detection logic.
 * Combines ReactionValidator, GestureAnalyzer, and tracks danger repetition.
 */
import { validateSelection, shouldAllowReaction } from './ReactionValidator';
import { analyzeGestures } from './GestureAnalyzer';
import { logMistake } from './MistakeLogger';

let dangerCount = 0;
let lastMistakeTime = 0;
const DEBOUNCE_MS = 2000; // Don't spam mistakes

/**
 * Run all checks for Live Lab mode.
 * @param {object} params
 * @param {string} params.chemLeft
 * @param {string} params.chemRight
 * @param {Array} params.hands - Array of hand data
 * @param {string} params.status - 'waiting' | 'ready' | 'triggered'
 * @returns {{ mistakes: Array, blocked: boolean }}
 */
export function detectMistakes({ chemLeft, chemRight, hands, status }) {
    const mistakes = [];
    let blocked = false;

    // 1. One hand missing
    if (hands.length < 2 && (chemLeft || chemRight)) {
        mistakes.push({
            type: 'one_hand_missing',
            message: 'Two hands required for mixing.',
            severity: 'info',
        });
        blocked = true;
    }

    // 2. Chemical selection validation
    if (chemLeft || chemRight) {
        const validation = validateSelection(chemLeft, chemRight);
        if (!validation.valid) {
            validation.errors.forEach(e => mistakes.push(e));
            blocked = true;
        }
    }

    // 3. Gesture analysis (only when both hands present)
    // NOTE: gesture warnings are advisory only — they do NOT block the reaction trigger.
    // Blocking on gesture was causing false blocks during normal convergence.
    if (hands.length >= 2) {
        const gestureWarnings = analyzeGestures(hands);
        gestureWarnings.forEach(w => mistakes.push(w));
    }

    // 4. Dangerous repetition — advisory only, never block
    // This is an educational lab; students should be able to repeat reactions.
    if (dangerCount >= 3) {
        mistakes.push({
            type: 'repeated_danger',
            message: 'You have triggered this dangerous reaction multiple times. Be cautious!',
            severity: 'warning',
        });
    }

    return { mistakes, blocked };
}

/**
 * Log a mistake if not debounced. Returns true if logged.
 */
export function logIfNew(mistake) {
    const now = Date.now();
    if (now - lastMistakeTime < DEBOUNCE_MS) return false;
    lastMistakeTime = now;
    logMistake(mistake);
    return true;
}

/** Track a danger reaction trigger */
export function recordDangerTrigger() { dangerCount++; }

/** Reset the danger counter */
export function resetDangerCount() { dangerCount = 0; }

/** Get current danger count */
export function getDangerCount() { return dangerCount; }
